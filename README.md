# Emoty Privacy Policy Website

Static website for the Emoty app privacy policy, available in French and English with proper localization support, including simplified ELI5 (Explain Like I'm 5) versions.

## 🌐 Live Site

### Main Pages
- **French (Default)**: [emoty.fr](https://emoty.fr)
- **English**: [emoty.fr/en-GB/](https://emoty.fr/en-GB/)
- **French Informal (tu)**: [emoty.fr/tu/](https://emoty.fr/tu/)

### Simplified Versions (ELI5)
- **French Simplified**: [emoty.fr/eli5/](https://emoty.fr/eli5/)
- **English Simplified**: [emoty.fr/en-GB/eli5/](https://emoty.fr/en-GB/eli5/)

### Privacy Policies
- **French Privacy Policy**: [emoty.fr/privacy-policy/](https://emoty.fr/privacy-policy/)
- **English Privacy Policy**: [emoty.fr/en-GB/privacy-policy/](https://emoty.fr/en-GB/privacy-policy/)
- **French Informal Privacy Policy**: [emoty.fr/tu/privacy-policy/](https://emoty.fr/tu/privacy-policy/)

## 📁 Project Structure

```
emoty-privacy-policy/
├── index.html              # French homepage (default language at root)
├── privacy-policy/         
│   └── index.html          # French privacy policy
├── eli5/
│   └── index.html          # French simplified (ELI5) version
├── en-GB/                  # English content directory
│   ├── index.html          # English homepage
│   ├── privacy-policy/
│   │   └── index.html      # English privacy policy
│   └── eli5/
│       └── index.html      # English simplified (ELI5) version
├── tu/                     # French informal content (tutoiement)
│   ├── index.html          # French informal homepage
│   └── privacy-policy/
│       └── index.html      # French informal privacy policy
├── build/                  # Localization build system
│   ├── generate_site.py    # Python site generator
│   ├── templates/          # Jinja2 templates
│   ├── locales/           # Translation files (.po/.mo)
│   ├── output/            # Generated files (not deployed)
│   └── config/            # Build configuration
├── _config.yml            # Jekyll configuration for GitHub Pages
├── CNAME                  # Custom domain configuration
└── .nojekyll              # Ensures proper directory serving
```

Note: The `/fr-FR/` directory may exist but is no longer needed since French content is served from the root.

## 🛠️ Development

The site uses a Python-based localization system with Babel and Jinja2. See [`build/README.md`](build/README.md) for detailed build system documentation.

### Quick Start

```bash
# Build localized site
cd build
source venv/bin/activate
python generate_site.py build

# Deploy to main directory
python generate_site.py deploy --target ../

# IMPORTANT: Restore French content to root after deployment
# The build system generates English at root, so manual restoration is needed
cp build/output/fr-FR/index.html index.html
cp build/output/fr-FR/privacy-policy/index.html privacy-policy/index.html
cp build/output/fr-FR/eli5/index.html eli5/index.html
```

## 🌍 Languages & Versions

- **French** (default): `/` - Formal French at root
- **English**: `/en-GB/` - British English
- **French Informal**: `/tu/` - Casual French using "tu"
- **French ELI5**: `/eli5/` - Simplified French for young readers
- **English ELI5**: `/en-GB/eli5/` - Simplified English for young readers

## ✨ Features

### Language Support
- **Automatic Language Detection**: Redirects users to their preferred language based on browser settings
- **Manual Language Selection**: Users can switch languages with persistent preference storage
- **Multiple French Variants**: Formal (vous) and informal (tu) versions available

### Accessibility
- **ELI5 Versions**: Simplified content for young readers in both languages
- **Clear Navigation**: Home buttons and language switchers on all pages
- **Mobile Responsive**: Optimized for all device sizes

## 📱 About Emoty

Emoty is an Android app for creating beautiful emoji patterns with AI assistance. The app is:

- **Privacy-focused**: All data stays on device
- **COPPA compliant**: Safe for children under 13
- **AI-powered**: Uses Claude AI for pattern naming
- **Multilingual**: Available in English and French

[Download on Google Play](https://play.google.com/store/apps/details?id=com.carcher.emoty)

## 📄 Privacy Policy

The full privacy policy content is available in multiple versions:

### Standard Versions
- [French Version](https://emoty.fr/privacy-policy) (Formal)
- [French Informal Version](https://emoty.fr/tu/privacy-policy) (Using "tu")
- [English Version](https://emoty.fr/en-GB/privacy-policy)

### ELI5 (Simplified) Versions
- [French ELI5](https://emoty.fr/eli5/) - For young French readers
- [English ELI5](https://emoty.fr/en-GB/eli5/) - For young English readers

## 👨‍💻 Developer

**Christopher Archer**  
📧 support@emoty.fr  

## 📄 License

© 2025 Christopher Archer. All rights reserved.