-- Emoty Beta Signup Database Schema
-- Supports GDPR-compliant double opt-in signup process

-- Create database (PostgreSQL)
-- CREATE DATABASE emoty_beta;

-- Enable UUID extension for token generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Beta signups table
CREATE TABLE beta_signups (
    id SERIAL PRIMARY KEY,
    email VARCHAR(320) NOT NULL UNIQUE, -- RFC 5321 max email length
    language VARCHAR(5) NOT NULL CHECK (language IN ('fr', 'en')),
    consent_given BOOLEAN NOT NULL DEFAULT FALSE,
    consent_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    consent_ip_address INET,
    source VARCHAR(50) NOT NULL DEFAULT 'beta_signup',
    
    -- Confirmation process
    confirmation_token UUID NOT NULL DEFAULT uuid_generate_v4(),
    confirmation_token_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of token
    confirmation_sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    confirmation_expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
    confirmed_at TIMESTAMP WITH TIME ZONE NULL,
    
    -- Resend tracking
    resend_count INTEGER NOT NULL DEFAULT 0,
    last_resend_at TIMESTAMP WITH TIME ZONE NULL,
    max_resends INTEGER NOT NULL DEFAULT 5,
    
    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'expired', 'unsubscribed')),
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- GDPR compliance
    data_retention_until TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '2 years'),
    unsubscribed_at TIMESTAMP WITH TIME ZONE NULL,
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Indexes for performance
CREATE INDEX idx_beta_signups_email ON beta_signups(email);
CREATE INDEX idx_beta_signups_status ON beta_signups(status);
CREATE INDEX idx_beta_signups_confirmation_token_hash ON beta_signups(confirmation_token_hash);
CREATE INDEX idx_beta_signups_confirmation_expires_at ON beta_signups(confirmation_expires_at);
CREATE INDEX idx_beta_signups_created_at ON beta_signups(created_at);
CREATE INDEX idx_beta_signups_language ON beta_signups(language);

-- Partial index for active signups only
CREATE INDEX idx_beta_signups_active ON beta_signups(email, status) 
WHERE deleted_at IS NULL;

-- Rate limiting table
CREATE TABLE signup_rate_limits (
    id SERIAL PRIMARY KEY,
    ip_address INET NOT NULL,
    email VARCHAR(320),
    attempt_type VARCHAR(20) NOT NULL CHECK (attempt_type IN ('signup', 'resend')),
    attempt_count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Unique constraint for rate limiting windows
    UNIQUE(ip_address, email, attempt_type, window_start)
);

-- Indexes for rate limiting
CREATE INDEX idx_rate_limits_ip_type ON signup_rate_limits(ip_address, attempt_type);
CREATE INDEX idx_rate_limits_email_type ON signup_rate_limits(email, attempt_type);
CREATE INDEX idx_rate_limits_window_end ON signup_rate_limits(window_end);

