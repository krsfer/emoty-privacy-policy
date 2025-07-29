const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('./logger');

class TokenUtils {
    constructor() {
        this.confirmationTokenSecret = process.env.CONFIRMATION_TOKEN_SECRET || 'fallback-secret-for-development';
        this.tokenExpiry = '48h'; // 48 hours for email confirmation
    }

    /**
     * Generate a confirmation token for email verification
     * @param {string} email - User email address
     * @param {string} language - User preferred language
     * @returns {string} JWT token
     */
    generateConfirmationToken(email, language = 'en') {
        try {
            const payload = {
                email,
                language,
                type: 'email_confirmation',
                timestamp: new Date().toISOString()
            };

            const token = jwt.sign(payload, this.confirmationTokenSecret, {
                expiresIn: this.tokenExpiry,
                issuer: 'emoty-beta-api',
                audience: 'emoty-beta-users'
            });

            logger.info('Confirmation token generated', {
                email,
                language,
                expiresIn: this.tokenExpiry
            });

            return token;
        } catch (error) {
            logger.error('Failed to generate confirmation token:', error);
            throw new Error('Failed to generate confirmation token');
        }
    }

    /**
     * Verify and decode a confirmation token
     * @param {string} token - JWT token to verify
     * @returns {Object} Decoded token payload
     */
    verifyConfirmationToken(token) {
        try {
            const decoded = jwt.verify(token, this.confirmationTokenSecret, {
                issuer: 'emoty-beta-api',
                audience: 'emoty-beta-users'
            });

            // Verify token type
            if (decoded.type !== 'email_confirmation') {
                throw new Error('Invalid token type');
            }

            logger.info('Confirmation token verified successfully', {
                email: decoded.email,
                language: decoded.language
            });

            return decoded;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                logger.warn('Confirmation token expired', { token: token.substring(0, 20) + '...' });
                throw new Error('CONFIRMATION_TOKEN_EXPIRED');
            } else if (error.name === 'JsonWebTokenError') {
                logger.warn('Invalid confirmation token', { 
                    error: error.message,
                    token: token.substring(0, 20) + '...'
                });
                throw new Error('INVALID_CONFIRMATION_TOKEN');
            } else {
                logger.error('Token verification error:', error);
                throw new Error('TOKEN_VERIFICATION_FAILED');
            }
        }
    }

    /**
     * Generate a secure random string for additional security
     * @param {number} length - Length of the random string
     * @returns {string} Random hex string
     */
    generateSecureRandom(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * Check if a token is close to expiring (within 24 hours)
     * @param {string} token - JWT token to check
     * @returns {boolean} True if token expires within 24 hours
     */
    isTokenNearExpiry(token) {
        try {
            const decoded = jwt.decode(token);
            if (!decoded || !decoded.exp) return true;

            const now = Math.floor(Date.now() / 1000);
            const timeToExpiry = decoded.exp - now;
            const twentyFourHours = 24 * 60 * 60; // 24 hours in seconds

            return timeToExpiry <= twentyFourHours;
        } catch (error) {
            logger.error('Error checking token expiry:', error);
            return true; // Assume near expiry if we can't check
        }
    }

    /**
     * Extract email from token without verification (for resend functionality)
     * @param {string} token - JWT token
     * @returns {string|null} Email address or null if invalid
     */
    extractEmailFromToken(token) {
        try {
            const decoded = jwt.decode(token);
            return decoded && decoded.email ? decoded.email : null;
        } catch (error) {
            logger.error('Failed to extract email from token:', error);
            return null;
        }
    }
}

module.exports = new TokenUtils();