# Emoty Privacy Policy Website

Static website for the Emoty app privacy policy, available in French and English with proper localization support, including simplified ELI5 (Explain Like I'm 5) versions.

## 🌐 Live Site

- **French (Default)**: [emoty.fr](https://emoty.fr)
- **English**: [emoty.fr/en-GB/](https://emoty.fr/en-GB/)
- **French Informal**: [emoty.fr/tu/](https://emoty.fr/tu/)
- **French ELI5**: [emoty.fr/eli5/](https://emoty.fr/eli5/)
- **English ELI5**: [emoty.fr/en-GB/eli5/](https://emoty.fr/en-GB/eli5/)

## 📁 Project Structure

```
├── index.html              # French homepage (default)
├── privacy-policy/         
│   └── index.html          # French privacy policy
├── eli5/
│   └── index.html          # French ELI5 simplified page
├── en-GB/                  # English content
│   ├── index.html          # English homepage
│   ├── privacy-policy/
│   │   └── index.html      # English privacy policy
│   └── eli5/
│       └── index.html      # English ELI5 simplified page
├── tu/                     # French informal content
│   ├── index.html          # French informal homepage
│   └── privacy-policy/
│       └── index.html      # French informal privacy policy
├── fr-FR/                  # Build system output (backup)
└── build/                  # Localization build system
    ├── generate_site.py    # Python generator script
    ├── templates/          # Jinja2 templates
    ├── locales/           # Translation files (PO/MO)
    └── README.md          # Build system documentation
```

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