const crypto = require('crypto');

// Environment validation
const requiredEnvVars = [
    'AIRTABLE_API_KEY',
    'AIRTABLE_BASE_ID',
    'MAILGUN_API_KEY',
    'MAILGUN_DOMAIN'
];

// Validate environment variables
function validateEnv() {
    const missing = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

// Input validation
function validateSignupData(data) {
    const errors = [];
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        errors.push('Valid email address is required');
    }
    
    // Consent validation (GDPR requirement)
    if (data.consent !== true) {
        errors.push('Consent is required for beta signup');
    }
    
    // Language validation
    if (!['fr', 'en'].includes(data.language)) {
        errors.push('Language must be fr or en');
    }
    
    // Source validation
    if (data.source !== 'beta_signup') {
        errors.push('Invalid signup source');
    }
    
    return errors;
}

// Rate limiting check (simple in-memory for serverless)
const rateLimitStore = new Map();
function checkRateLimit(email, ip) {
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour
    const maxRequests = 5;
    
    const key = `${email}:${ip}`;
    const requests = rateLimitStore.get(key) || [];
    
    // Clean old requests
    const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
    
    if (validRequests.length >= maxRequests) {
        return false; // Rate limited
    }
    
    validRequests.push(now);
    rateLimitStore.set(key, validRequests);
    
    return true; // Not rate limited
}

// Airtable integration
async function saveToAirtable(signupData) {
    const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env;
    
    const confirmationToken = crypto.randomUUID();
    const tokenHash = crypto.createHash('sha256').update(confirmationToken).digest('hex');
    
    const record = {
        fields: {
            email: signupData.email.toLowerCase(),
            language: signupData.language,
            consent: signupData.consent,
            consentTimestamp: new Date().toISOString(),
            consentIpAddress: signupData.ipAddress,
            source: signupData.source,
            confirmationTokenHash: tokenHash,
            confirmationExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            resendCount: 0
        }
    };
    
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/BetaSignups`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(record)
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Airtable error: ${error}`);
    }
    
    const result = await response.json();
    return { recordId: result.id, confirmationToken };
}

// Email sending via Mailgun
async function sendConfirmationEmail(email, language, confirmationToken) {
    const { MAILGUN_API_KEY, MAILGUN_DOMAIN } = process.env;
    
    const confirmationUrl = `https://emoty.netlify.app/.netlify/functions/confirm-signup?token=${confirmationToken}`;
    const unsubscribeUrl = `https://emoty.netlify.app/unsubscribe?email=${encodeURIComponent(email)}`;
    
    const templates = {
        fr: {
            subject: 'Confirmez votre inscription au programme beta d\'Emoty',
            text: `Bonjour,

Merci de votre intérêt pour le programme beta d'Emoty !

Pour finaliser votre inscription, confirmez votre adresse email :
${confirmationUrl}

IMPORTANT : Ce lien expire dans 48 heures.

Si vous n'avez pas demandé cette inscription, ignorez cet email.

--
Emoty - Créateur de Motifs d'Emojis
Se désinscrire : ${unsubscribeUrl}`,
            html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #667eea;">Confirmez votre inscription</h1>
    <p>Bonjour,</p>
    <p>Merci de votre intérêt pour le programme beta d'Emoty !</p>
    <div style="text-align: center; margin: 30px 0;">
        <a href="${confirmationUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 30px; display: inline-block;">✅ Confirmer mon inscription</a>
    </div>
    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <strong>⏰ Important :</strong> Ce lien expire dans 48 heures.
    </div>
    <p>Si vous n'avez pas demandé cette inscription, ignorez cet email.</p>
    <p style="font-size: 0.8em; color: #666;">
        <a href="${unsubscribeUrl}">Se désinscrire</a> | 
        <a href="https://emoty.fr/privacy-policy">Politique de confidentialité</a>
    </p>
</div>`
        },
        en: {
            subject: 'Please confirm your Emoty beta program signup',
            text: `Hello,

Thank you for your interest in the Emoty beta program!

To complete your registration, please confirm your email address:
${confirmationUrl}

IMPORTANT: This link expires in 48 hours.

If you didn't request this signup, you can safely ignore this email.

--
Emoty - Emoji Pattern Creator
Unsubscribe: ${unsubscribeUrl}`,
            html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #667eea;">Confirm Your Signup</h1>
    <p>Hello,</p>
    <p>Thank you for your interest in the Emoty beta program!</p>
    <div style="text-align: center; margin: 30px 0;">
        <a href="${confirmationUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 30px; display: inline-block;">✅ Confirm My Signup</a>
    </div>
    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <strong>⏰ Important:</strong> This link expires in 48 hours.
    </div>
    <p>If you didn't request this signup, you can safely ignore this email.</p>
    <p style="font-size: 0.8em; color: #666;">
        <a href="${unsubscribeUrl}">Unsubscribe</a> | 
        <a href="https://emoty.fr/en-GB/privacy-policy">Privacy Policy</a>
    </p>
</div>`
        }
    };
    
    const template = templates[language] || templates.en;
    
    const formData = new FormData();
    formData.append('from', 'Emoty Beta Program <beta@' + MAILGUN_DOMAIN + '>');
    formData.append('to', email);
    formData.append('subject', template.subject);
    formData.append('text', template.text);
    formData.append('html', template.html);
    formData.append('h:List-Unsubscribe', `<${unsubscribeUrl}>`);
    
    const response = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')
        },
        body: formData
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Mailgun error: ${error}`);
    }
    
    return await response.json();
}

// Main handler
exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': 'https://emoty.fr',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };
    
    // Handle preflight request
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }
    
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'METHOD_NOT_ALLOWED',
                message: 'Only POST method is allowed'
            })
        };
    }
    
    try {
        // Validate environment
        validateEnv();
        
        // Parse request body
        const data = JSON.parse(event.body);
        
        // Validate input data
        const validationErrors = validateSignupData(data);
        if (validationErrors.length > 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'VALIDATION_ERROR',
                    message: validationErrors.join(', ')
                })
            };
        }
        
        // Get IP address for rate limiting
        const ipAddress = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';
        
        // Check rate limiting
        if (!checkRateLimit(data.email, ipAddress)) {
            return {
                statusCode: 429,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'RATE_LIMITED',
                    message: 'Too many signup attempts. Please try again later.',
                    retryAfter: 3600
                })
            };
        }
        
        // Add IP address to data
        const signupData = { ...data, ipAddress };
        
        // Save to Airtable and get confirmation token
        const { recordId, confirmationToken } = await saveToAirtable(signupData);
        
        // Send confirmation email
        await sendConfirmationEmail(data.email, data.language, confirmationToken);
        
        console.log('Beta signup successful:', { email: data.email, language: data.language, recordId });
        
        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Confirmation email sent',
                data: {
                    email: data.email,
                    language: data.language,
                    confirmationSent: true,
                    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
                }
            })
        };
        
    } catch (error) {
        console.error('Beta signup error:', error);
        
        // Don't expose internal errors to client
        const isValidationError = error.message.includes('Missing required') || 
                                 error.message.includes('Airtable') ||
                                 error.message.includes('Mailgun');
        
        return {
            statusCode: isValidationError ? 400 : 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'SERVER_ERROR',
                message: isValidationError ? error.message : 'Internal server error occurred'
            })
        };
    }
};