const express = require('express');
const router = express.Router();
const confirmationService = require('../services/confirmationService');
const logger = require('../utils/logger');

// Beta signup endpoint
router.post('/beta-signup', async (req, res) => {
    try {
        let { email, consent, language, source, timestamp, username } = req.body;
        
        // Basic validation
        if (!email || !consent || !language) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                message: 'Email, consent, and language are required'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                message: 'Invalid email format'
            });
        }

        // Language validation
        if (!['fr', 'en'].includes(language)) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                message: 'Language must be fr or en'
            });
        }

        // Username validation (optional but if provided, must be valid)
        if (username !== undefined && username !== null) {
            const trimmedUsername = username.trim();
            if (trimmedUsername.length > 50) {
                return res.status(400).json({
                    success: false,
                    error: 'VALIDATION_ERROR',
                    message: 'Username must be 50 characters or less'
                });
            }
            // Allow empty string to be converted to undefined
            if (trimmedUsername.length === 0) {
                username = undefined;
            } else {
                username = trimmedUsername;
            }
        }

        // Prepare signup data
        const signupData = {
            email,
            language,
            username: username ? username.trim() : undefined,
            source: source || 'beta_signup',
            timestamp: timestamp || new Date().toISOString(),
            consent: consent === true,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent') || 'unknown'
        };

        // Log the signup attempt
        logger.info('Beta signup attempt:', {
            email: signupData.email,
            language: signupData.language,
            ip: signupData.ip
        });

        // Process signup with double opt-in confirmation
        const result = await confirmationService.processSignup(signupData);
        
        if (result.success) {
            logger.info('Signup processed successfully, confirmation email sent');
            
            res.status(201).json({
                success: true,
                message: 'Signup received! Please check your email to confirm your registration.',
                data: {
                    email: signupData.email,
                    language: signupData.language,
                    timestamp: signupData.timestamp,
                    confirmationId: result.confirmationId,
                    emailSent: result.emailSent,
                    notificationSent: result.notificationSent
                }
            });
        } else {
            throw new Error('Failed to process signup');
        }

    } catch (error) {
        logger.error('Beta signup error:', error);
        res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: 'Failed to process signup'
        });
    }
});

// Resend confirmation endpoint
router.post('/resend-confirmation', async (req, res) => {
    try {
        const { email, language } = req.body;
        
        // Basic validation
        if (!email || !language) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                message: 'Email and language are required'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                message: 'Invalid email format'
            });
        }

        // Language validation
        if (!['fr', 'en'].includes(language)) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                message: 'Language must be fr or en'
            });
        }
        
        logger.info('Resend confirmation request:', { email, language });
        
        // Attempt to resend confirmation
        const result = await confirmationService.resendConfirmation(email, language);
        
        if (result.success) {
            logger.info('Confirmation email resent successfully:', {
                email: result.email,
                resendCount: result.resendCount
            });

            res.status(200).json({
                success: true,
                message: 'Confirmation email has been resent. Please check your inbox.',
                data: {
                    email: result.email,
                    language: result.language,
                    resendCount: result.resendCount
                }
            });
        } else {
            throw new Error('Failed to resend confirmation');
        }
        
    } catch (error) {
        logger.error('Resend confirmation error:', error);
        
        let errorMessage = 'Failed to resend confirmation';
        let errorCode = 'SERVER_ERROR';
        let statusCode = 500;
        
        if (error.message === 'PENDING_CONFIRMATION_NOT_FOUND') {
            errorMessage = 'No pending confirmation found for this email address';
            errorCode = 'NOT_FOUND';
            statusCode = 404;
        } else if (error.message === 'RESEND_TOO_SOON') {
            errorMessage = 'Please wait at least 5 minutes before requesting another confirmation email';
            errorCode = 'RATE_LIMITED';
            statusCode = 429;
        }
        
        res.status(statusCode).json({
            success: false,
            error: errorCode,
            message: errorMessage
        });
    }
});

