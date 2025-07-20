# Emoty Beta Signup API Specification

## Overview
Backend API endpoints to support GDPR-compliant double opt-in beta signup functionality.

## Base URL
- Production: `https://emoty.fr/api`
- Development: `http://localhost:8000/api`

## Endpoints

### 1. Beta Signup

**Endpoint:** `POST /beta-signup`

**Description:** Processes new beta signup requests and sends confirmation emails.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "consent": true,
  "language": "fr|en",
  "source": "beta_signup",
  "timestamp": "2025-07-20T14:30:00.000Z"
}
```

**Request Validation:**
- `email`: Valid email format, max 320 characters
- `consent`: Must be `true` (GDPR requirement)
- `language`: Must be "fr" or "en"
- `source`: Must be "beta_signup"
- `timestamp`: Valid ISO 8601 timestamp

**Response (Success - 201 Created):**
```json
{
  "success": true,
  "message": "Confirmation email sent",
  "data": {
    "email": "user@example.com",
    "language": "fr",
    "confirmationSent": true,
    "expiresAt": "2025-07-22T14:30:00.000Z"
  }
}
```

**Response (Error - 400 Bad Request):**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Invalid email format",
  "details": {
    "field": "email",
    "code": "INVALID_FORMAT"
  }
}
```

**Response (Error - 409 Conflict):**
```json
{
  "success": false,
  "error": "EMAIL_EXISTS",
  "message": "Email already registered for beta testing",
  "data": {
    "email": "user@example.com",
    "status": "confirmed|pending"
  }
}
```

**Response (Error - 429 Too Many Requests):**
```json
{
  "success": false,
  "error": "RATE_LIMITED",
  "message": "Too many signup attempts. Please try again later.",
  "retryAfter": 300
}
```

**Response (Error - 500 Internal Server Error):**
```json
{
  "success": false,
  "error": "SERVER_ERROR",
  "message": "Failed to send confirmation email"
}
```

### 2. Resend Confirmation

**Endpoint:** `POST /resend-confirmation`

**Description:** Resends confirmation email for pending signups.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "language": "fr|en"
}
```

**Request Validation:**
- `email`: Valid email format, max 320 characters
- `language`: Must be "fr" or "en"

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "message": "Confirmation email resent",
  "data": {
    "email": "user@example.com",
    "language": "fr",
    "confirmationSent": true,
    "expiresAt": "2025-07-22T14:30:00.000Z",
    "resendCount": 2
  }
}
```

**Response (Error - 404 Not Found):**
```json
{
  "success": false,
  "error": "SIGNUP_NOT_FOUND",
  "message": "No pending signup found for this email"
}
```

**Response (Error - 410 Gone):**
```json
{
  "success": false,
  "error": "SIGNUP_EXPIRED",
  "message": "Signup confirmation has expired. Please register again."
}
```

**Response (Error - 429 Too Many Requests):**
```json
{
  "success": false,
  "error": "RESEND_LIMITED",
  "message": "Maximum resend attempts reached. Please try again later.",
  "retryAfter": 3600
}
```

### 3. Confirm Signup (Optional - for email links)

**Endpoint:** `GET /confirm-signup?token={confirmationToken}`

**Description:** Confirms a beta signup via email link.

**Query Parameters:**
- `token`: Confirmation token from email (UUID format)

**Response (Success - 200 OK):**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Confirmation Successful - Emoty</title>
    <meta http-equiv="refresh" content="3;url=https://emoty.fr">
</head>
<body>
    <h1>✅ Signup Confirmed!</h1>
    <p>Thank you for joining the Emoty beta program.</p>
    <p>Redirecting to emoty.fr...</p>
</body>
</html>
```

**Response (Error - 400 Bad Request):**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Invalid Token - Emoty</title>
</head>
<body>
    <h1>❌ Invalid Confirmation Link</h1>
    <p>This confirmation link is invalid or malformed.</p>
    <a href="https://emoty.fr">Return to Emoty</a>
</body>
</html>
```

**Response (Error - 410 Gone):**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Link Expired - Emoty</title>
</head>
<body>
    <h1>⏰ Confirmation Link Expired</h1>
    <p>This confirmation link has expired (48 hour limit).</p>
    <p>Please sign up again on our website.</p>
    <a href="https://emoty.fr">Return to Emoty</a>
</body>
</html>
```

## Rate Limiting

**Signup Endpoint:**
- 5 requests per IP per hour
- 3 requests per email per 24 hours

**Resend Endpoint:**
- 3 requests per email per hour
- Maximum 5 total resends per signup

## Security Considerations

1. **Input Validation:**
   - Sanitize all input fields
   - Validate email format strictly
   - Check consent is explicitly true

2. **Rate Limiting:**
   - Implement per-IP and per-email rate limits
   - Use sliding window counters

3. **Token Security:**
   - Use cryptographically secure UUIDs for confirmation tokens
   - Store token hashes, not plaintext
   - Implement automatic cleanup of expired tokens

4. **GDPR Compliance:**
   - Log consent timestamp and IP address
   - Provide easy unsubscribe mechanism
   - Allow data deletion requests

5. **Email Security:**
   - Use authenticated email service (SPF, DKIM, DMARC)
   - Include unsubscribe headers
   - Validate email deliverability

## Error Codes Reference

| Code | Description | HTTP Status |
|------|-------------|-------------|
| VALIDATION_ERROR | Invalid input data | 400 |
| EMAIL_EXISTS | Email already registered | 409 |
| RATE_LIMITED | Too many requests | 429 |
| SERVER_ERROR | Internal server error | 500 |
| SIGNUP_NOT_FOUND | No pending signup found | 404 |
| SIGNUP_EXPIRED | Confirmation expired | 410 |
| RESEND_LIMITED | Max resend attempts reached | 429 |
| INVALID_TOKEN | Invalid confirmation token | 400 |

## Implementation Notes

1. **Database Transactions:** Use transactions for signup creation and email sending
2. **Async Processing:** Consider queue-based email sending for better performance
3. **Monitoring:** Log all signup attempts and email delivery status
4. **Cleanup:** Implement scheduled cleanup of expired signups
5. **Analytics:** Track signup conversion rates and email open rates