# Emoty Beta Signup Email Templates

## Template Overview
GDPR-compliant email templates for double opt-in beta signup confirmation process.

## Template Variables
- `{{email}}` - User's email address
- `{{confirmationUrl}}` - Confirmation link with token
- `{{unsubscribeUrl}}` - Unsubscribe link
- `{{expiryTime}}` - Confirmation expiry time (48 hours)
- `{{currentYear}}` - Current year for copyright

---

## French Confirmation Email

### Subject Line
```
Confirmez votre inscription au programme beta d'Emoty
```

### HTML Template
```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmez votre inscription - Emoty</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .email-container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-family: 'Inter', sans-serif;
            font-size: 2em;
            font-weight: 300;
            color: #667eea;
            letter-spacing: 0.2em;
            margin-bottom: 10px;
        }
        .confirmation-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 30px;
            font-size: 1.1em;
            font-weight: 500;
            margin: 20px 0;
            text-align: center;
        }
        .important-info {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 0.9em;
            color: #666;
        }
        .unsubscribe {
            font-size: 0.8em;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">e m o t y 💬</div>
            <h1>Confirmez votre inscription</h1>
        </div>
        
        <p>Bonjour,</p>
        
        <p>Merci de votre intérêt pour le programme beta d'Emoty ! Pour finaliser votre inscription et commencer à recevoir des invitations aux tests beta, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
        
        <div style="text-align: center;">
            <a href="{{confirmationUrl}}" class="confirmation-button">
                ✅ Confirmer mon inscription
            </a>
        </div>
        
        <div class="important-info">
            <strong>⏰ Important :</strong> Ce lien de confirmation expire dans 48 heures ({{expiryTime}}). Si vous ne confirmez pas avant cette date, vous devrez vous inscrire à nouveau.
        </div>
        
        <p>En tant que beta testeur d'Emoty, vous aurez accès en avant-première aux nouvelles fonctionnalités :</p>
        <ul>
            <li>🎨 Nouvelles palettes d'emojis</li>
            <li>🤖 Améliorations de l'assistant IA</li>
            <li>🎵 Commandes vocales étendues</li>
            <li>📱 Fonctionnalités expérimentales</li>
        </ul>
        
        <p>Si vous n'avez pas demandé cette inscription, vous pouvez ignorer cet email en toute sécurité.</p>
        
        <div class="footer">
            <p><strong>Emoty - Créateur de Motifs d'Emojis</strong><br>
            Créez de magnifiques motifs d'emojis avec l'aide de l'IA</p>
            
            <p>© {{currentYear}} Christopher Archer • Tous droits réservés</p>
            
            <p class="unsubscribe">
                <a href="{{unsubscribeUrl}}">Se désinscrire</a> | 
                <a href="https://emoty.fr/privacy-policy">Politique de confidentialité</a>
            </p>
        </div>
    </div>
</body>
</html>
```

### Plain Text Template
```
EMOTY - Confirmez votre inscription au programme beta

Bonjour,

Merci de votre intérêt pour le programme beta d'Emoty ! 

Pour finaliser votre inscription, veuillez confirmer votre adresse email en cliquant sur ce lien :
{{confirmationUrl}}

IMPORTANT : Ce lien expire dans 48 heures ({{expiryTime}}).

En tant que beta testeur, vous aurez accès en avant-première aux nouvelles fonctionnalités d'Emoty.

Si vous n'avez pas demandé cette inscription, ignorez cet email.

--
Emoty - Créateur de Motifs d'Emojis
© {{currentYear}} Christopher Archer

Se désinscrire : {{unsubscribeUrl}}
Politique de confidentialité : https://emoty.fr/privacy-policy
```

---

## English Confirmation Email

### Subject Line
```
Please confirm your Emoty beta program signup
```

