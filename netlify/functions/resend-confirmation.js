const crypto = require('crypto');

// Environment validation
function validateEnv() {
    const required = ['AIRTABLE_API_KEY', 'AIRTABLE_BASE_ID', 'MAILGUN_API_KEY', 'MAILGUN_DOMAIN'];
    const missing = required.filter(varName => !process.env[varName]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

// Input validation
function validateResendData(data) {
    const errors = [];
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        errors.push('Valid email address is required');
    }
    
    if (!['fr', 'en'].includes(data.language)) {
        errors.push('Language must be fr or en');
    }
    
    return errors;
}

// Find pending signup in Airtable
async function findPendingSignup(email) {
    const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env;
    
    const filterFormula = `AND({email} = "${email.toLowerCase()}", {status} = "pending")`;
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/BetaSignups?filterByFormula=${encodeURIComponent(filterFormula)}`;
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`
        }
    });
    
    if (!response.ok) {
        throw new Error(`Airtable error: ${response.status}`);
    }
    
    const result = await response.json();
    return result.records.length > 0 ? result.records[0] : null;
}

// Update signup record with new confirmation token
async function updateSignupRecord(recordId, resendCount) {
    const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env;
    
    const confirmationToken = crypto.randomUUID();
    const tokenHash = crypto.createHash('sha256').update(confirmationToken).digest('hex');
    
    const updateData = {
        fields: {
            confirmationTokenHash: tokenHash,
            confirmationExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            resendCount: resendCount + 1,
            lastResendAt: new Date().toISOString()
        }
    };
    
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/BetaSignups/${recordId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
        throw new Error(`Airtable update error: ${response.status}`);
    }
    
    return confirmationToken;
}

// Send confirmation email
async function sendConfirmationEmail(email, language, confirmationToken) {
    const { MAILGUN_API_KEY, MAILGUN_DOMAIN } = process.env;
    
    const confirmationUrl = `https://emoty.netlify.app/.netlify/functions/confirm-signup?token=${confirmationToken}`;
    const unsubscribeUrl = `https://emoty.netlify.app/unsubscribe?email=${encodeURIComponent(email)}`;
    
    const templates = {
        fr: {
            subject: '[Rappel] Confirmez votre inscription au programme beta d\'Emoty',
            text: `Bonjour,

Ceci est un rappel pour confirmer votre inscription au programme beta d'Emoty.

Confirmez votre adresse email en cliquant sur ce lien :
${confirmationUrl}

IMPORTANT : Ce nouveau lien expire dans 48 heures.

--
Emoty - Créateur de Motifs d'Emojis
Se désinscrire : ${unsubscribeUrl}`
        },
        en: {
            subject: '[Reminder] Please confirm your Emoty beta program signup',
            text: `Hello,

This is a reminder to confirm your Emoty beta program signup.

Please confirm your email address by clicking this link:
${confirmationUrl}

IMPORTANT: This new link expires in 48 hours.

--
Emoty - Emoji Pattern Creator
Unsubscribe: ${unsubscribeUrl}`
        }
    };
    
    const template = templates[language] || templates.en;
    
    const formData = new FormData();
    formData.append('from', 'Emoty Beta Program <beta@' + MAILGUN_DOMAIN + '>');
    formData.append('to', email);
    formData.append('subject', template.subject);
    formData.append('text', template.text);
    formData.append('h:List-Unsubscribe', `<${unsubscribeUrl}>`);
    
    const response = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')
        },
        body: formData
    });
    
    if (!response.ok) {
        throw new Error(`Mailgun error: ${response.status}`);
    }
    
    return await response.json();
}

// Main handler
exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': 'https://emoty.fr',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };
    
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }
    
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
        validateEnv();
        
        const data = JSON.parse(event.body);
        
        const validationErrors = validateResendData(data);
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
        
        // Find pending signup
        const signup = await findPendingSignup(data.email);
        if (!signup) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'SIGNUP_NOT_FOUND',
                    message: 'No pending signup found for this email'
                })
            };
        }
        
        // Check if signup has expired
        const expiresAt = new Date(signup.fields.confirmationExpiresAt);
        if (expiresAt < new Date()) {
            return {
                statusCode: 410,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'SIGNUP_EXPIRED',
                    message: 'Signup confirmation has expired. Please register again.'
                })
            };
        }
        
        // Check resend limit
        const resendCount = signup.fields.resendCount || 0;
        if (resendCount >= 5) {
            return {
                statusCode: 429,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'RESEND_LIMITED',
                    message: 'Maximum resend attempts reached. Please try again later.',
                    retryAfter: 3600
                })
            };
        }
        
        // Update record and get new token
        const confirmationToken = await updateSignupRecord(signup.id, resendCount);
        
        // Send confirmation email
        await sendConfirmationEmail(data.email, data.language, confirmationToken);
        
        console.log('Confirmation resent:', { 
            email: data.email, 
            language: data.language, 
            resendCount: resendCount + 1 
        });
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Confirmation email resent',
                data: {
                    email: data.email,
                    language: data.language,
                    confirmationSent: true,
                    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
                    resendCount: resendCount + 1
                }
            })
        };
        
    } catch (error) {
        console.error('Resend confirmation error:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'SERVER_ERROR',
                message: 'Internal server error occurred'
            })
        };
    }
};