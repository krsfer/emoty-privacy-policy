# Railway Deployment Guide

## 🚂 Quick Deploy to Railway

### Prerequisites
- GitHub account
- Your code pushed to GitHub

### Step 1: Connect to Railway
1. Go to [railway.app](https://railway.app/)
2. Click "Start a New Project"
3. Sign in with GitHub
4. Select "Deploy from GitHub repo"
5. Choose `emoty-privacy-policy` repository

### Step 2: Configure Service
Railway will auto-detect Node.js. The `railway.json` file will:
- Set build directory to `api/`
- Run `npm install` during build
- Start with `npm start`

### Step 3: Add Environment Variables
In Railway dashboard → Variables tab, add:

```bash
# Required
PORT=8000
NODE_ENV=production
ENABLE_NOTIFICATIONS=true
NOTIFICATION_EMAIL=onboardemoty@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=onboardemoty@gmail.com
SMTP_PASS=somePass

# Features
ENABLE_EMAIL_SENDING=true
ENABLE_RATE_LIMITING=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Optional (add if using)
AIRTABLE_API_KEY=your_key
AIRTABLE_BASE_ID=your_base_id
```

### Step 4: Deploy
1. Railway will automatically start deployment
2. Watch the build logs
3. Once deployed, you'll get a URL like:
   - `https://emoty-api.up.railway.app`

### Step 5: Update Frontend
Replace the API URLs in your HTML files:

```javascript
// In index.html and en-GB/index.html
const config = {
    apiEndpoint: 'https://emoty-api.up.railway.app/api/beta-signup',
    confirmationApiEndpoint: 'https://emoty-api.up.railway.app/api/resend-confirmation'
};
```

### Step 6: Test
```bash
# Test health endpoint
curl https://emoty-api.up.railway.app/api/health

# Test signup endpoint
curl -X POST https://emoty-api.up.railway.app/api/beta-signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","consent":true,"language":"fr"}'
```

## 🔄 Auto-Deploy Setup

Railway automatically deploys when you:
1. Push to your default branch (main/master)
2. Merge a pull request

To disable auto-deploy:
1. Go to Settings → Service
2. Toggle off "Auto Deploy"

## 📊 Monitoring

Railway provides:
- Deployment logs
- Runtime logs
- Metrics (CPU, Memory, Network)
- Custom domains
- Environment management

## 💰 Pricing

- **Free tier**: $5 credit/month
- **Hobby**: $5/month
- Includes:
  - 8GB RAM
  - Unlimited deployments
  - Custom domains
  - SSL certificates

## 🚨 Troubleshooting

### Build fails
- Check `railway.json` paths
- Verify `package.json` exists in `api/`
- Check build logs

### App crashes
- Check environment variables
- Look at runtime logs
- Verify `npm start` works locally

### CORS errors
- Update `api/server.js` CORS origins:
```javascript
cors({
    origin: [
        'https://emoty.fr',
        'https://www.emoty.fr',
        'http://localhost:3000'
    ]
})
```

## 🎉 Success!
Your API is now:
- Auto-deploying from GitHub
- Sending email notifications
- Ready for production use

Next steps:
1. Add custom domain (optional)
2. Set up monitoring alerts
3. Configure database (if needed)