const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class NotificationService {
    constructor() {
        this.transporter = null;
        this.initialized = false;
        this.notificationEmail = process.env.NOTIFICATION_EMAIL;
        
        if (process.env.ENABLE_NOTIFICATIONS === 'true') {
            this.initialize();
        }
    }

    initialize() {
        try {
            // Create transporter with SMTP configuration
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                tls: {
                    rejectUnauthorized: process.env.NODE_ENV === 'production'
                }
            });

            // Verify transporter configuration
            this.transporter.verify((error, success) => {
                if (error) {
                    logger.error('Notification email configuration error:', error);
                    this.initialized = false;
                } else {
                    logger.info('Notification email server ready');
                    this.initialized = true;
                }
            });
        } catch (error) {
            logger.error('Failed to initialize notification service:', error);
            this.initialized = false;
        }
    }

    async sendSignupNotification(signupData) {
        if (!this.initialized || !this.notificationEmail) {
            logger.warn('Notification service not initialized or no recipient email configured');
            return false;
        }

        try {
            // Prepare the notification data - include all signup data plus timestamp
            const notificationData = {
                timestamp: new Date().toISOString(),
                ...signupData, // Include all fields from signupData
                // Set defaults for optional fields
                source: signupData.source || 'beta_signup',
                ip: signupData.ip || 'unknown',
                userAgent: signupData.userAgent || 'unknown'
            };

            // Email options
            const mailOptions = {
                from: `"Emoty Beta Signup" <${process.env.SMTP_USER}>`,
                to: this.notificationEmail,
                subject: `New Beta Signup: ${signupData.email}`,
                text: this.generatePlainTextEmail(notificationData),
                html: this.generateHtmlEmail(notificationData)
            };

            // Send email
            const info = await this.transporter.sendMail(mailOptions);
            logger.info('Signup notification sent:', {
                messageId: info.messageId,
                recipient: this.notificationEmail
            });
            
            return true;
        } catch (error) {
            logger.error('Failed to send signup notification:', error);
            return false;
        }
    }

    generatePlainTextEmail(data) {
        return `New Beta Signup Received

Signup Details (JSON):
${JSON.stringify(data, null, 2)}

Raw Data:
- Email: ${data.email}${data.username ? `
- Username: ${data.username}` : ''}
- Language: ${data.language}
- Timestamp: ${data.timestamp}
- IP Address: ${data.ip}
- User Agent: ${data.userAgent}
- Source: ${data.source}

---
This is an automated notification from the Emoty Beta Signup system.`;
    }

    generateHtmlEmail(data) {
        return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #667eea;
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }
        .content {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 0 0 8px 8px;
            border: 1px solid #e9ecef;
            border-top: none;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background-color: white;
            border-radius: 4px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .data-table th {
            background-color: #667eea;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
        }
        .data-table td {
            padding: 12px;
            border-bottom: 1px solid #e9ecef;
        }
        .data-table tr:last-child td {
            border-bottom: none;
        }
        .json-block {
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 15px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            overflow-x: auto;
            white-space: pre;
            margin-top: 20px;
        }
        .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            text-align: center;
            color: #6c757d;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>🚀 New Beta Signup</h2>
    </div>
    <div class="content">
        <p>A new user has signed up for the Emoty beta testing program.</p>
        
        <table class="data-table">
            <tr>
                <th>Field</th>
                <th>Value</th>
            </tr>
            <tr>
                <td><strong>Email</strong></td>
                <td>${data.email}</td>
            </tr>
            ${data.username ? `<tr>
                <td><strong>Username</strong></td>
                <td>${data.username}</td>
            </tr>` : ''}
            <tr>
                <td><strong>Language</strong></td>
                <td>${data.language === 'fr' ? 'French 🇫🇷' : 'English 🇬🇧'}</td>
            </tr>
            <tr>
                <td><strong>Timestamp</strong></td>
                <td>${new Date(data.timestamp).toLocaleString()}</td>
            </tr>
            <tr>
                <td><strong>IP Address</strong></td>
                <td>${data.ip}</td>
            </tr>
            <tr>
                <td><strong>User Agent</strong></td>
                <td style="font-size: 11px;">${data.userAgent}</td>
            </tr>
            <tr>
                <td><strong>Source</strong></td>
                <td>${data.source}</td>
            </tr>
        </table>

        <h3>JSON Data:</h3>
        <div class="json-block">${JSON.stringify(data, null, 2)}</div>
    </div>
    <div class="footer">
        <p>This is an automated notification from the Emoty Beta Signup system.</p>
        <p>Sent at ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>`;
    }
}

// Export singleton instance
module.exports = new NotificationService();