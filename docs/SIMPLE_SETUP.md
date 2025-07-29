# Simple Beta Signup Setup (5 Minutes)

## Option 1: Formspree (Easiest - No Code Required)

### Step 1: Create Formspree Account
1. Go to [formspree.io](https://formspree.io)
2. Sign up for free account
3. Create new form called "Emoty Beta Signup"

### Step 2: Update Frontend Forms
Replace the JavaScript in both `index.html` and `en-GB/index.html`:

```html
<!-- French Form (index.html) -->
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" id="signupForm" class="signup-form">
    <input type="hidden" name="_subject" value="Emoty Beta Signup (Français)">
    <input type="hidden" name="_language" value="fr">
    <input type="hidden" name="_next" value="https://emoty.fr/thanks?lang=fr">
    <input type="hidden" name="_template" value="table">
    
    <div class="form-group">
        <label for="email">Adresse email :</label>
        <input type="email" name="email" id="email" required placeholder="ton@email.fr">
        <div class="help-text">Nous utiliserons cette adresse uniquement pour les invitations aux tests</div>
    </div>
    
    <div class="form-group">
        <label class="checkbox-container">
            <input type="checkbox" name="consent" required value="true">
            <span class="checkmark"></span>
            J'accepte de recevoir des emails de test beta d'Emoty
        </label>
        <div class="help-text">
            Tu peux te désinscrire à tout moment. Voir notre <a href="/privacy-policy">politique de confidentialité</a>.
        </div>
    </div>
    
    <button type="submit" class="button signup-button">
        S'inscrire aux Tests Beta
    </button>
</form>
```

```html
<!-- English Form (en-GB/index.html) -->
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" id="signupForm" class="signup-form">
    <input type="hidden" name="_subject" value="Emoty Beta Signup (English)">
    <input type="hidden" name="_language" value="en">
    <input type="hidden" name="_next" value="https://emoty.fr/en-GB/thanks">
    <input type="hidden" name="_template" value="table">
    
    <div class="form-group">
        <label for="email">Email address:</label>
        <input type="email" name="email" id="email" required placeholder="your@email.com">
        <div class="help-text">We'll only use this address for beta test invitations</div>
    </div>
    
    <div class="form-group">
        <label class="checkbox-container">
            <input type="checkbox" name="consent" required value="true">
            <span class="checkmark"></span>
            I agree to receive beta testing emails from Emoty
        </label>
        <div class="help-text">
            You can unsubscribe at any time. See our <a href="/en-GB/privacy-policy">privacy policy</a>.
        </div>
    </div>
    
    <button type="submit" class="button signup-button">
        Sign Up for Beta Testing
    </button>
</form>
```

### Step 3: Create Thank You Pages

Create `thanks.html` and `en-GB/thanks.html`:

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Merci pour votre inscription - Emoty</title>
    <meta http-equiv="refresh" content="3;url=https://emoty.fr">
    <style>
        /* Copy styles from index.html */
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background: #f5f5f5; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .success-box { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        .logo { font-family: 'Inter', sans-serif; font-size: 2em; font-weight: 300; color: #667eea; letter-spacing: 0.2em; margin-bottom: 20px; }
        h1 { color: #28a745; }
        .button { display: inline-block; background: #667eea; color: white; text-decoration: none; padding: 15px 30px; border-radius: 30px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-box">
            <div class="logo">e m o t y 💬</div>
            <h1>✅ Inscription Réussie !</h1>
            <p>Merci de votre intérêt pour le programme beta d'Emoty.</p>
            <p>Nous vous contacterons bientôt avec les détails des tests beta.</p>
            <p><em>Redirection vers emoty.fr...</em></p>
            <a href="/" class="button">Retourner à Emoty</a>
        </div>
    </div>
</body>
</html>
```

### Step 4: Configure Formspree
1. In Formspree dashboard, configure:
   - ✅ Enable reCAPTCHA
   - ✅ Set up email notifications
   - ✅ Configure double opt-in (paid feature)

---

## Option 2: EmailJS (Client-Side)

### Step 1: Create EmailJS Account
1. Go to [emailjs.com](https://emailjs.com)
2. Connect your email service (Gmail, Outlook, etc.)
3. Create email template

### Step 2: Add EmailJS Script
```html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
<script>
    emailjs.init('YOUR_PUBLIC_KEY');
    
    function sendEmail(formData) {
        return emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
            email: formData.email,
            language: formData.language,
            consent: formData.consent,
            timestamp: new Date().toISOString()
        });
    }
</script>
```

### Step 3: Update Form Handler
Replace the fetch API calls with EmailJS calls in your existing JavaScript.

---

## Option 3: Google Forms (Ultra Simple)

### Step 1: Create Google Form
1. Go to [forms.google.com](https://forms.google.com)
2. Create form with fields:
   - Email (required)
   - Language (multiple choice: French/English)
   - Consent (checkbox, required)

### Step 2: Embed or Link
Either embed the form or link to it from your signup sections.

### Step 3: Configure Responses
Set up Google Sheets integration and email notifications.

---

## Option 4: Custom API Server

### Step 1: Deploy Express API
Follow the main DEPLOYMENT_GUIDE.md to deploy the Express API server.

### Step 2: Configure Frontend
The frontend is already configured to use the API endpoints:
```javascript
const config = {
    apiEndpoint: '/api/beta-signup',
    confirmationApiEndpoint: '/api/resend-confirmation'
};
```

### Step 3: Set Up Environment
Configure your hosting provider with the required environment variables.

---

## Recommendation

**For immediate deployment:** Use **Formspree** (Option 1)
- ✅ 5-minute setup
- ✅ Built-in spam protection
- ✅ Email notifications
- ✅ GDPR compliant
- ✅ Free tier: 50 submissions/month

**For more control:** Use **Express API Server** (Option 4)
- ✅ Full customization
- ✅ Higher limits
- ✅ Professional appearance
- ✅ Advanced features
- ✅ Complete control over data

## Quick Start with Formspree

1. **Sign up at formspree.io**
2. **Create new form** called "Emoty Beta"
3. **Copy your form ID** (looks like `xdorwgwz`)
4. **Replace `YOUR_FORM_ID`** in the code above
5. **Update both language forms**
6. **Create thank you pages**
7. **Test the forms**

That's it! Your beta signup is now live and collecting emails. You can view submissions in your Formspree dashboard and export them as needed.