# Emoty Privacy Policy Site Deployment Guide

## Overview
This guide explains how to deploy the Emoty privacy policy website, which includes a multilingual static site with beta signup functionality.

## Prerequisites

### Development Environment
- ✅ **Python 3.8+** with pip
- ✅ **Node.js 18+** with npm (for CI/CD automation)
- ✅ **Git** for version control
- ✅ **GitHub** account (for repository hosting and CI/CD)

### Required Python Packages
- ✅ **Jinja2** for templating
- ✅ **Babel** for internationalization
- ✅ **Click** for CLI interface
- ✅ **PyYAML** for configuration

Install with:
```bash
cd build
pip install -r requirements.txt
```

### Optional Services (for beta signup)
- ✅ **Airtable** account (free tier sufficient)
- ✅ **Mailgun** account (free tier: 5,000 emails/month)

## Quick Deployment

### Standard Deployment Process
The deployment process consists of three main steps:

1. **Build** - Generate static files from templates
2. **Validate** - Check generated files for errors
3. **Deploy** - Copy files to target directory
4. **Version & Commit** - Update version and push to GitHub

```bash
# Complete deployment sequence
python generate_site.py build && python generate_site.py validate && python generate_site.py deploy --target ../

# Commit and push (triggers GitHub CI/CD)
git add -A
git commit -m "chore: deploy v$(cat config/site_config.json | grep version | cut -d'"' -f4)"
git push
```

### GitHub CI/CD Integration
The repository includes automated version bumping and deployment:
- **Automatic versioning** via npm version (semantic versioning)
- **Git tags** created for each release
- **GitHub Actions** (optional) for automated deployment
- **Site config sync** with package.json version

## Build System Architecture

### Core Components

1. **`generate_site.py`** - Main build script with CLI interface
2. **`templates/`** - Jinja2 templates for all pages
3. **`locales/`** - Translation files (.po/.mo format)
4. **`config/`** - Site configuration (site_config.json)
5. **`static/`** - Static assets (CSS, images, etc.)

### Multi-language Support
The site supports mixed French formality:
- **Informal French (fr-tu)** - Used for homepage and ELI5 pages
- **Formal French (fr)** - Used only for privacy policy
- **English (en)** - Standard English for all pages

### Template System
Templates use Jinja2 with internationalization:
```html
<h1>{{ _("privacy.title") }}</h1>
<p>{{ _("privacy.description") }}</p>
```

JavaScript escaping for French apostrophes:
```html
signupButton: "{{ _("signup.button")|replace("'", "\\\\'") }}"
```

## Detailed Build Process

### Build Command
```bash
python generate_site.py build
```

**Actions performed:**
1. Load site configuration from `config/site_config.json`
2. Compile translation files (.po → .mo)
3. Process templates with Jinja2
4. Generate static HTML files for all languages
5. Copy static assets
6. Validate internal links

### Validate Command
```bash
python generate_site.py validate
```

**Validation checks:**
1. HTML syntax validation
2. Internal link verification
3. Translation completeness
4. JavaScript syntax (Chrome compatibility)
5. Accessibility compliance

### Deploy Command
```bash
python generate_site.py deploy --target ../
```

**Deployment actions:**
1. Copy generated files to target directory
2. Preserve directory structure
3. Update file permissions
4. Generate deployment report

## GitHub CI/CD Workflow

### Automated Version Management
The repository uses npm for semantic versioning:

```bash
# Version is automatically bumped on push
# package.json and site_config.json stay in sync
# Git tags are created automatically
```

### Deployment Workflow
1. **Make changes** to templates, translations, or config
2. **Build and validate** locally:
   ```bash
   python generate_site.py build && python generate_site.py validate && python generate_site.py deploy --target ../
   ```
3. **Commit and push**:
   ```bash
   git add -A
   git commit -m "feat: add new privacy policy section"
   git push
   ```
