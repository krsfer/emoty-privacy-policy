# Emoty Beta API Server

Express.js API server for handling beta signup forms with email notifications.

## Features

- ✅ **Beta signup API endpoints**
- ✅ **Nodemailer email notifications** - Get notified when someone signs up
- ✅ **Rate limiting** - Prevent spam
- ✅ **CORS protection** - Secure cross-origin requests
- ✅ **Comprehensive logging** - Winston logger
- ✅ **Health check endpoints**
- ✅ **Environment-based configuration**

## Quick Start

### 1. Install Dependencies

```bash
cd api
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```bash
# Enable notifications
ENABLE_NOTIFICATIONS=true
NOTIFICATION_EMAIL=your-email@example.com

# SMTP Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. Set Up Gmail App Password (if using Gmail)

1. Go to [Google Account settings](https://myaccount.google.com/)
2. Security → 2-Step Verification → App passwords
3. Generate an app password for "Mail"
4. Use this app password (not your regular password) in `SMTP_PASS`

### 4. Test the Notification System

```bash
node test-notification.js
```

This will send a test email to verify your configuration works.

### 5. Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

The server will start on `http://localhost:8000`

## API Endpoints

### POST /api/beta-signup

Process beta signup form submissions.

**Request:**
```json
{
  "email": "user@example.com",
  "consent": true,
  "language": "fr",
  "source": "beta_signup",
  "timestamp": "2025-07-29T10:30:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Signup received and notification sent",
  "data": {
    "email": "user@example.com",
    "language": "fr",
    "timestamp": "2025-07-29T10:30:00.000Z",
    "notificationSent": true
  }
}
```

### GET /api/health

Basic health check endpoint.

### GET /api/health/detailed

Detailed health check with system information.

## Email Notifications

When someone submits the signup form, you'll receive an email with:

- **Subject:** "New Beta Signup: user@example.com"
- **Content:** Both HTML and plain text versions
- **Data:** JSON format with all form details
- **Metadata:** IP address, user agent, timestamp

### Sample Email Content

```
New Beta Signup Received

Signup Details (JSON):
{
  "timestamp": "2025-07-29T10:30:00.000Z",
  "email": "user@example.com",
  "language": "fr",
  "source": "beta_signup",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
```

## SMTP Configuration Examples

### Gmail
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Not your regular password!
```

### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo Mail
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### Custom SMTP Server
```bash
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-password
```

## Deployment

### Heroku

```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set ENABLE_NOTIFICATIONS=true
heroku config:set NOTIFICATION_EMAIL=your-email@example.com
heroku config:set SMTP_HOST=smtp.gmail.com
heroku config:set SMTP_PORT=587
heroku config:set SMTP_USER=your-email@gmail.com
heroku config:set SMTP_PASS=your-app-password

# Deploy
git push heroku main
```

### Railway

1. Connect your GitHub repository
2. Set environment variables in the Railway dashboard
3. Deploy automatically

### DigitalOcean App Platform

1. Connect repository
2. Configure environment variables
3. Set run command: `npm start`

## Troubleshooting

### "Notification service not initialized"

Check your SMTP configuration:
- Verify `ENABLE_NOTIFICATIONS=true`
- Ensure all SMTP variables are set
- Test with `node test-notification.js`

### Gmail "Invalid login"

Use an App Password instead of your regular password:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `SMTP_PASS`

### Emails not arriving

- Check spam folder
- Verify `NOTIFICATION_EMAIL` is correct
- Test SMTP settings with `node test-notification.js`
- Check server logs for errors

### CORS Errors

Update the CORS configuration in `server.js`:
```javascript
app.use(cors({
    origin: [
        'https://emoty.fr',
        'https://www.emoty.fr',
        'https://your-frontend-domain.com'  // Add your domain
    ]
}));
```

## Directory Structure

```
api/
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env.example           # Environment template
├── test-notification.js   # Test script
├── routes/
│   ├── signup.js          # Signup endpoints
│   └── health.js          # Health check endpoints
├── services/
│   ├── emailService.js    # Email service (existing)
│   └── notificationService.js  # Notification service (new)
├── middleware/
│   └── errorHandler.js    # Error handling
└── utils/
    ├── logger.js          # Winston logger
    └── validation.js      # Input validation
```

## License

Private - Emoty Project