// Confirm signup endpoint
router.get('/confirm-signup', async (req, res) => {
    try {
        const { token } = req.query;
        
        if (!token) {
            logger.warn('Confirmation attempt without token');
            return res.status(400).send(generateConfirmationPage({
                success: false,
                title: 'Missing Confirmation Token',
                message: 'No confirmation token provided. Please check your email for the correct confirmation link.',
                isError: true
            }));
        }

        logger.info('Signup confirmation attempt:', { 
            token: token.substring(0, 20) + '...',
            tokenLength: token.length 
        });
        
        // Verify token and confirm email
        const result = await confirmationService.confirmEmail(token);
        
        if (result.success) {
            logger.info('Email confirmation successful:', {
                email: result.email,
                language: result.language
            });

            return res.status(200).send(generateConfirmationPage({
                success: true,
                title: result.language === 'fr' ? 'Email Confirmé !' : 'Email Confirmed!',
                message: result.language === 'fr' 
                    ? 'Félicitations ! Votre inscription au programme beta d\'Emoty a été confirmée. Vous recevrez bientôt des invitations aux tests beta.'
                    : 'Congratulations! Your Emoty beta program signup has been confirmed. You\'ll receive beta test invitations soon.',
                email: result.email,
                language: result.language
            }));
        } else {
            throw new Error('Confirmation failed');
        }
        
    } catch (error) {
        logger.error('Confirmation error:', error);
        
        let errorMessage = 'An error occurred while processing your confirmation.';
        let errorTitle = 'Confirmation Error';
        
        if (error.message === 'CONFIRMATION_TOKEN_EXPIRED') {
            errorTitle = 'Token Expired';
            errorMessage = 'Your confirmation link has expired. Please request a new confirmation email.';
        } else if (error.message === 'INVALID_CONFIRMATION_TOKEN') {
            errorTitle = 'Invalid Token';
            errorMessage = 'The confirmation token is invalid. Please check your email for the correct confirmation link.';
        } else if (error.message === 'CONFIRMATION_NOT_FOUND') {
            errorTitle = 'Already Confirmed';
            errorMessage = 'This email may already be confirmed or the signup was not found.';
        }
        
        res.status(400).send(generateConfirmationPage({
            success: false,
            title: errorTitle,
            message: errorMessage,
            isError: true
        }));
    }
});

// Helper function to generate confirmation page HTML
function generateConfirmationPage({ success, title, message, email = '', language = 'en', isError = false }) {
    const logoColor = success ? '#28a745' : (isError ? '#dc3545' : '#667eea');
    const icon = success ? '✅' : (isError ? '❌' : '⚠️');
    const buttonText = language === 'fr' ? 'Retour à Emoty' : 'Return to Emoty';
    
    return `
        <!DOCTYPE html>
        <html lang="${language}">
        <head>
            <title>${title} - Emoty Beta</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; 
                    text-align: center; 
                    padding: 50px 20px; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin: 0;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .container { 
                    max-width: 600px; 
                    background: white; 
                    padding: 40px; 
                    border-radius: 15px; 
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    animation: slideUp 0.5s ease-out;
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .logo { 
                    font-size: 2em; 
                    color: ${logoColor}; 
                    margin-bottom: 20px; 
                    font-weight: 300;
                    letter-spacing: 0.2em;
                }
                h1 { 
                    color: ${logoColor}; 
                    margin-bottom: 20px;
                    font-size: 1.8em;
                }
                .message {
                    font-size: 1.1em;
                    line-height: 1.6;
                    color: #555;
                    margin-bottom: 30px;
                }
                .button { 
                    display: inline-block; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    text-decoration: none; 
                    padding: 15px 30px; 
                    border-radius: 30px; 
                    margin-top: 20px;
                    font-weight: 500;
                    transition: transform 0.2s ease;
                }
                .button:hover {
                    transform: translateY(-2px);
                }
                ${email ? `.email-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; font-family: monospace; }` : ''}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">e m o t y 💬</div>
                <h1>${icon} ${title}</h1>
                <div class="message">
                    <p>${message}</p>
                    ${email ? `<div class="email-info">Confirmed: ${email}</div>` : ''}
                </div>
                <a href="https://emoty.fr" class="button">${buttonText}</a>
            </div>
        </body>
        </html>
    `;
}

module.exports = router;