4. **Automatic version bump** occurs via GitHub hooks
5. **Deploy to production** (manual or automated)

### Continuous Integration
The repository supports GitHub Actions for:
- **Automated testing** of build process
- **Link validation** across all languages
- **Accessibility testing** 
- **JavaScript syntax validation**
- **Translation completeness checks**

Example `.github/workflows/deploy.yml`:
```yaml
name: Deploy Privacy Policy Site
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: |
          cd build
          pip install -r requirements.txt
      - name: Build and validate
        run: |
          cd build
          python generate_site.py build
          python generate_site.py validate
      - name: Deploy to production
        run: |
          cd build
          python generate_site.py deploy --target ../
```

## Translation Management

### Adding New Translations
1. **Extract strings** from templates:
   ```bash
   cd build
   pybabel extract -F babel.cfg -o locales/messages.pot templates/
   ```

2. **Update translation files**:
   ```bash
   # French informal (homepage/ELI5)
   pybabel update -i locales/messages.pot -d locales -l fr-tu
   
   # French formal (privacy policy)
   pybabel update -i locales/messages.pot -d locales -l fr
   
   # English
   pybabel update -i locales/messages.pot -d locales -l en
   ```

3. **Edit .po files** with translations
4. **Compile** translations are compiled automatically during build

### JavaScript String Escaping
For French translations with apostrophes, use the escape filter:
```html
// Template
signupButton: "{{ _("signup.button")|replace("'", "\\\\'") }}"

// .po file (no pre-escaping needed)
msgstr "S'inscrire aux Tests Beta"

// Generated JavaScript (correctly escaped)
signupButton: "S\\'inscrire aux Tests Beta"
```

## Optional Beta Signup Backend

### Quick Setup (if needed)
For the beta signup functionality, you'll need:

1. **Airtable** for storing signups
2. **Mailgun** for confirmation emails  
3. **Express API server** (see api/ directory)

### Environment Configuration
```bash
# In api/.env
AIRTABLE_API_KEY=your_key
AIRTABLE_BASE_ID=your_base_id
MAILGUN_API_KEY=your_key
MAILGUN_DOMAIN=emoty.fr
```

### API Server Deployment Options

#### Option A: Heroku
```bash
cd api
heroku create emoty-beta-api
heroku config:set AIRTABLE_API_KEY=your_key MAILGUN_API_KEY=your_key
git push heroku main
```

#### Option B: Docker
```bash
cd api
docker build -t emoty-api .
docker run -p 8000:8000 --env-file .env emoty-api
```

#### Option C: Traditional VPS
```bash
cd api
npm install --production
pm2 start server.js --name emoty-api
```

## Testing Checklist

### ✅ Build System
- [ ] `python generate_site.py build` completes without errors
- [ ] `python generate_site.py validate` passes all checks
- [ ] `python generate_site.py deploy --target ../` copies files correctly
- [ ] All translations compile successfully (.po → .mo)
- [ ] JavaScript escaping works for French apostrophes

### ✅ Multi-language Support
- [ ] French informal (fr-tu) used on homepage and ELI5
- [ ] French formal (fr) used only on privacy policy
- [ ] English (en) works correctly on all pages
- [ ] Language switching links work properly
- [ ] Translation keys resolve correctly

### ✅ Browser Compatibility
- [ ] Chrome JavaScript syntax validation passes
- [ ] Firefox renders correctly
- [ ] Safari handles all features
- [ ] Mobile browsers work properly
- [ ] Form validation works across browsers

### ✅ Signup Functionality (if enabled)
- [ ] Form accepts valid email addresses
- [ ] Form rejects invalid email addresses
- [ ] Consent checkbox is required
- [ ] Button remains disabled until all fields filled
- [ ] JavaScript form validation works properly
- [ ] Confirmation emails are sent correctly

### ✅ Version Management
- [ ] Version numbers sync between package.json and site_config.json
- [ ] Git tags are created automatically
- [ ] Footer version numbers update correctly
- [ ] Deployment reports show correct version

