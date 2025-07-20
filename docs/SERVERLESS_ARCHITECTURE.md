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

### B. Netlify Forms (If hosting on Netlify)
**Setup:** Add `netlify` attribute to form and data-netlify="true"
**Features:** Built-in spam protection, notifications, integrations

### C. ConvertKit/Mailchimp (Email-focused)
**Benefits:** Professional email marketing, automation, analytics
**Integration:** Use their API with serverless functions

## Option 2: Serverless Functions (Recommended)

### A. Netlify Functions
Deploy to Netlify (free hosting) and use Netlify Functions for backend.

**Structure:**
```
netlify/
  functions/
    beta-signup.js
    resend-confirmation.js
    confirm-signup.js
```

### B. Vercel Functions
Deploy to Vercel (free hosting) and use Vercel Functions.

**Structure:**
```
api/
  beta-signup.js
  resend-confirmation.js
  confirm-signup.js
```

### C. GitHub Actions + External Database
Use GitHub Actions to process form submissions and store in external services.

## Option 3: Hybrid Approach (Best of Both Worlds)

**Frontend:** GitHub Pages (free, fast)
**Backend:** Serverless functions on Netlify/Vercel (free tier)
**Database:** Airtable, Google Sheets, or FaunaDB (free tiers)
**Email:** EmailJS, ConvertKit, or Mailgun (free tiers)

## Recommended Implementation: Netlify Functions + Airtable

### Why This Combination?
- ✅ **Free hosting** on both GitHub Pages and Netlify
- ✅ **No server management** required
- ✅ **GDPR compliant** with proper configuration
- ✅ **Scalable** to thousands of signups
- ✅ **Easy to manage** with GUI interface (Airtable)

### Architecture Flow:
1. User submits form on emoty.fr (GitHub Pages)
2. Form posts to Netlify Function endpoint
3. Function validates data and stores in Airtable
4. Function sends confirmation email via EmailJS/Mailgun
5. User clicks confirmation link → another Netlify Function
6. Function updates Airtable record as confirmed

### Cost Breakdown (Free Tiers):
- GitHub Pages: Free
- Netlify Functions: 125K requests/month free
- Airtable: 1,200 records/month free
- EmailJS: 200 emails/month free
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

#### Option B: Google Sheets
- Use Google Sheets API
- Free up to 100 requests/100 seconds
- Easy to view and manage data

#### Option C: FaunaDB
- Serverless database
- 100K read/write operations free
- More complex but very scalable

### Security Considerations:
- Store API keys in Netlify environment variables
- Use CORS restrictions
- Implement rate limiting
- Validate all inputs server-side
- Hash confirmation tokens

## Implementation Priority:

### Phase 1: MVP (1-2 hours)
Use Formspree or similar service for immediate functionality

### Phase 2: Custom Solution (4-6 hours)
Implement Netlify Functions + Airtable for full control

### Phase 3: Advanced Features (8+ hours)
Add analytics, A/B testing, advanced email automation

## Next Steps:
1. Choose approach based on requirements and timeline
2. Set up hosting (Netlify recommended for full solution)
3. Configure external services (Airtable, email provider)
4. Implement functions and update frontend
5. Test thoroughly with different email providers
6. Deploy and monitor