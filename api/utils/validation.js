const Joi = require('joi');

// Email validation schema
const emailSchema = Joi.string()
    .email({ tlds: { allow: true } })
    .max(320) // RFC 5321 maximum email length
    .required()
    .messages({
        'string.email': 'Please enter a valid email address',
        'string.max': 'Email address is too long',
        'any.required': 'Email address is required'
    });

// Beta signup validation schema
const signupSchema = Joi.object({
    email: emailSchema,
    consent: Joi.boolean()
        .valid(true)
        .required()
        .messages({
            'any.only': 'You must agree to receive emails to sign up for beta testing',
            'any.required': 'Consent is required'
        }),
    language: Joi.string()
        .valid('fr', 'en')
        .required()
        .messages({
            'any.only': 'Language must be either "fr" or "en"',
            'any.required': 'Language is required'
        }),
    source: Joi.string()
        .valid('beta_signup')
        .required()
        .messages({
            'any.only': 'Source must be "beta_signup"',
            'any.required': 'Source is required'
        }),
    timestamp: Joi.string()
        .isoDate()
        .required()
        .messages({
            'string.isoDate': 'Timestamp must be a valid ISO date',
            'any.required': 'Timestamp is required'
        })
});

// Resend confirmation validation schema
const resendSchema = Joi.object({
    email: emailSchema,
    language: Joi.string()
        .valid('fr', 'en')
        .required()
        .messages({
            'any.only': 'Language must be either "fr" or "en"',
            'any.required': 'Language is required'
        })
});

// Confirmation token validation schema
const confirmTokenSchema = Joi.object({
    token: Joi.string()
        .uuid({ version: 'uuidv4' })
        .required()
        .messages({
            'string.uuid': 'Invalid confirmation token format',
            'any.required': 'Confirmation token is required'
        })
});

// Unsubscribe validation schema
const unsubscribeSchema = Joi.object({
    email: emailSchema
});

/**
 * Validate signup request data
 * @param {Object} data - Request data to validate
 * @returns {Object} Validation result
 */
function validateSignup(data) {
    return signupSchema.validate(data, {
        abortEarly: false, // Return all validation errors
        stripUnknown: true // Remove unknown fields
    });
}

/**
 * Validate resend confirmation request data
 * @param {Object} data - Request data to validate
 * @returns {Object} Validation result
 */
function validateResend(data) {
    return resendSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });
}

/**
 * Validate confirmation token
 * @param {Object} data - Request data to validate
 * @returns {Object} Validation result
 */
function validateConfirmToken(data) {
    return confirmTokenSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });
}

/**
 * Validate unsubscribe request
 * @param {Object} data - Request data to validate
 * @returns {Object} Validation result
 */
function validateUnsubscribe(data) {
    return unsubscribeSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });
}

/**
 * Sanitize email address (lowercase, trim)
 * @param {string} email - Email address to sanitize
 * @returns {string} Sanitized email
 */
function sanitizeEmail(email) {
    if (typeof email !== 'string') return '';
    return email.toLowerCase().trim();
}

/**
 * Check if email domain is valid (basic check)
 * @param {string} email - Email address to check
 * @returns {boolean} True if domain appears valid
 */
function isValidEmailDomain(email) {
    const domain = email.split('@')[1];
    if (!domain) return false;
    
    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_.]+[a-zA-Z0-9]$/;
    return domainRegex.test(domain) && domain.includes('.');
}

/**
 * Validate IP address format
 * @param {string} ip - IP address to validate
 * @returns {boolean} True if valid IP
 */
function isValidIP(ip) {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

module.exports = {
    validateSignup,
    validateResend,
    validateConfirmToken,
    validateUnsubscribe,
    sanitizeEmail,
    isValidEmailDomain,
    isValidIP
};