-- Email delivery tracking
CREATE TABLE email_deliveries (
    id SERIAL PRIMARY KEY,
    signup_id INTEGER NOT NULL REFERENCES beta_signups(id) ON DELETE CASCADE,
    email_type VARCHAR(20) NOT NULL CHECK (email_type IN ('confirmation', 'resend')),
    email_address VARCHAR(320) NOT NULL,
    language VARCHAR(5) NOT NULL,
    
    -- Delivery status
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE NULL,
    opened_at TIMESTAMP WITH TIME ZONE NULL,
    clicked_at TIMESTAMP WITH TIME ZONE NULL,
    bounced_at TIMESTAMP WITH TIME ZONE NULL,
    
    -- Email service details
    email_service_id VARCHAR(100), -- External email service message ID
    email_service_response TEXT,
    
    -- Status
    delivery_status VARCHAR(20) NOT NULL DEFAULT 'sent' 
        CHECK (delivery_status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for email tracking
CREATE INDEX idx_email_deliveries_signup_id ON email_deliveries(signup_id);
CREATE INDEX idx_email_deliveries_email_type ON email_deliveries(email_type);
CREATE INDEX idx_email_deliveries_delivery_status ON email_deliveries(delivery_status);
CREATE INDEX idx_email_deliveries_sent_at ON email_deliveries(sent_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_beta_signups_updated_at 
    BEFORE UPDATE ON beta_signups 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired signups
CREATE OR REPLACE FUNCTION cleanup_expired_signups()
RETURNS INTEGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    -- Update expired pending signups
    UPDATE beta_signups 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'pending' 
    AND confirmation_expires_at < NOW();
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    -- Clean up old rate limit records (older than 24 hours)
    DELETE FROM signup_rate_limits 
    WHERE window_end < NOW() - INTERVAL '24 hours';
    
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;

-- Function to safely delete GDPR data
CREATE OR REPLACE FUNCTION gdpr_delete_signup(user_email VARCHAR(320))
RETURNS BOOLEAN AS $$
DECLARE
    signup_found BOOLEAN := FALSE;
BEGIN
    -- Mark as deleted instead of hard delete for audit purposes
    UPDATE beta_signups 
    SET 
        status = 'unsubscribed',
        deleted_at = NOW(),
        updated_at = NOW(),
        -- Anonymize email but keep domain for analytics
        email = 'deleted_' || EXTRACT(EPOCH FROM NOW())::TEXT || '@' || SPLIT_PART(email, '@', 2)
    WHERE email = user_email 
    AND deleted_at IS NULL;
    
    GET DIAGNOSTICS signup_found = FOUND;
    
    RETURN signup_found;
END;
$$ LANGUAGE plpgsql;

-- Function to get signup statistics
CREATE OR REPLACE FUNCTION get_signup_stats(
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
    total_signups BIGINT,
    confirmed_signups BIGINT,
    pending_signups BIGINT,
    expired_signups BIGINT,
    french_signups BIGINT,
    english_signups BIGINT,
    confirmation_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_signups,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_signups,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_signups,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_signups,
        COUNT(CASE WHEN language = 'fr' THEN 1 END) as french_signups,
        COUNT(CASE WHEN language = 'en' THEN 1 END) as english_signups,
        ROUND(
            100.0 * COUNT(CASE WHEN status = 'confirmed' THEN 1 END) / 
            NULLIF(COUNT(*), 0), 2
        ) as confirmation_rate
    FROM beta_signups 
    WHERE created_at BETWEEN start_date AND end_date
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a view for active signups (excludes deleted)
CREATE VIEW active_beta_signups AS
SELECT 
    id, email, language, consent_given, consent_timestamp,
    source, status, confirmed_at, resend_count,
    created_at, updated_at
FROM beta_signups 
WHERE deleted_at IS NULL;

-- Sample queries for common operations:

/*
-- Insert new signup
INSERT INTO beta_signups (
    email, language, consent_given, consent_timestamp, 
    consent_ip_address, source, confirmation_token_hash
) VALUES (
    'user@example.com', 'fr', true, NOW(), 
    '192.168.1.1', 'beta_signup', 
    SHA256('generated-uuid-token')
);

-- Confirm signup
UPDATE beta_signups 
SET status = 'confirmed', confirmed_at = NOW(), updated_at = NOW()
WHERE confirmation_token_hash = SHA256('token-from-email')
AND status = 'pending'
AND confirmation_expires_at > NOW();

-- Check rate limits
SELECT attempt_count 
FROM signup_rate_limits 
WHERE ip_address = '192.168.1.1' 
AND attempt_type = 'signup'
AND window_end > NOW();

-- Get signup statistics
SELECT * FROM get_signup_stats();

-- Clean up expired signups (run as scheduled job)
SELECT cleanup_expired_signups();

-- GDPR delete user data
SELECT gdpr_delete_signup('user@example.com');
*/

-- Scheduled maintenance (setup with cron or similar)
-- This should be run daily to clean up expired records
-- SELECT cleanup_expired_signups();