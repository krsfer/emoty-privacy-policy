const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    /**
     * Initialize email transporter based on environment configuration
     */
    initializeTransporter() {
        try {
            if (process.env.SENDGRID_API_KEY) {
                // SendGrid configuration
                this.transporter = nodemailer.createTransport({
                    service: 'SendGrid',
                    auth: {
                        user: 'apikey',
                        pass: process.env.SENDGRID_API_KEY
                    }
                });
                logger.info('Email service initialized with SendGrid');
                
            } else if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
                // AWS SES configuration
                const aws = require('aws-sdk');
                aws.config.update({
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                    region: process.env.AWS_REGION || 'us-east-1'
                });
                
                this.transporter = nodemailer.createTransport({
                    SES: new aws.SES({ apiVersion: '2010-12-01' })
                });
                logger.info('Email service initialized with AWS SES');
                
            } else if (process.env.SMTP_HOST) {
                // SMTP configuration
                this.transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: parseInt(process.env.SMTP_PORT) || 587,
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD
                    },
                    tls: {
                        rejectUnauthorized: process.env.NODE_ENV === 'production'
                    }
                });
                logger.info('Email service initialized with SMTP');
                
            } else {
                logger.warn('No email configuration found. Email sending will be simulated.');
                this.transporter = null;
            }
            
        } catch (error) {
            logger.error('Failed to initialize email service:', error);
            this.transporter = null;
        }
    }

    /**
     * Send confirmation email
     * @param {string} email - Recipient email address
     * @param {string} language - Language (fr/en)
     * @param {string} confirmationToken - Confirmation token
     * @returns {Promise<boolean>} Success status
     */
    async sendConfirmationEmail(email, language, confirmationToken) {
        try {
            if (!this.transporter) {
                logger.info(`Email simulation: Confirmation email to ${email} (${language})`);
                return true; // Simulate success
            }

            const confirmationUrl = `${process.env.CONFIRMATION_URL || 'https://emoty.fr/api/confirm-signup'}?token=${confirmationToken}`;
            const unsubscribeUrl = `${process.env.UNSUBSCRIBE_URL || 'https://emoty.fr/unsubscribe'}?email=${encodeURIComponent(email)}`;
            
            const emailContent = this.getConfirmationEmailContent(language, {
                email,
                confirmationUrl,
                unsubscribeUrl,
                expiryTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US'),
                currentYear: new Date().getFullYear()
            });

            const mailOptions = {
                from: {
                    name: process.env.SENDGRID_FROM_NAME || process.env.SES_FROM_NAME || 'Emoty Beta Program',
                    address: process.env.SENDGRID_FROM_EMAIL || process.env.SES_FROM_EMAIL || process.env.SMTP_USER
                },
                to: email,
                subject: emailContent.subject,
                html: emailContent.html,
                text: emailContent.text,
                headers: {
                    'List-Unsubscribe': `<${unsubscribeUrl}>`,
                    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
                }
            };

            const result = await this.transporter.sendMail(mailOptions);
            
            logger.info('Confirmation email sent successfully', {
                email,
                language,
                messageId: result.messageId
            });
            
            return true;
            
        } catch (error) {
            logger.error('Failed to send confirmation email:', {
                email,
                language,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Get confirmation email content based on language
     * @param {string} language - Language (fr/en)
     * @param {Object} variables - Template variables
     * @returns {Object} Email content
     */
    getConfirmationEmailContent(language, variables) {
        const templates = {
            fr: {
                subject: 'Confirmez votre inscription au programme beta d\'Emoty',
                html: this.getFrenchHtmlTemplate(variables),
                text: this.getFrenchTextTemplate(variables)
            },
            en: {
                subject: 'Please confirm your Emoty beta program signup',
                html: this.getEnglishHtmlTemplate(variables),
                text: this.getEnglishTextTemplate(variables)
            }
        };

        return templates[language] || templates.en;
    }

    /**
     * French HTML email template
     */
    getFrenchHtmlTemplate(vars) {
        return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmez votre inscription - Emoty</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
        .email-container { background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-family: 'Inter', sans-serif; font-size: 2em; font-weight: 300; color: #667eea; letter-spacing: 0.2em; margin-bottom: 10px; }
        .confirmation-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 30px; font-size: 1.1em; font-weight: 500; margin: 20px 0; }
        .important-info { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #666; }
        .unsubscribe { font-size: 0.8em; color: #999; }
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
            <a href="${vars.confirmationUrl}" class="confirmation-button">
                ✅ Confirmer mon inscription
            </a>
        </div>
        
        <div class="important-info">
            <strong>⏰ Important :</strong> Ce lien de confirmation expire dans 48 heures (${vars.expiryTime}). Si vous ne confirmez pas avant cette date, vous devrez vous inscrire à nouveau.
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
            
            <p>© ${vars.currentYear} Christopher Archer • Tous droits réservés</p>
            
            <p class="unsubscribe">
                <a href="${vars.unsubscribeUrl}">Se désinscrire</a> | 
                <a href="https://emoty.fr/privacy-policy">Politique de confidentialité</a>
            </p>
        </div>
    </div>
</body>
</html>`;
    }

    /**
     * French text email template
     */
    getFrenchTextTemplate(vars) {
        return `EMOTY - Confirmez votre inscription au programme beta

Bonjour,

Merci de votre intérêt pour le programme beta d'Emoty ! 

Pour finaliser votre inscription, veuillez confirmer votre adresse email en cliquant sur ce lien :
${vars.confirmationUrl}

IMPORTANT : Ce lien expire dans 48 heures (${vars.expiryTime}).

En tant que beta testeur, vous aurez accès en avant-première aux nouvelles fonctionnalités d'Emoty.

Si vous n'avez pas demandé cette inscription, ignorez cet email.

--
Emoty - Créateur de Motifs d'Emojis
© ${vars.currentYear} Christopher Archer

Se désinscrire : ${vars.unsubscribeUrl}
Politique de confidentialité : https://emoty.fr/privacy-policy`;
    }

    /**
     * English HTML email template
     */
    getEnglishHtmlTemplate(vars) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Your Signup - Emoty</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
        .email-container { background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-family: 'Inter', sans-serif; font-size: 2em; font-weight: 300; color: #667eea; letter-spacing: 0.2em; margin-bottom: 10px; }
        .confirmation-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 30px; font-size: 1.1em; font-weight: 500; margin: 20px 0; }
        .important-info { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #666; }
        .unsubscribe { font-size: 0.8em; color: #999; }
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
            <a href="${vars.confirmationUrl}" class="confirmation-button">
                ✅ Confirm My Signup
            </a>
        </div>
        
        <div class="important-info">
            <strong>⏰ Important:</strong> This confirmation link expires in 48 hours (${vars.expiryTime}). If you don't confirm before then, you'll need to sign up again.
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
            
            <p>© ${vars.currentYear} Christopher Archer • All rights reserved</p>
            
            <p class="unsubscribe">
                <a href="${vars.unsubscribeUrl}">Unsubscribe</a> | 
                <a href="https://emoty.fr/en-GB/privacy-policy">Privacy Policy</a>
            </p>
        </div>
    </div>
</body>
</html>`;
    }

    /**
     * English text email template
     */
    getEnglishTextTemplate(vars) {
        return `EMOTY - Please confirm your beta program signup

Hello,

Thank you for your interest in the Emoty beta program!

To complete your registration, please confirm your email address by clicking this link:
${vars.confirmationUrl}

IMPORTANT: This link expires in 48 hours (${vars.expiryTime}).

As a beta tester, you'll get early access to exciting new Emoty features.

If you didn't request this signup, you can safely ignore this email.

--
Emoty - Emoji Pattern Creator
© ${vars.currentYear} Christopher Archer

Unsubscribe: ${vars.unsubscribeUrl}
Privacy Policy: https://emoty.fr/en-GB/privacy-policy`;
    }

    /**
     * Test email configuration
     * @returns {Promise<boolean>} True if configuration is working
     */
    async testConnection() {
        try {
            if (!this.transporter) {
                logger.info('Email service not configured, will use simulation mode');
                return true;
            }
            
            await this.transporter.verify();
            logger.info('Email service connection test successful');
            return true;
            
        } catch (error) {
            logger.error('Email service connection test failed:', error);
            return false;
        }
    }
}

module.exports = new EmailService();