# Emoty Beta Signup Deployment Guide

## Overview
This guide explains how to deploy the serverless backend for the Emoty beta signup system. The recommended approach uses Netlify Functions with Airtable and Mailgun.

## Prerequisites

### 1. Accounts Needed
- ✅ **Netlify** account (free tier sufficient)
- ✅ **Airtable** account (free tier sufficient)
- ✅ **Mailgun** account (free tier: 5,000 emails/month)
- ✅ **GitHub** account (for repository hosting)

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

### Step 3: Netlify Deployment

1. **Connect Repository:**
   - Fork or import this repository to your GitHub
   - Connect to Netlify via GitHub integration
   - Select the repository

2. **Configure Build Settings:**
   ```
   Build command: echo "Static site"
   Publish directory: .
   Functions directory: netlify/functions
   ```

3. **Set Environment Variables:**
   Go to Site Settings → Environment Variables and add:
   ```bash
   AIRTABLE_API_KEY=your_airtable_personal_access_token
   AIRTABLE_BASE_ID=your_airtable_base_id
   MAILGUN_API_KEY=your_mailgun_private_api_key
   MAILGUN_DOMAIN=emoty.fr
   ```

4. **Deploy:**
   - Trigger deploy from Git push or manual deploy
   - Functions will be available at `yoursite.netlify.app/.netlify/functions/`

### Step 4: Frontend Configuration

1. **Update API Endpoints:**
   Replace the placeholder URLs in your frontend code:
   ```javascript
   // In index.html and en-GB/index.html
   const config = {
       apiEndpoint: 'https://yoursite.netlify.app/.netlify/functions/beta-signup',
       confirmationApiEndpoint: 'https://yoursite.netlify.app/.netlify/functions/resend-confirmation'
   };
   ```

2. **Test Forms:**
   - Visit your site and test the signup form
   - Check Netlify Functions logs for any errors
   - Verify emails are sent and received

### Step 5: Custom Domain (Optional)

1. **Configure Custom Domain:**
   - In Netlify: Site Settings → Domain Management
   - Add your custom domain (e.g., `beta.emoty.fr`)
   - Configure DNS settings

2. **Update CORS Settings:**
   ```javascript
   // In netlify/functions/beta-signup.js
   const headers = {
       'Access-Control-Allow-Origin': 'https://emoty.fr'
   };
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

### Analytics Setup
```javascript
// Add to functions for basic analytics
console.log('Signup:', { 
    email: data.email, 
    language: data.language, 
    timestamp: new Date().toISOString() 
});
```

### Regular Maintenance Tasks
1. **Weekly:** Check Airtable for new signups
2. **Monthly:** Review email delivery rates in Mailgun
3. **Quarterly:** Clean up expired/old records
4. **As needed:** Update confirmation email templates

### Scaling Considerations
- **Free tier limits:**
  - Netlify: 125K function invocations/month
  - Airtable: 1,200 records/month
  - Mailgun: 5,000 emails/month

- **Upgrade paths:**
  - Netlify Pro: $19/month for 2M function invocations
  - Airtable Plus: $10/month for 5,000 records
  - Mailgun Flex: Pay-as-you-go pricing

## Troubleshooting

### Common Issues

**1. Function Not Found (404)**
- Check netlify.toml configuration
- Verify functions directory structure
- Redeploy the site

**2. CORS Errors**
- Verify Access-Control-Allow-Origin headers
- Check if frontend domain matches configuration
- Test with browser dev tools

**3. Email Not Sending**
- Verify Mailgun domain verification
- Check API key permissions
- Review Mailgun logs

**4. Airtable Errors**
- Verify base ID and table name
- Check API key permissions
- Ensure field names match exactly

**5. Environment Variables Not Working**
- Redeploy after adding variables
- Check variable names for typos
- Verify values don't have extra spaces

### Debug Mode
Enable debug logging by adding to environment variables:
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

4. **Monitoring:**
   - Set up alerts for function failures
   - Monitor email delivery rates
   - Track signup conversion rates

## Alternative Deployments

### Vercel Functions
If you prefer Vercel over Netlify:
1. Move functions from `netlify/functions/` to `api/`
2. Update function exports for Vercel format
3. Configure environment variables in Vercel dashboard

### GitHub Actions + External Services
For a fully GitHub-based solution:
1. Use GitHub Actions to process form submissions
2. Store data in GitHub Issues or external API
3. Send emails via GitHub Actions workflows

This approach is more complex but keeps everything in GitHub's ecosystem.