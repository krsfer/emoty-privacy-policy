const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./utils/logger');
const { connectDB } = require('./config/database');
const signupRoutes = require('./routes/signup');
const healthRoutes = require('./routes/health');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 8000;

// Security middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false, // Allow embedding for email confirmation pages
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for email pages
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"]
        }
    }
}));

// CORS configuration
app.use(cors({
    origin: [
        'https://emoty.fr',
        'https://www.emoty.fr',
        'http://localhost:3000', // For development
        'http://localhost:8080'  // For development
    ],
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiting
if (process.env.ENABLE_RATE_LIMITING === 'true') {
    const globalLimiter = rateLimit({
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
        message: {
            success: false,
            error: 'RATE_LIMITED',
            message: 'Too many requests from this IP, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false
    });
    
    app.use('/api/', globalLimiter);
}

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('Request processed', {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
    });
    
    next();
});

// Health check endpoint
app.use('/api/health', healthRoutes);

// Signup routes
app.use('/api', signupRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'API endpoint not found'
    });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Start server
async function startServer() {
    try {
        // Optionally connect to database if configured
        if (process.env.DATABASE_URL || process.env.DB_HOST) {
            try {
                await connectDB();
                logger.info('Database connected successfully');
            } catch (dbError) {
                logger.warn('Database connection failed, continuing without database:', dbError.message);
                logger.info('📊 Database features will be disabled');
            }
        } else {
            logger.info('📊 No database configuration found, running without database');
        }
        
        // Start HTTP server
        app.listen(PORT, () => {
            logger.info(`🚀 Emoty Beta API server running on port ${PORT}`);
            logger.info(`📧 Email sending: ${process.env.ENABLE_EMAIL_SENDING === 'true' ? 'ENABLED' : 'DISABLED'}`);
            logger.info(`🛡️  Rate limiting: ${process.env.ENABLE_RATE_LIMITING === 'true' ? 'ENABLED' : 'DISABLED'}`);
            logger.info(`🛡️  Notifications: ${process.env.ENABLE_NOTIFICATIONS === 'true' ? 'ENABLED' : 'DISABLED'}`);
            logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
        
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

startServer();

module.exports = app;