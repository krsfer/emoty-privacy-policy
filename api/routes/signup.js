const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

// Beta signup endpoint
router.post('/beta-signup', async (req, res) => {
    try {
        const { email, consent, language, source, timestamp } = req.body;
        
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

        // Prepare signup data
        const signupData = {
            email,
            language,
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

        // Send notification email to admin
        const notificationSent = await notificationService.sendSignupNotification(signupData);
        
        if (notificationSent) {
            logger.info('Signup notification sent successfully');
        } else {
            logger.warn('Failed to send signup notification');
        }

        // TODO: Here you would typically:
        // 1. Save to database (Airtable/PostgreSQL)
        // 2. Send confirmation email to user
        // 3. Generate confirmation token
        
        // For now, return success response
        res.status(201).json({
            success: true,
            message: 'Signup received and notification sent',
            data: {
                email: signupData.email,
                language: signupData.language,
                timestamp: signupData.timestamp,
                notificationSent
            }
        });

    } catch (error) {
        logger.error('Beta signup error:', error);
        res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: 'Failed to process signup'
        });
    }
});

// Resend confirmation endpoint (placeholder)
router.post('/resend-confirmation', async (req, res) => {
    try {
        const { email, language } = req.body;
        
        logger.info('Resend confirmation request:', { email, language });
        
        // TODO: Implement resend confirmation logic
        
        res.status(200).json({
            success: true,
            message: 'Resend confirmation functionality not yet implemented',
            data: { email, language }
        });
        
    } catch (error) {
        logger.error('Resend confirmation error:', error);
        res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: 'Failed to resend confirmation'
        });
    }
});

// Confirm signup endpoint (placeholder)
router.get('/confirm-signup', async (req, res) => {
    try {
        const { token } = req.query;
        
        logger.info('Signup confirmation attempt:', { token: token ? 'present' : 'missing' });
        
        // TODO: Implement confirmation logic
        
        res.status(200).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Confirmation - Emoty Beta</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .logo { font-size: 2em; color: #667eea; margin-bottom: 20px; }
                    h1 { color: #28a745; }
                    .button { display: inline-block; background: #667eea; color: white; text-decoration: none; padding: 15px 30px; border-radius: 30px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">e m o t y 💬</div>
                    <h1>⚠️ Confirmation System Not Yet Active</h1>
                    <p>The beta signup confirmation system is currently under development.</p>
                    <p>Your signup request has been received and you will be contacted directly.</p>
                    <a href="https://emoty.fr" class="button">Return to Emoty</a>
                </div>
            </body>
            </html>
        `);
        
    } catch (error) {
        logger.error('Confirmation error:', error);
        res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head><title>Error - Emoty</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1>❌ Error</h1>
                <p>An error occurred while processing your confirmation.</p>
                <a href="https://emoty.fr">Return to Emoty</a>
            </body>
            </html>
        `);
    }
});

module.exports = router;