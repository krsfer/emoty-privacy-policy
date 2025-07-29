#!/usr/bin/env node

/**
 * Test script for the notification system
 *
 * Usage:
 * 1. Set up your .env file with SMTP credentials
 * 2. Run: node test-notification.js
 */

require('dotenv').config();
const notificationService = require('./services/notificationService');
const logger = require('./utils/logger');

async function testNotification() {
    console.log('🧪 Testing Notification System...\n');

    // Check if notifications are enabled
    if (process.env.ENABLE_NOTIFICATIONS !== 'true') {
        console.log('❌ Notifications are disabled. Set ENABLE_NOTIFICATIONS=true in your .env file.');
        return;
    }

    // Check if notification email is configured
    if (!process.env.NOTIFICATION_EMAIL) {
        console.log('❌ NOTIFICATION_EMAIL not configured in .env file.');
        return;
    }

    // Check if SMTP is configured
    const requiredVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
    const missing = requiredVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
        console.log(`❌ Missing SMTP configuration: ${missing.join(', ')}`);
        return;
    }

    console.log('✅ Configuration looks good!');
    console.log(`📧 Notification email: ${process.env.NOTIFICATION_EMAIL}`);
    console.log(`📤 SMTP host: ${process.env.SMTP_HOST}`);
    console.log(`👤 SMTP user: ${process.env.SMTP_USER}\n`);

    // Test data
    const testSignupData = {
        email: 'test-user@example.com',
        language: 'fr',
        source: 'test',
        ip: '127.0.0.1',
        userAgent: 'Test Script 1.0',
        userName: 'Heyoo'
    };

    console.log('📝 Test signup data:');
    console.log(JSON.stringify(testSignupData, null, 2));
    console.log('\n🚀 Sending test notification...\n');

    // Wait a moment for the service to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        const result = await notificationService.sendSignupNotification(testSignupData);

        if (result) {
            console.log('✅ Test notification sent successfully!');
            console.log('📬 Check your email inbox for the notification.');
        } else {
            console.log('❌ Failed to send test notification.');
            console.log('Check the logs above for error details.');
        }
    } catch (error) {
        console.log('❌ Error sending test notification:');
        console.error(error.message);
    }
}

// Handle uncaught errors
process.on('unhandledRejection', (err) => {
    console.log('❌ Unhandled Promise Rejection:', err.message);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.log('❌ Uncaught Exception:', err.message);
    process.exit(1);
});

// Run the test
testNotification();
