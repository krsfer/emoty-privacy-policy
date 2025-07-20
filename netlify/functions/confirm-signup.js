const crypto = require('crypto');

// Environment validation
function validateEnv() {
    const required = ['AIRTABLE_API_KEY', 'AIRTABLE_BASE_ID'];
    const missing = required.filter(varName => !process.env[varName]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

// Find signup by confirmation token hash
async function findSignupByToken(token) {
    const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env;
    
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const filterFormula = `AND({confirmationTokenHash} = "${tokenHash}", {status} = "pending")`;
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

// Confirm signup
async function confirmSignup(recordId) {
    const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env;
    
    const updateData = {
        fields: {
            status: 'confirmed',
            confirmedAt: new Date().toISOString()
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
    
    return await response.json();
}

// Generate HTML responses
function getSuccessPage(language) {
    const content = {
        fr: {
            title: 'Inscription Confirmée - Emoty',
            heading: '✅ Inscription Confirmée !',
            message: 'Merci de rejoindre le programme beta d\'Emoty.',
            redirect: 'Redirection vers emoty.fr...',
            link: 'Retourner à Emoty'
        },
        en: {
            title: 'Signup Confirmed - Emoty',
            heading: '✅ Signup Confirmed!',
            message: 'Thank you for joining the Emoty beta program.',
            redirect: 'Redirecting to emoty.fr...',
            link: 'Return to Emoty'
        }
    };
    
    const lang = content[language] || content.en;
    const redirectUrl = language === 'fr' ? 'https://emoty.fr' : 'https://emoty.fr/en-GB/';
    
    return `<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${lang.title}</title>
    <meta http-equiv="refresh" content="3;url=${redirectUrl}">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            text-align: center;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .logo {
            font-family: 'Inter', sans-serif;
            font-size: 2em;
            font-weight: 300;
            color: #667eea;
            letter-spacing: 0.2em;
            margin-bottom: 20px;
        }
        h1 {
            color: #28a745;
            margin-bottom: 20px;
        }
        .button {
            display: inline-block;
            background: #667eea;
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 30px;
            margin-top: 20px;
            transition: background 0.3s;
        }
        .button:hover {
            background: #764ba2;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">e m o t y 💬</div>
        <h1>${lang.heading}</h1>
        <p>${lang.message}</p>
        <p><em>${lang.redirect}</em></p>
        <a href="${redirectUrl}" class="button">${lang.link}</a>
    </div>
</body>
</html>`;
}

function getErrorPage(error, language = 'en') {
    const content = {
        fr: {
            title: 'Erreur de Confirmation - Emoty',
            invalid: {
                heading: '❌ Lien de Confirmation Invalide',
                message: 'Ce lien de confirmation est invalide ou malformé.'
            },
            expired: {
                heading: '⏰ Lien de Confirmation Expiré',
                message: 'Ce lien de confirmation a expiré (limite de 48 heures).',
                note: 'Veuillez vous inscrire à nouveau sur notre site web.'
            },
            link: 'Retourner à Emoty'
        },
        en: {
            title: 'Confirmation Error - Emoty',
            invalid: {
                heading: '❌ Invalid Confirmation Link',
                message: 'This confirmation link is invalid or malformed.'
            },
            expired: {
                heading: '⏰ Confirmation Link Expired',
                message: 'This confirmation link has expired (48 hour limit).',
                note: 'Please sign up again on our website.'
            },
            link: 'Return to Emoty'
        }
    };
    
    const lang = content[language] || content.en;
    const errorContent = lang[error] || lang.invalid;
    const redirectUrl = language === 'fr' ? 'https://emoty.fr' : 'https://emoty.fr/en-GB/';
    
    return `<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${lang.title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            text-align: center;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .logo {
            font-family: 'Inter', sans-serif;
            font-size: 2em;
            font-weight: 300;
            color: #667eea;
            letter-spacing: 0.2em;
            margin-bottom: 20px;
        }
        h1 {
            color: #dc3545;
            margin-bottom: 20px;
        }
        .button {
            display: inline-block;
            background: #667eea;
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 30px;
            margin-top: 20px;
            transition: background 0.3s;
        }
        .button:hover {
            background: #764ba2;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">e m o t y 💬</div>
        <h1>${errorContent.heading}</h1>
        <p>${errorContent.message}</p>
        ${errorContent.note ? `<p>${errorContent.note}</p>` : ''}
        <a href="${redirectUrl}" class="button">${lang.link}</a>
    </div>
</body>
</html>`;
}

// Main handler
exports.handler = async (event, context) => {
    try {
        validateEnv();
        
        // Get confirmation token from query parameters
        const token = event.queryStringParameters?.token;
        
        if (!token) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'text/html; charset=utf-8' },
                body: getErrorPage('invalid')
            };
        }
        
        // Validate token format (should be UUID v4)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(token)) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'text/html; charset=utf-8' },
                body: getErrorPage('invalid')
            };
        }
        
        // Find signup by token
        const signup = await findSignupByToken(token);
        if (!signup) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'text/html; charset=utf-8' },
                body: getErrorPage('invalid')
            };
        }
        
        // Check if token has expired
        const expiresAt = new Date(signup.fields.confirmationExpiresAt);
        if (expiresAt < new Date()) {
            return {
                statusCode: 410,
                headers: { 'Content-Type': 'text/html; charset=utf-8' },
                body: getErrorPage('expired', signup.fields.language)
            };
        }
        
        // Confirm the signup
        await confirmSignup(signup.id);
        
        console.log('Signup confirmed:', { 
            email: signup.fields.email, 
            language: signup.fields.language,
            recordId: signup.id
        });
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
            body: getSuccessPage(signup.fields.language)
        };
        
    } catch (error) {
        console.error('Confirmation error:', error);
        
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
            body: getErrorPage('invalid')
        };
    }
};