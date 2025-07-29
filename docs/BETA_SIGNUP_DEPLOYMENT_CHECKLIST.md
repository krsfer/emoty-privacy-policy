# Beta Signup Form Deployment Checklist

This checklist covers the complete process for deploying the beta signup form to the Emoty website using the build system.

## Prerequisites

- [ ] Python 3.x installed
- [ ] Virtual environment created in `build/` directory
- [ ] Required packages installed (`pip install -r build/requirements.txt`)
- [ ] API server configured and deployed
- [ ] Environment variables set (AIRTABLE_API_KEY, AIRTABLE_BASE_ID, MAILGUN_API_KEY, MAILGUN_DOMAIN)

## Template System Setup

### 1. Base Template Updates
- [ ] Add signup form CSS styles to `build/templates/base.html.j2`
  - [ ] Form container styles (`.signup-section`)
  - [ ] Form input styles (`.form-group`, `.checkbox-container`)
  - [ ] Button styles (`.signup-button`)
  - [ ] Error/success message styles
  - [ ] Mobile responsive styles
- [ ] Add signup script block to base template (`{% block signup_script %}`)

### 2. Index Template Updates
- [ ] Add signup form HTML to `build/templates/index.html.j2`
  - [ ] Form structure with proper accessibility attributes
  - [ ] Email input with validation
  - [ ] Consent checkbox with GDPR compliance
  - [ ] Success and error message containers
- [ ] Add signup JavaScript functionality
  - [ ] Form validation logic
  - [ ] API integration with Express endpoints
  - [ ] Multi-language translation support
  - [ ] Local storage for pending confirmations

### 3. Localization Updates
- [ ] Add French translations to `build/locales/fr-tu/LC_MESSAGES/messages.po`
  - [ ] `signup.title`
  - [ ] `signup.description`
  - [ ] `signup.email_label`
  - [ ] `signup.email_placeholder`
  - [ ] `signup.email_help`
  - [ ] `signup.consent_label`
  - [ ] `signup.consent_help_before`
  - [ ] `signup.consent_help_link`
  - [ ] `signup.button`
  - [ ] Success and error messages
- [ ] Add English translations to `build/locales/en/LC_MESSAGES/messages.po`
  - [ ] All corresponding English strings

## Build Process

### 4. Build Commands
```bash
cd build/
source build_venv/bin/activate  # or create if doesn't exist
```

- [ ] **Build**: `python generate_site.py build`
  - [ ] Compiles translation files (.po → .mo)
  - [ ] Generates French pages from templates
  - [ ] Generates English pages from templates
  - [ ] Validates HTML structure
- [ ] **Validate**: `python generate_site.py validate`
  - [ ] Checks all generated HTML files
  - [ ] Validates proper structure and syntax
- [ ] **Deploy**: `python generate_site.py deploy --target ../`
  - [ ] Copies generated files to root directory
  - [ ] Overwrites existing files
  - [ ] Preserves directory structure

## Git Deployment

### 5. Version Control and Deployment
- [ ] **Stage all changes**: `git add .`
  - [ ] Includes updated HTML files in root directory
  - [ ] Includes any template changes
  - [ ] Includes translation file updates
- [ ] **Commit changes**: `git commit -m "feat: add beta signup form to website"`
  - [ ] Use conventional commit format
  - [ ] Include descriptive commit message
- [ ] **Push to repository**: `git push`
  - [ ] Triggers automatic deployment (if configured)
  - [ ] Site will be live within 1-2 minutes

## Verification

### 6. Post-Deployment Checks
- [ ] Verify signup form HTML present in `/index.html`
  - [ ] Check for `<div class="signup-section">`
  - [ ] Verify French text: "🧪 Participe aux Tests Beta"
- [ ] Verify signup form HTML present in `/en-GB/index.html`
  - [ ] Check for `<div class="signup-section">`
  - [ ] Verify English text: "🧪 Join the Beta Testing"
- [ ] Check CSS styles are included
  - [ ] Form styling classes present
  - [ ] Mobile responsive styles included
- [ ] Check JavaScript functionality is included
  - [ ] Form validation logic present
  - [ ] API endpoints configured correctly
  - [ ] Translation strings match locale

### 7. Backend Integration Verification
- [ ] Express API server deployed
  - [ ] Health check endpoint responding
  - [ ] Signup endpoints accessible
  - [ ] CORS configured correctly
- [ ] API configuration correct
  - [ ] Rate limiting enabled
  - [ ] Error handling in place
  - [ ] Logging configured
- [ ] Environment variables configured on hosting provider
  - [ ] `AIRTABLE_API_KEY`
  - [ ] `AIRTABLE_BASE_ID`
  - [ ] `MAILGUN_API_KEY`
  - [ ] `MAILGUN_DOMAIN`

## Testing

### 8. Functional Testing
- [ ] Test form submission (with simulation fallback)
- [ ] Test email validation
- [ ] Test consent checkbox requirement
- [ ] Test success message display
- [ ] Test error handling
- [ ] Test language switching
- [ ] Test mobile responsiveness
- [ ] Test accessibility features (screen readers, keyboard navigation)

### 9. Live Site Verification
- [ ] Visit https://emoty.fr and verify signup form appears
- [ ] Visit https://emoty.fr/en-GB/ and verify signup form appears
- [ ] Test actual form submission with real email
- [ ] Verify confirmation email received
- [ ] Test confirmation link functionality

## Rollback Plan

### 10. Emergency Rollback (if issues occur)
- [ ] Restore previous version of files from git
- [ ] Re-run build process with previous templates
- [ ] Verify site functionality restored
- [ ] Document issues for future fixes

## Maintenance

### 11. Future Updates
- [ ] Document any template changes in git commits
- [ ] Update this checklist if process changes
- [ ] Keep translation files updated
- [ ] Monitor form submission rates and errors
- [ ] Regular testing of email delivery

---

## Quick Commands Reference

```bash
# Full deployment process
cd build/
source build_venv/bin/activate
python generate_site.py build && python generate_site.py validate && python generate_site.py deploy --target ../

# Git deployment
cd ../
git add .
git commit -m "feat: add beta signup form to website"
git push

# Check deployment success
grep -A 3 "signup-section" index.html
grep -A 3 "signup-section" en-GB/index.html
```

## API Integration

### Frontend Configuration
The frontend is configured to use relative API endpoints:
```javascript
const config = {
    apiEndpoint: '/api/beta-signup',
    confirmationApiEndpoint: '/api/resend-confirmation'
};
```

### Deployment Options
1. **Same Domain**: Deploy API on same domain as frontend
2. **Subdomain**: Deploy API on api.emoty.fr
3. **Separate Service**: Deploy API on separate hosting service

## Notes

- The build system uses Jinja2 templates with Babel for internationalization
- All changes must be made to templates, not directly to HTML files
- The deployment process overwrites files in the root directory
- Form submissions are handled by the Express API server
- Double opt-in process ensures GDPR compliance
- API server provides flexibility for various hosting options