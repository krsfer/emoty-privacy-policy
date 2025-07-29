# Serverless Architecture for Static Site Beta Signup

## Overview
Since emoty.fr is hosted as a static site on GitHub Pages, we need serverless solutions for the beta signup functionality. Here are several approaches, from simple to advanced.

## Option 1: Third-Party Form Services (Simplest)

### A. Formspree (Recommended for MVP)
**Pros:** No code required, built-in double opt-in, GDPR compliant
**Cons:** Limited customization, monthly limits on free plan

**Implementation:**
```html
<!-- Update form action in both language files -->
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" id="signupForm">
    <input type="email" name="email" required>
    <input type="hidden" name="_subject" value="Emoty Beta Signup">
    <input type="hidden" name="_language" value="fr">
    <input type="hidden" name="_confirmation" value="true">
    <input type="checkbox" name="consent" required>
    <button type="submit">S'inscrire aux Tests Beta</button>
</form>
```

### B. ConvertKit/Mailchimp (Email-focused)
**Benefits:** Professional email marketing, automation, analytics
**Integration:** Use their API with serverless functions

## Option 2: Serverless Functions (Recommended)

### A. Vercel Functions
Deploy to Vercel (free hosting) and use Vercel Functions.

**Structure:**
```
api/
  beta-signup.js
  resend-confirmation.js
  confirm-signup.js
```

### B. AWS Lambda
Use AWS Lambda with API Gateway for serverless endpoints.

**Benefits:**
- Highly scalable
- Pay-per-use pricing
- Integration with other AWS services

### C. GitHub Actions + External Database
Use GitHub Actions to process form submissions and store in external services.

## Option 3: Express API Server

Deploy a traditional Node.js/Express server for full control.

**Structure:**
```
api/
  server.js
  routes/
    signup.js
    health.js
  services/
    emailService.js
  utils/
    validation.js
    logger.js
```

## Recommended Implementation: Express API + Airtable

### Why This Combination?
- ✅ **Full control** over API behavior
- ✅ **Flexible deployment** options (Heroku, DigitalOcean, AWS)
- ✅ **GDPR compliant** with proper configuration
- ✅ **Scalable** to thousands of signups
- ✅ **Easy to manage** with GUI interface (Airtable)

### Architecture Flow:
1. User submits form on emoty.fr (GitHub Pages)
2. Form posts to Express API endpoint
3. API validates data and stores in Airtable
4. API sends confirmation email via Mailgun
5. User clicks confirmation link → API confirms signup
6. API updates Airtable record as confirmed

### Cost Breakdown (Free Tiers):
- GitHub Pages: Free
- Express hosting: Free on Heroku, Railway, or Render
- Airtable: 1,200 records/month free
- Mailgun: 5,000 emails/month free (with verification)

### Data Storage Options:

#### Option A: Airtable (Recommended)
```javascript
// Airtable schema
const signupRecord = {
  email: 'user@example.com',
  language: 'fr',
  consent: true,
  status: 'pending',
  confirmationToken: 'uuid-v4',
  createdAt: '2025-07-20T14:30:00.000Z',
  confirmedAt: null,
  resendCount: 0
};
```

#### Option B: PostgreSQL
- Use hosted database (Supabase, Railway)
- Free tiers available
- More control over data structure

#### Option C: MongoDB
- Use MongoDB Atlas
- 512MB storage free
- Good for flexible schemas

### Security Considerations:
- Store API keys in environment variables
- Use CORS restrictions
- Implement rate limiting
- Validate all inputs server-side
- Hash confirmation tokens
- Use HTTPS everywhere

## Implementation Priority:

### Phase 1: MVP (1-2 hours)
Use Formspree or similar service for immediate functionality

### Phase 2: Custom Solution (4-6 hours)
Implement Express API + Airtable for full control

### Phase 3: Advanced Features (8+ hours)
Add analytics, A/B testing, advanced email automation

## Alternative Serverless Platforms:

### Vercel Functions
```javascript
// api/beta-signup.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  // Handle signup logic
}
```

### AWS Lambda + API Gateway
- More complex setup
- Better for large scale
- Integration with AWS ecosystem

### Google Cloud Functions
- Simple deployment
- Good integration with Firebase
- Competitive pricing

## Next Steps:
1. Choose approach based on requirements and timeline
2. Set up hosting (Express server or serverless platform)
3. Configure external services (Airtable, email provider)
4. Implement API endpoints and update frontend
5. Test thoroughly with different email providers
6. Deploy and monitor