# Emoty Website Generator

A Python-based localization system for generating the Emoty privacy policy website with proper L10N support using Babel and Jinja2 templates.

## Features

- **Template-based localization** using Jinja2 and Babel
- **Professional translation workflow** with PO/MO files
- **Automatic string extraction** from templates
- **Build validation** and consistency checks
- **Hot deployment** to main site directory
- **Multiple output formats** supported

## Directory Structure

```
build/
├── generate_site.py          # Main generator script
├── babel.cfg                 # Babel extraction config
├── requirements.txt          # Python dependencies
├── venv/                     # Virtual environment (excluded from git)
├── templates/
│   ├── base.html.j2          # Base template with CSS
│   └── index.html.j2         # Content template
├── locales/
│   ├── en/LC_MESSAGES/
│   │   ├── messages.po       # English translations
│   │   └── messages.mo       # Compiled messages
│   └── fr/LC_MESSAGES/
│       ├── messages.po       # French translations
│       └── messages.mo       # Compiled messages
├── config/
│   └── site_config.json     # Site configuration
└── output/                   # Generated HTML files
```

## Installation

### First Time Setup

1. **Navigate to build directory:**
```bash
cd build
```

2. **Create virtual environment:**
```bash
python3 -m venv venv
```
**Note:** The `venv/` directory is excluded from git via `.gitignore` - each developer creates their own.

3. **Activate virtual environment:**
```bash
source venv/bin/activate
```

4. **Install dependencies:**
```bash
pip install -r requirements.txt
```

### Subsequent Sessions

```bash
cd build
source venv/bin/activate
# Now ready to run build commands
```

## Usage

### Build Commands

```bash
# Activate virtual environment
source venv/bin/activate

# Build complete website
python generate_site.py build

# Extract strings from templates
python generate_site.py extract

# Compile PO files to MO files
python generate_site.py compile

# Validate generated site
python generate_site.py validate

# Deploy to main directory
python generate_site.py deploy --target ../
```

### Development Workflow

1. **Modify templates** in `templates/` directory
2. **Update translations** in `locales/*/LC_MESSAGES/messages.po`
3. **Build site:** `python generate_site.py build`
4. **Deploy:** `python generate_site.py deploy --target ../`

## Template System

### Base Template (base.html.j2)
- Contains all CSS and common HTML structure
- Supports template inheritance
- Includes responsive design and mobile optimization

### Index Template (index.html.j2)
- Extends base template
- Contains page-specific content
- Uses localized strings with `{{ _('key') }}` syntax

### Translation Keys Structure
```
meta.title                    # Page title
meta.description             # Meta description
header.tagline               # Main tagline
features.*.title             # Feature titles
features.*.description       # Feature descriptions
cta.title                    # Call-to-action title
footer.*                     # Footer content
```

## Adding New Languages

1. **Add language config** to `config/site_config.json`:
```json
"es": {
  "code": "es",
  "name": "Español", 
  "path": "/es/",
  "hreflang": "es",
  "alternate_url": "https://emoty.fr/es/"
}
```

2. **Create locale directory:**
```bash
mkdir -p locales/es/LC_MESSAGES
```

3. **Copy and translate PO file:**
```bash
cp locales/en/LC_MESSAGES/messages.po locales/es/LC_MESSAGES/
# Edit locales/es/LC_MESSAGES/messages.po with translations
```

4. **Rebuild site:**
```bash
python generate_site.py build
```

## Translation Workflow

### For Translators

1. **Edit PO files** in `locales/*/LC_MESSAGES/messages.po`
2. **Use standard PO tools** like Poedit, Lokalize, or text editor
3. **Test translations** by building the site

### For Developers

1. **Extract new strings:** `python generate_site.py extract`
2. **Update PO files** with new strings
3. **Compile translations:** `python generate_site.py compile`
4. **Build and test:** `python generate_site.py build`

## Configuration

### Site Configuration (config/site_config.json)
- **Domain and URLs:** Base URLs for each language
- **Language settings:** Locale codes, paths, hreflang attributes
- **Contact information:** Email, author, etc.
- **External links:** Google Play store, etc.

### Babel Configuration (babel.cfg)
- **Template extraction rules** for Jinja2 files
- **Extension settings** for i18n support

## Validation

The build system includes automatic validation:
- **File existence** checks for all expected outputs
- **HTML structure** validation
- **Link consistency** verification
- **Translation completeness** checking

## Benefits

- **Maintainability:** Single source of truth for content
- **Consistency:** Automated alignment between languages  
- **Scalability:** Easy to add new languages
- **Quality:** Built-in validation and checks
- **Professional workflow:** Industry-standard tools
- **Developer Experience:** Clear commands and error reporting

## Troubleshooting

### Common Issues

1. **Missing translations:**
   - Check PO files are complete
   - Run `python generate_site.py compile`

2. **Template errors:**
   - Validate Jinja2 syntax
   - Check translation key names

3. **Build failures:**
   - Activate virtual environment
   - Install dependencies with `pip install -r requirements.txt`

### Getting Help

For issues with the build system, check:
1. Error messages in console output
2. Generated files in `output/` directory
3. Translation files compilation status