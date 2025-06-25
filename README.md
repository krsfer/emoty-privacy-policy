# Emoty Privacy Policy Website

Static website for the Emoty app privacy policy, available in English and French with proper localization support.

## 🌐 Live Site

- **English**: [emoty.fr](https://emoty.fr)
- **French**: [emoty.fr/fr-FR/](https://emoty.fr/fr-FR/)

## 📁 Project Structure

```
├── index.html              # English homepage
├── privacy-policy.html     # English privacy policy
├── fr-FR/
│   ├── index.html          # French homepage
│   └── privacy-policy.html # French privacy policy
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
```

## 🌍 Languages

- **English** (default): `/`
- **French**: `/fr-FR/`

## 📱 About Emoty

Emoty is an Android app for creating beautiful emoji patterns with AI assistance. The app is:

- **Privacy-focused**: All data stays on device
- **COPPA compliant**: Safe for children under 13
- **AI-powered**: Uses Claude AI for pattern naming
- **Multilingual**: Available in English and French

[Download on Google Play](https://play.google.com/store/apps/details?id=com.carcher.emoty)

## 📄 Privacy Policy

The full privacy policy content is available:
- [English Version](https://emoty.fr/privacy-policy)
- [French Version](https://emoty.fr/fr-FR/privacy-policy)

## 👨‍💻 Developer

**Christopher Archer**  
📧 support@emoty.fr  

## 📄 License

© 2025 Christopher Archer. All rights reserved.