const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Health check endpoint
router.get('/', (req, res) => {
    const healthCheck = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: 'Emoty Beta API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        features: {
            emailSending: process.env.ENABLE_EMAIL_SENDING === 'true',
            rateLimiting: process.env.ENABLE_RATE_LIMITING === 'true',
            notifications: process.env.ENABLE_NOTIFICATIONS === 'true'
        }
    };

    logger.info('Health check requested');
    
    res.status(200).json(healthCheck);
});

// Detailed health check
router.get('/detailed', (req, res) => {
    const detailedHealth = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: 'Emoty Beta API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
            external: Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100
        },
        features: {
            emailSending: process.env.ENABLE_EMAIL_SENDING === 'true',
            rateLimiting: process.env.ENABLE_RATE_LIMITING === 'true',
            notifications: process.env.ENABLE_NOTIFICATIONS === 'true'
        },
        configuration: {
            port: process.env.PORT || 8000,
            nodeVersion: process.version,
            platform: process.platform
        }
    };

    logger.info('Detailed health check requested');
    
    res.status(200).json(detailedHealth);
});

module.exports = router;