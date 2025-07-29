# Emoty Beta Signup Deployment Guide

## Overview
This guide explains how to deploy the backend for the Emoty beta signup system using the Express API server with Airtable and Mailgun.

## Prerequisites

### 1. Accounts Needed
- ✅ **Airtable** account (free tier sufficient)
- ✅ **Mailgun** account (free tier: 5,000 emails/month)
- ✅ **GitHub** account (for repository hosting)
- ✅ **Hosting provider** (Heroku, DigitalOcean, AWS, etc.)

### 2. Domain Requirements
- ✅ Custom domain for email sending (recommended)
- ✅ DNS access for email verification

## Step-by-Step Setup

### Step 1: Airtable Database Setup

1. **Create Airtable Base:**
   - Go to [airtable.com](https://airtable.com)
   - Create new base called "Emoty Beta Signups"
   - Create table called "BetaSignups"

2. **Configure Fields:**
   ```
   email (Single line text, Primary field)
   language (Single select: fr, en)
   consent (Checkbox)
   consentTimestamp (Date and time)
   consentIpAddress (Single line text)
   source (Single line text)
   confirmationTokenHash (Single line text)
   confirmationExpiresAt (Date and time)
   status (Single select: pending, confirmed, expired, unsubscribed)
   resendCount (Number)
   confirmedAt (Date and time)
   lastResendAt (Date and time)
   ```

3. **Get API Credentials:**
   - Go to Account → API
   - Copy your Personal Access Token
   - Copy your Base ID from the API documentation

### Step 2: Mailgun Email Setup

1. **Create Mailgun Account:**
   - Go to [mailgun.com](https://mailgun.com)
   - Add your domain (e.g., `emoty.fr`)
   - Verify domain ownership

2. **DNS Configuration:**
   Add these DNS records to your domain:
   ```
   TXT record: v=spf1 include:mailgun.org ~all
   TXT record: k=rsa; p=[DKIM_PUBLIC_KEY]
   CNAME record: email.emoty.fr → mailgun.org
   ```

3. **Get API Key:**
   - Go to Settings → API Keys
   - Copy your Private API Key
   - Note your domain name

### Step 3: API Server Deployment

1. **Configure Environment Variables:**
   Create a `.env` file (don't commit this to Git):
   ```bash
   # Server Configuration
   PORT=8000
   NODE_ENV=production
   
   # Database
   AIRTABLE_API_KEY=your_airtable_personal_access_token
   AIRTABLE_BASE_ID=your_airtable_base_id
   
   # Email Service
   MAILGUN_API_KEY=your_mailgun_private_api_key
   MAILGUN_DOMAIN=emoty.fr
   
   # Features
   ENABLE_EMAIL_SENDING=true
   ENABLE_RATE_LIMITING=true
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
   RATE_LIMIT_MAX_REQUESTS=100
   ```

2. **Install Dependencies:**
   ```bash
   cd api
   npm install
   ```

3. **Start the Server:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

### Step 4: Frontend Configuration

1. **Update API Endpoints:**
   The frontend is already configured to use relative paths:
   ```javascript
   // In index.html and en-GB/index.html
   const config = {
       apiEndpoint: '/api/beta-signup',
       confirmationApiEndpoint: '/api/resend-confirmation'
   };
   ```

2. **Configure CORS (if needed):**
   If hosting frontend and backend separately, update CORS in `api/server.js`:
   ```javascript
   app.use(cors({
       origin: [
           'https://emoty.fr',
           'https://www.emoty.fr',
           'https://your-frontend-domain.com'
       ],
       credentials: true
   }));
   ```

### Step 5: Deployment Options

#### Option A: Heroku
```bash
# Install Heroku CLI
# Create Heroku app
heroku create emoty-beta-api

# Set environment variables
heroku config:set AIRTABLE_API_KEY=your_key
heroku config:set AIRTABLE_BASE_ID=your_base_id
heroku config:set MAILGUN_API_KEY=your_key
heroku config:set MAILGUN_DOMAIN=emoty.fr

# Deploy
git push heroku main
```

#### Option B: DigitalOcean App Platform
1. Connect GitHub repository
2. Choose Node.js as the environment
3. Set run command: `npm start`
4. Configure environment variables in the UI
5. Deploy

#### Option C: Traditional VPS
```bash
# On your server
git clone your-repo
cd your-repo/api
npm install --production

# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name emoty-api
pm2 save
pm2 startup
```

## Testing Checklist

### ✅ Basic Functionality
- [ ] Form accepts valid email addresses
- [ ] Form rejects invalid email addresses
- [ ] Consent checkbox is required
- [ ] Language selection works correctly
- [ ] Confirmation email is sent
- [ ] Email confirmation link works
- [ ] Confirmed signups are marked in Airtable

### ✅ Error Handling
- [ ] Invalid email shows error message
- [ ] Missing consent shows error message
- [ ] Network errors show fallback message
- [ ] Expired confirmation shows appropriate page
- [ ] Invalid confirmation token shows error page

### ✅ Security
- [ ] Rate limiting prevents spam
- [ ] CORS headers restrict origins
- [ ] Environment variables are secure
- [ ] No sensitive data in client-side code

### ✅ Internationalization
- [ ] French form works correctly
- [ ] English form works correctly
- [ ] Confirmation emails use correct language
- [ ] Error messages are localized

## Monitoring and Maintenance

### Health Check Endpoint
Monitor your API health at:
```
GET /api/health
```

### Logging
The API server includes comprehensive logging:
- Request/response logging
- Error tracking
- Email sending status
- Database operations

### Regular Maintenance Tasks
1. **Weekly:** Check Airtable for new signups
2. **Monthly:** Review email delivery rates in Mailgun
3. **Quarterly:** Clean up expired/old records
4. **As needed:** Update confirmation email templates

### Scaling Considerations
- **Free tier limits:**
  - Airtable: 1,200 records/month
  - Mailgun: 5,000 emails/month

- **Upgrade paths:**
  - Airtable Plus: $10/month for 5,000 records
  - Mailgun Flex: Pay-as-you-go pricing
  - Consider MongoDB or PostgreSQL for larger scale

## Troubleshooting

### Common Issues

**1. CORS Errors**
- Verify Access-Control-Allow-Origin headers
- Check if frontend domain matches configuration
- Test with browser dev tools

**2. Email Not Sending**
- Verify Mailgun domain verification
- Check API key permissions
- Review Mailgun logs
- Check `ENABLE_EMAIL_SENDING` environment variable

**3. Airtable Errors**
- Verify base ID and table name
- Check API key permissions
- Ensure field names match exactly

**4. Rate Limiting Issues**
- Adjust `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS`
- Monitor rate limit headers in responses
- Consider implementing per-email limits

**5. Environment Variables Not Working**
- Verify `.env` file location
- Check variable names for typos
- Ensure no quotes around values in `.env`

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG=true
LOG_LEVEL=debug
```

## Security Best Practices

1. **Environment Variables:**
   - Never commit API keys to version control
   - Use different keys for staging/production
   - Rotate keys regularly

2. **Rate Limiting:**
   - Monitor for unusual activity
   - Adjust limits based on usage patterns
   - Consider implementing IP blocking

3. **Data Protection:**
   - Regularly audit stored data
   - Implement data retention policies
   - Provide easy unsubscribe mechanism

4. **HTTPS:**
   - Always use HTTPS in production
   - Configure SSL certificates
   - Redirect HTTP to HTTPS

## Alternative Deployments

### Serverless Functions
If you prefer serverless deployment:
1. **Vercel Functions:** Move routes to `api/` directory
2. **AWS Lambda:** Use Serverless Framework or SAM
3. **Google Cloud Functions:** Deploy individual endpoints

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY api/package*.json ./
RUN npm ci --production
COPY api/ .
EXPOSE 8000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t emoty-api .
docker run -p 8000:8000 --env-file .env emoty-api
```

This approach provides full control over the deployment while maintaining flexibility for various hosting options.