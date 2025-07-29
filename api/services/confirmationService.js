const emailService = require('./emailService');
const notificationService = require('./notificationService');
const tokenUtils = require('../utils/tokenUtils');
const logger = require('../utils/logger');

class ConfirmationService {
    constructor() {
        this.pendingConfirmations = new Map(); // In-memory storage for demo
        // In production, this would be stored in database
    }

    /**
     * Process initial beta signup and send confirmation email
     * @param {Object} signupData - Signup form data
     * @returns {Promise<Object>} Result object with success status
     */
    async processSignup(signupData) {
        try {
            const { email, language } = signupData;

            // Generate confirmation token
            const confirmationToken = tokenUtils.generateConfirmationToken(email, language);

            // Store pending confirmation (in production, this would go to database)
            const confirmationId = tokenUtils.generateSecureRandom(16);
            this.pendingConfirmations.set(confirmationId, {
                ...signupData,
                confirmationToken,
                status: 'pending',
                createdAt: new Date(),
                confirmationId
            });

            // Send confirmation email to user
            const emailSent = await emailService.sendConfirmationEmail(
                email, 
                language, 
                confirmationToken
            );

            if (!emailSent) {
                throw new Error('Failed to send confirmation email');
            }

            // Send notification to admin about pending signup
            const notificationData = {
                ...signupData,
                status: 'pending_confirmation',
                confirmationId
            };
            
            const notificationSent = await notificationService.sendSignupNotification(notificationData);

            logger.info('Signup processed successfully', {
                email,
                language,
                confirmationId,
                emailSent,
                notificationSent
            });

            return {
                success: true,
                message: 'Signup processed. Please check your email for confirmation.',
                confirmationId,
                emailSent,
                notificationSent
            };

        } catch (error) {
            logger.error('Failed to process signup:', error);
            throw error;
        }
    }

    /**
     * Confirm email address using token
     * @param {string} token - Confirmation token
     * @returns {Promise<Object>} Confirmation result
     */
    async confirmEmail(token) {
        try {
            // Verify token
            const tokenData = tokenUtils.verifyConfirmationToken(token);
            const { email, language } = tokenData;

            // Find pending confirmation
            let confirmationRecord = null;
            for (const [id, record] of this.pendingConfirmations.entries()) {
                if (record.email === email && record.status === 'pending') {
                    confirmationRecord = record;
                    confirmationRecord.confirmationId = id;
                    break;
                }
            }

            if (!confirmationRecord) {
                throw new Error('CONFIRMATION_NOT_FOUND');
            }

            // Mark as confirmed
            confirmationRecord.status = 'confirmed';
            confirmationRecord.confirmedAt = new Date();

            // Send notification to admin about successful confirmation
            const confirmationNotificationData = {
                ...confirmationRecord,
                status: 'confirmed',
                confirmedAt: confirmationRecord.confirmedAt
            };

            const notificationSent = await notificationService.sendSignupNotification(confirmationNotificationData);

            logger.info('Email confirmation successful', {
                email,
                language,
                confirmationId: confirmationRecord.confirmationId,
                notificationSent
            });

            return {
                success: true,
                message: 'Email confirmed successfully',
                email,
                language,
                confirmedAt: confirmationRecord.confirmedAt,
                notificationSent
            };

        } catch (error) {
            logger.error('Email confirmation failed:', error);
            throw error;
        }
    }

    /**
     * Resend confirmation email
     * @param {string} email - Email address
     * @param {string} language - Language preference
     * @returns {Promise<Object>} Resend result
     */
    async resendConfirmation(email, language = 'en') {
        try {
            // Find pending confirmation
            let confirmationRecord = null;
            for (const [id, record] of this.pendingConfirmations.entries()) {
                if (record.email === email && record.status === 'pending') {
                    confirmationRecord = record;
                    confirmationRecord.confirmationId = id;
                    break;
                }
            }

            if (!confirmationRecord) {
                throw new Error('PENDING_CONFIRMATION_NOT_FOUND');
            }

            // Check if previous token is near expiry or if too many resend attempts
            const timeSinceCreated = Date.now() - confirmationRecord.createdAt.getTime();
            const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

            if (timeSinceCreated < fiveMinutes) {
                throw new Error('RESEND_TOO_SOON');
            }

            // Generate new confirmation token
            const newConfirmationToken = tokenUtils.generateConfirmationToken(email, language);
            confirmationRecord.confirmationToken = newConfirmationToken;
            confirmationRecord.lastResent = new Date();
            confirmationRecord.resendCount = (confirmationRecord.resendCount || 0) + 1;

            // Send new confirmation email
            const emailSent = await emailService.sendConfirmationEmail(
                email, 
                language, 
                newConfirmationToken
            );

            if (!emailSent) {
                throw new Error('Failed to resend confirmation email');
            }

            logger.info('Confirmation email resent successfully', {
                email,
                language,
                confirmationId: confirmationRecord.confirmationId,
                resendCount: confirmationRecord.resendCount
            });

            return {
                success: true,
                message: 'Confirmation email resent successfully',
                email,
                language,
                resendCount: confirmationRecord.resendCount
            };

        } catch (error) {
            logger.error('Failed to resend confirmation:', error);
            throw error;
        }
    }

    /**
     * Get confirmation status for an email
     * @param {string} email - Email address
     * @returns {Object|null} Confirmation record or null
     */
    getConfirmationStatus(email) {
        for (const [id, record] of this.pendingConfirmations.entries()) {
            if (record.email === email) {
                return {
                    ...record,
                    confirmationId: id
                };
            }
        }
        return null;
    }

    /**
     * Clean up expired confirmations (should be run periodically)
     */
    cleanupExpiredConfirmations() {
        const now = Date.now();
        const fortyEightHours = 48 * 60 * 60 * 1000; // 48 hours in milliseconds

        let cleanedCount = 0;
        for (const [id, record] of this.pendingConfirmations.entries()) {
            const timeSinceCreated = now - record.createdAt.getTime();
            if (timeSinceCreated > fortyEightHours && record.status === 'pending') {
                this.pendingConfirmations.delete(id);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            logger.info(`Cleaned up ${cleanedCount} expired confirmations`);
        }

        return cleanedCount;
    }
}

module.exports = new ConfirmationService();