# Double Opt-in Email Confirmation System

## Overview

The Emoty Beta API now includes a complete double opt-in email confirmation system that ensures users have validated email addresses before being added to the beta program.

## Features

- ✅ **JWT-based confirmation tokens** with 48-hour expiry
- ✅ **Multi-language support** (English and French)
- ✅ **Beautiful HTML email templates** with fallback text versions
- ✅ **Admin notifications** for pending and confirmed signups
- ✅ **Rate limiting** to prevent spam (5-minute cooldown for resends)
- ✅ **Token security** with issuer/audience validation
- ✅ **Duplicate protection** prevents multiple confirmations
- ✅ **Responsive confirmation pages** with proper error handling

## API Endpoints

### 1. Beta Signup
```http
POST /api/beta-signup
Content-Type: application/json

{
  "email": "user@example.com",
  "language": "en",
  "consent": true,
  "source": "website"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Signup received! Please check your email to confirm your registration.",
  "data": {
    "email": "user@example.com",
    "language": "en",
    "timestamp": "2025-07-29T21:38:02.696Z",
    "confirmationId": "a15d235ed8741e1ffa2abd3228e120c8",
    "emailSent": true,
    "notificationSent": true
  }
}
```

### 2. Email Confirmation
```http
GET /api/confirm-signup?token=<JWT_TOKEN>
```

**Success Response:** Beautiful HTML page with confirmation message
**Error Response:** HTML error page with specific error message

### 3. Resend Confirmation
```http
POST /api/resend-confirmation
Content-Type: application/json

{
  "email": "user@example.com",
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Confirmation email has been resent. Please check your inbox.",
  "data": {
    "email": "user@example.com",
    "language": "en",
    "resendCount": 2
  }
}
```

## Flow Description

### 1. Initial Signup
1. User submits beta signup form
2. System validates input (email format, required fields)
3. JWT confirmation token generated (48-hour expiry)
4. Confirmation email sent to user
5. Admin notification sent about pending signup
6. Response returned with confirmation ID

### 2. Email Confirmation
1. User clicks confirmation link in email
2. System verifies JWT token (checks signature, expiry, issuer/audience)
3. Pending confirmation found and marked as confirmed
4. Admin notification sent about successful confirmation
5. Beautiful confirmation page displayed to user

### 3. Resend Flow
1. User requests resend of confirmation email
2. System checks for pending confirmation
3. Rate limiting enforced (5-minute cooldown)
4. New JWT token generated
5. Fresh confirmation email sent

## Security Features

### JWT Token Security
- **Issuer/Audience validation**: Prevents token reuse across applications
- **48-hour expiry**: Limits exposure window
- **Cryptographic signatures**: Prevents tampering
- **Secure secret**: Uses environment variable for signing key

### Rate Limiting
- **5-minute cooldown** between resend requests
- **Per-email tracking** prevents spam
- **Proper error messages** guide users

### Input Validation
- **Email format validation** with regex
- **Language validation** (only 'fr' and 'en' allowed)
- **Required field checking**
- **Consent validation**

## Email Templates

### Multi-language Support
- **English**: Professional, clear messaging
- **French**: Localized content with proper grammar
- **Responsive design**: Works on mobile and desktop
- **Accessibility**: Proper semantic markup

### Template Features
- **Beautiful HTML design** with gradient styling
- **Plain text fallback** for older email clients
- **Unsubscribe links** for compliance
- **Brand consistency** with Emoty design
- **Clear call-to-action** buttons

## Environment Configuration

Required environment variables:

```env
# JWT Configuration
CONFIRMATION_TOKEN_SECRET=your-secure-secret-here

# Email Service (using existing SMTP settings)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Notifications
ENABLE_NOTIFICATIONS=true
NOTIFICATION_EMAIL=admin@yourdomain.com

# URLs
CONFIRMATION_URL=https://yourdomain.com/api/confirm-signup
UNSUBSCRIBE_URL=https://yourdomain.com/unsubscribe
```

## Testing

### Unit Tests
```bash
# Test token utilities and confirmation logic
node test-confirmation-flow.js
```

### API Tests
```bash
# Test all API endpoints
npm start
node test-api-endpoints.js
```

### Manual Testing
1. Submit signup through website form
2. Check email for confirmation message
3. Click confirmation link
4. Verify confirmation page displays
5. Check admin email for notifications

## Error Handling

### Token Errors
- **Expired tokens**: Clear message with resend option
- **Invalid tokens**: Security error with help text
- **Missing tokens**: Validation error with guidance

### Rate Limiting
- **Resend too soon**: Clear cooldown message
- **Multiple attempts**: Appropriate throttling

### Network Errors
- **Email service down**: Graceful fallback with notification
- **Database unavailable**: Continues with in-memory storage

## Storage

### Current Implementation
- **In-memory storage** for pending confirmations
- **Suitable for development and testing**
- **Automatic cleanup** of expired confirmations

### Production Considerations
- **Database storage** recommended for production
- **Redis for session management** for multi-instance deployments
- **Persistent storage** for audit trails

## Integration

### Frontend Integration
```javascript
// Submit signup
const response = await fetch('/api/beta-signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: userEmail,
    language: userLanguage,
    consent: true,
    source: 'website'
  })
});

// Handle response
if (response.ok) {
  const data = await response.json();
  // Show success message: "Check your email to confirm"
}
```

### Email Client Testing
- **Gmail**: ✅ Tested and working
- **Outlook**: ✅ Templates compatible
- **Apple Mail**: ✅ Responsive design
- **Mobile clients**: ✅ Mobile-first approach

## Monitoring

### Logs
- **Signup attempts** with IP and user agent
- **Confirmation events** with timestamps
- **Error tracking** with stack traces
- **Rate limiting events**

### Metrics to Track
- **Signup conversion rate** (signup → confirmation)
- **Email delivery success rate**
- **Confirmation link click rate**
- **Resend request frequency**

## Compliance

### Email Compliance
- **Unsubscribe links** in all emails
- **Clear sender identification**
- **Permission-based sending** (double opt-in)
- **Professional email templates**

### Data Protection
- **Minimal data collection** (only email and language)
- **Clear consent mechanism**
- **User control** over subscription status
- **Secure token handling**

## Deployment Notes

### Railway Deployment
- All environment variables configured
- Email service working with Gmail SMTP
- No database required for basic functionality
- Automatic cleanup of expired confirmations

### Scaling Considerations
- Consider Redis for multi-instance deployments
- Database storage for audit trails
- CDN for email assets
- Load balancing for high volume

---

## Quick Start Checklist

1. ✅ **Environment configured** with SMTP credentials
2. ✅ **JWT secret** set for token security
3. ✅ **Admin notification email** configured
4. ✅ **URL endpoints** configured for production
5. ✅ **Testing completed** with real email flow
6. ✅ **Error handling** verified
7. ✅ **Rate limiting** tested

The double opt-in system is now fully operational and ready for production use! 🎉