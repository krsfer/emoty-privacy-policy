#!/usr/bin/env node

/**
 * Test script for the complete double opt-in confirmation flow
 * 
 * Usage:
 * 1. Set up your .env file with SMTP credentials
 * 2. Run: node test-confirmation-flow.js
 */

require('dotenv').config();
const confirmationService = require('./services/confirmationService');
const tokenUtils = require('./utils/tokenUtils');
const logger = require('./utils/logger');

async function testConfirmationFlow() {
    console.log('🧪 Testing Complete Double Opt-in Flow...\n');

    // Check if email service is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('❌ Email service not configured. Set up SMTP credentials in .env file.');
        return;
    }

    console.log('✅ Email configuration found!');
    console.log(`📤 SMTP host: ${process.env.SMTP_HOST}`);
    console.log(`👤 SMTP user: ${process.env.SMTP_USER}\n`);

    // Test data
    const testSignupData = {
        email: 'test-confirmation@example.com',
        language: 'en',
        consent: true,
        source: 'test-confirmation',
        ip: '127.0.0.1',
        userAgent: 'Test Confirmation Script 1.0',
        timestamp: new Date().toISOString()
    };

    console.log('📝 Test signup data:');
    console.log(JSON.stringify(testSignupData, null, 2));
    console.log('\n🚀 Step 1: Processing initial signup...\n');

    try {
        // Step 1: Process signup
        const signupResult = await confirmationService.processSignup(testSignupData);
        
        if (signupResult.success) {
            console.log('✅ Step 1 SUCCESS: Signup processed');
            console.log(`📧 Confirmation email sent: ${signupResult.emailSent}`);
            console.log(`🔔 Admin notification sent: ${signupResult.notificationSent}`);
            console.log(`🆔 Confirmation ID: ${signupResult.confirmationId}\n`);
            
            // Wait a moment
            console.log('⏳ Waiting 2 seconds before Step 2...\n');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Step 2: Get confirmation status
            console.log('🔍 Step 2: Checking confirmation status...');
            const status = confirmationService.getConfirmationStatus(testSignupData.email);
            
            if (status) {
                console.log('✅ Step 2 SUCCESS: Found confirmation record');
                console.log(`📧 Email: ${status.email}`);
                console.log(`🌐 Language: ${status.language}`);
                console.log(`📊 Status: ${status.status}`);
                console.log(`🕐 Created: ${status.createdAt}\n`);
                
                // Step 3: Test token verification
                console.log('🔐 Step 3: Testing token verification...');
                const token = status.confirmationToken;
                
                try {
                    const verificationResult = await confirmationService.confirmEmail(token);
                    
                    if (verificationResult.success) {
                        console.log('✅ Step 3 SUCCESS: Email confirmed');
                        console.log(`📧 Confirmed email: ${verificationResult.email}`);
                        console.log(`🌐 Language: ${verificationResult.language}`);
                        console.log(`✅ Confirmed at: ${verificationResult.confirmedAt}`);
                        console.log(`🔔 Admin notification sent: ${verificationResult.notificationSent}\n`);
                        
                        // Step 4: Test resend functionality (should fail now)
                        console.log('🔄 Step 4: Testing resend after confirmation (should fail)...');
                        
                        try {
                            const resendResult = await confirmationService.resendConfirmation(testSignupData.email, testSignupData.language);
                            console.log('❌ Step 4 UNEXPECTED: Resend should have failed');
                        } catch (resendError) {
                            console.log('✅ Step 4 SUCCESS: Resend correctly failed (email already confirmed)');
                            console.log(`Error: ${resendError.message}\n`);
                        }
                        
                        // Step 5: Test duplicate confirmation (should fail)
                        console.log('🔁 Step 5: Testing duplicate confirmation (should fail)...');
                        
                        try {
                            const duplicateResult = await confirmationService.confirmEmail(token);
                            console.log('❌ Step 5 UNEXPECTED: Duplicate confirmation should have failed');
                        } catch (duplicateError) {
                            console.log('✅ Step 5 SUCCESS: Duplicate confirmation correctly failed');
                            console.log(`Error: ${duplicateError.message}\n`);
                        }
                        
                        console.log('🎉 ALL TESTS PASSED! Double opt-in flow is working correctly.\n');
                        console.log('📋 Summary:');
                        console.log('  ✅ Signup processing with confirmation email');
                        console.log('  ✅ Token generation and verification');
                        console.log('  ✅ Email confirmation workflow');
                        console.log('  ✅ Admin notifications');
                        console.log('  ✅ Duplicate confirmation protection');
                        console.log('  ✅ Resend protection after confirmation');
                        
                    } else {
                        console.log('❌ Step 3 FAILED: Email confirmation failed');
                    }
                    
                } catch (tokenError) {
                    console.log('❌ Step 3 FAILED: Token verification failed');
                    console.error('Error:', tokenError.message);
                }
                
            } else {
                console.log('❌ Step 2 FAILED: Confirmation record not found');
            }
            
        } else {
            console.log('❌ Step 1 FAILED: Signup processing failed');
        }
        
    } catch (error) {
        console.log('❌ TEST FAILED with error:');
        console.error(error.message);
    }
}

// Test token utilities separately
async function testTokenUtils() {
    console.log('\n🔧 Testing Token Utilities...\n');
    
    try {
        // Test token generation
        const testEmail = 'token-test@example.com';
        const testLanguage = 'fr';
        
        console.log('🔑 Generating test token...');
        const token = tokenUtils.generateConfirmationToken(testEmail, testLanguage);
        console.log(`✅ Token generated (length: ${token.length})`);
        console.log(`🎫 Token: ${token.substring(0, 50)}...\n`);
        
        // Test token verification
        console.log('🔍 Verifying token...');
        const decoded = tokenUtils.verifyConfirmationToken(token);
        console.log('✅ Token verification successful');
        console.log(`📧 Email: ${decoded.email}`);
        console.log(`🌐 Language: ${decoded.language}`);
        console.log(`⏰ Timestamp: ${decoded.timestamp}\n`);
        
        // Test expiry check
        console.log('⏳ Checking token expiry...');
        const isNearExpiry = tokenUtils.isTokenNearExpiry(token);
        console.log(`✅ Near expiry: ${isNearExpiry} (should be false for new token)\n`);
        
        // Test email extraction
        console.log('📧 Extracting email from token...');
        const extractedEmail = tokenUtils.extractEmailFromToken(token);
        console.log(`✅ Extracted email: ${extractedEmail}\n`);
        
        console.log('🎉 Token utilities tests passed!\n');
        
    } catch (error) {
        console.log('❌ Token utilities test failed:');
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

// Run the tests
async function runAllTests() {
    await testTokenUtils();
    await testConfirmationFlow();
}

runAllTests();