### HTML Template
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Your Signup - Emoty</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .email-container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-family: 'Inter', sans-serif;
            font-size: 2em;
            font-weight: 300;
            color: #667eea;
            letter-spacing: 0.2em;
            margin-bottom: 10px;
        }
        .confirmation-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 30px;
            font-size: 1.1em;
            font-weight: 500;
            margin: 20px 0;
            text-align: center;
        }
        .important-info {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 0.9em;
            color: #666;
        }
        .unsubscribe {
            font-size: 0.8em;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">e m o t y 💬</div>
            <h1>Confirm Your Signup</h1>
        </div>
        
        <p>Hello,</p>
        
        <p>Thank you for your interest in the Emoty beta program! To complete your registration and start receiving beta test invitations, please confirm your email address by clicking the button below:</p>
        
        <div style="text-align: center;">
            <a href="{{confirmationUrl}}" class="confirmation-button">
                ✅ Confirm My Signup
            </a>
        </div>
        
        <div class="important-info">
            <strong>⏰ Important:</strong> This confirmation link expires in 48 hours ({{expiryTime}}). If you don't confirm before then, you'll need to sign up again.
        </div>
        
        <p>As an Emoty beta tester, you'll get early access to exciting new features:</p>
        <ul>
            <li>🎨 New emoji palettes</li>
            <li>🤖 AI assistant improvements</li>
            <li>🎵 Extended voice commands</li>
            <li>📱 Experimental features</li>
        </ul>
        
        <p>If you didn't request this signup, you can safely ignore this email.</p>
        
        <div class="footer">
            <p><strong>Emoty - Emoji Pattern Creator</strong><br>
            Create beautiful emoji patterns with AI assistance</p>
            
            <p>© {{currentYear}} Christopher Archer • All rights reserved</p>
            
            <p class="unsubscribe">
                <a href="{{unsubscribeUrl}}">Unsubscribe</a> | 
                <a href="https://emoty.fr/en-GB/privacy-policy">Privacy Policy</a>
            </p>
        </div>
    </div>
</body>
</html>
```

### Plain Text Template
```
EMOTY - Please confirm your beta program signup

Hello,

Thank you for your interest in the Emoty beta program!

To complete your registration, please confirm your email address by clicking this link:
{{confirmationUrl}}

IMPORTANT: This link expires in 48 hours ({{expiryTime}}).

As a beta tester, you'll get early access to exciting new Emoty features.

If you didn't request this signup, you can safely ignore this email.

--
Emoty - Emoji Pattern Creator
© {{currentYear}} Christopher Archer

Unsubscribe: {{unsubscribeUrl}}
Privacy Policy: https://emoty.fr/en-GB/privacy-policy
```

---

## Email Configuration

### SMTP Headers
```
From: "Emoty Beta Program" <beta@emoty.fr>
Reply-To: support@emoty.fr
List-Unsubscribe: <{{unsubscribeUrl}}>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
Return-Path: bounce@emoty.fr
```

### Tracking Parameters (Optional)
Add UTM parameters to confirmation URL for analytics:
```
{{confirmationUrl}}?utm_source=email&utm_medium=confirmation&utm_campaign=beta_signup
```

### Email Service Integration Examples

#### SendGrid Integration
```javascript
const sgMail = require('@sendgrid/mail');

const sendConfirmationEmail = async (email, language, confirmationToken) => {
    const templateId = language === 'fr' ? 'd-french-template-id' : 'd-english-template-id';
    
    const msg = {
        to: email,
        from: { 
            email: 'beta@emoty.fr', 
            name: 'Emoty Beta Program' 
        },
        templateId: templateId,
        dynamicTemplateData: {
            email: email,
            confirmationUrl: `https://emoty.fr/api/confirm-signup?token=${confirmationToken}`,
            unsubscribeUrl: `https://emoty.fr/api/unsubscribe?email=${encodeURIComponent(email)}`,
            expiryTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleString(),
            currentYear: new Date().getFullYear()
        },
        trackingSettings: {
            clickTracking: { enable: true },
            openTracking: { enable: true }
        }
    };
    
    await sgMail.send(msg);
};
```

#### AWS SES Integration
```javascript
const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-east-1' });

const sendConfirmationEmail = async (email, language, confirmationToken) => {
    const templateName = language === 'fr' ? 'EmotypaConfirmationFR' : 'EmotyBetaConfirmationEN';
    
    const params = {
        Source: 'Emoty Beta Program <beta@emoty.fr>',
        Template: templateName,
        Destination: {
            ToAddresses: [email]
        },
        TemplateData: JSON.stringify({
            email: email,
            confirmationUrl: `https://emoty.fr/api/confirm-signup?token=${confirmationToken}`,
            unsubscribeUrl: `https://emoty.fr/api/unsubscribe?email=${encodeURIComponent(email)}`,
            expiryTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleString(),
            currentYear: new Date().getFullYear()
        })
    };
    
    await ses.sendTemplatedEmail(params).promise();
};
```

### Email Testing Checklist

1. **Template Rendering:**
   - Test variable substitution
   - Check formatting in various email clients
   - Verify responsive design on mobile

2. **Links and Tracking:**
   - Confirm confirmation URLs work
   - Test unsubscribe functionality
   - Verify tracking pixels (if used)

3. **Deliverability:**
   - Check SPF, DKIM, DMARC records
   - Test with major email providers
   - Monitor bounce and spam rates

4. **GDPR Compliance:**
   - Ensure unsubscribe is prominent
   - Include privacy policy links
   - Test one-click unsubscribe

5. **Localization:**
   - Verify correct language selection
   - Test special characters rendering
   - Check date/time formatting