## Monitoring and Maintenance

### Build System Monitoring
Monitor build health with:
```bash
# Check build status
python generate_site.py build --dry-run

# Validate without deployment
python generate_site.py validate --verbose

# Check translation completeness
find locales -name "*.po" -exec msgfmt --statistics {} \;
```

### Version Tracking
```bash
# Check current version
cat build/config/site_config.json | grep version

# View recent deployments
git log --oneline --grep="chore: release"

# Check for uncommitted changes
git status
```

### Regular Maintenance Tasks
1. **Weekly:** Update translations if content changes
2. **Monthly:** Review build logs for warnings
3. **Quarterly:** Update dependencies in requirements.txt
4. **As needed:** Test cross-browser compatibility

### Performance Considerations
- **Static site advantages:**
  - No server-side processing needed
  - CDN-friendly architecture
  - Fast loading times
  - High availability

- **Build optimization:**
  - Minify CSS/JS assets
  - Optimize images
  - Implement caching headers

## Troubleshooting

### Common Build Issues

**1. Translation Compilation Errors**
```bash
# Check .po file syntax
msgfmt --check locales/fr/LC_MESSAGES/messages.po

# Verify translation completeness
pybabel compile -d locales --statistics
```

**2. Template Rendering Errors**
```bash
# Test template syntax
python -c "from jinja2 import Template; Template(open('templates/index.html.j2').read())"

# Check for missing translation keys
python generate_site.py build --verbose
```

**3. JavaScript Escaping Issues**
```bash
# Check for unescaped apostrophes in French
grep -n "'" locales/fr*/LC_MESSAGES/messages.po

# Verify generated JavaScript syntax
node -c ../index.html  # Extract JS and test
```

**4. Deployment Path Issues**
```bash
# Verify target directory exists
ls -la ../

# Check file permissions
python generate_site.py deploy --target ../ --verbose
```

**5. Version Sync Problems**
```bash
# Check version consistency
cat build/config/site_config.json package.json | grep version

# Reset version if out of sync
npm version patch --no-git-tag-version
```

### Debug Mode
Enable verbose logging:
```bash
python generate_site.py build --verbose
python generate_site.py validate --debug
```

## Security Best Practices

### Build Security
1. **Dependencies:** Regularly update requirements.txt packages
2. **Templates:** Validate all template variables and filters
3. **Static Assets:** Scan for embedded sensitive data
4. **JavaScript:** Validate syntax across browsers

### Deployment Security
1. **Git:** Never commit sensitive configuration files
2. **Permissions:** Set appropriate file permissions on deployment
3. **Validation:** Always validate before deploying to production
4. **Backups:** Maintain backups of working deployments

## Production Deployment

### Static Site Hosting Options

#### Option A: GitHub Pages
```bash
# Deploy directly from repository
git push origin main

# GitHub Pages builds automatically from root directory
```

#### Option B: Netlify
```bash
# Connect repository to Netlify
# Set build command: cd build && python generate_site.py build && python generate_site.py deploy --target ../
# Set publish directory: /
```

#### Option C: CDN + Object Storage
```bash
# Deploy to S3, Google Cloud Storage, etc.
cd build
python generate_site.py build
python generate_site.py deploy --target /tmp/emoty-site
aws s3 sync /tmp/emoty-site s3://your-bucket --delete
```

### Performance Optimization
```bash
# Minify HTML (optional)
pip install htmlmin
python -c "import htmlmin; print(htmlmin.minify(open('../index.html').read()))"

# Optimize images
pip install Pillow
python -c "from PIL import Image; img = Image.open('static/logo.png'); img.save('static/logo-optimized.png', optimize=True)"

# Enable compression
# Configure gzip/brotli on your web server
```

This updated guide focuses on the static site generator and modern GitHub CI/CD workflow, with optional backend services as needed.