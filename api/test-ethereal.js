#!/usr/bin/env node

/**
 * Test Nodemailer with Ethereal Email (test service)
 * This will prove Nodemailer is working correctly
 */

const nodemailer = require('nodemailer');

async function testEtherealEmail() {
    console.log('🧪 Testing Nodemailer with Ethereal Email...\n');
    
    try {
        // Generate test SMTP service account from ethereal.email
        console.log('📧 Creating test email account...');
        const testAccount = await nodemailer.createTestAccount();
        
        console.log(`✅ Test account created:`);
        console.log(`   Email: ${testAccount.user}`);
        console.log(`   Password: ${testAccount.pass}\n`);
        
        // Create transporter
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
        
        // Test email content
        const testSignupData = {
            timestamp: new Date().toISOString(),
            email: "test-user@example.com",
            language: "fr",
            source: "test",
            ip: "127.0.0.1",
            userAgent: "Test Script 1.0"
        };
        
        const mailOptions = {
            from: `"Emoty Beta Test" <${testAccount.user}>`,
            to: testAccount.user, // Send to ourselves
            subject: `🧪 Nodemailer Test: ${testSignupData.email}`,
            text: `Test signup notification\n\nData: ${JSON.stringify(testSignupData, null, 2)}`,
            html: `
                <h2>🧪 Nodemailer Test</h2>
                <p>This proves Nodemailer is working correctly!</p>
                <h3>Test Signup Data:</h3>
                <pre>${JSON.stringify(testSignupData, null, 2)}</pre>
            `
        };
        
        console.log('🚀 Sending test email...');
        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ Email sent successfully!');
        console.log(`📬 Message ID: ${info.messageId}`);
        console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        console.log('\n🎉 Nodemailer is working perfectly!');
        console.log('The Gmail issue is likely an authentication/account problem, not a Nodemailer issue.');
        
    } catch (error) {
        console.log('❌ Error with Ethereal test:');
        console.error(error.message);
    }
}

testEtherealEmail();