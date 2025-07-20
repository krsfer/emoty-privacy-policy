#!/usr/bin/env python3
"""
Emoty Website Generator - Localized Static Site Builder

This script generates the Emoty privacy policy website with proper L10N support
using Babel and Jinja2 templates.
"""

import os
import sys
import json
import shutil
import markdown
from pathlib import Path
from typing import Dict, Any

import click
from babel.support import Translations
from jinja2 import Environment, FileSystemLoader, select_autoescape


class SiteGenerator:
    """Main site generator class with localization support."""
    
    def __init__(self, build_dir: Path = None):
        self.build_dir = build_dir or Path(__file__).parent
        self.templates_dir = self.build_dir / 'templates'
        self.locales_dir = self.build_dir / 'locales' 
        self.config_dir = self.build_dir / 'config'
        self.output_dir = self.build_dir / 'output'
        
        # Load site configuration
        with open(self.config_dir / 'site_config.json', 'r', encoding='utf-8') as f:
            self.config = json.load(f)
        
        # Set up Jinja2 environment
        self.env = Environment(
            loader=FileSystemLoader(str(self.templates_dir)),
            autoescape=select_autoescape(['html', 'xml']),
            extensions=['jinja2.ext.i18n']
        )
    
    def _get_translations(self, locale: str) -> Translations:
        """Load translations for a specific locale."""
        translations_path = self.locales_dir / locale / 'LC_MESSAGES'
        
        if (translations_path / 'messages.mo').exists():
            return Translations.load(str(self.locales_dir), [locale])
        else:
            click.echo(f"Warning: No compiled translations found for {locale}")
            return Translations()
    
    def _get_language_config(self, locale: str) -> Dict[str, Any]:
        """Get language-specific configuration."""
        lang_config = self.config['languages'][locale].copy()
        
        # Add alternate language info
        if locale == 'en':
            other_locale = 'fr-tu'
        elif locale == 'fr-tu':
            other_locale = 'en'
        else:
            other_locale = 'en' # Default to English if unknown locale
        other_lang = self.config['languages'][other_locale]
        
        lang_config.update({
            'alternate_lang': other_lang['hreflang'],
            'alternate_url': other_lang['alternate_url'],
            'alternate_path': other_lang['path'],
            'privacy_policy_url': f"{lang_config['path']}privacy-policy" if locale == 'en' else f"{lang_config['path']}privacy-policy"
        })
        
        return lang_config
    
    def compile_translations(self) -> None:
        """Compile PO files to MO files for all locales."""
        click.echo("Compiling translations...")
        
        for locale in self.config['languages'].keys():
            po_file = self.locales_dir / locale / 'LC_MESSAGES' / 'messages.po'
            mo_file = self.locales_dir / locale / 'LC_MESSAGES' / 'messages.mo'
            
            if po_file.exists():
                from babel.messages.pofile import read_po
                from babel.messages.mofile import write_mo
                
                with open(po_file, 'rb') as f:
                    catalog = read_po(f)
                
                with open(mo_file, 'wb') as f:
                    write_mo(f, catalog)
                
                click.echo(f"  Compiled {locale}: {po_file} -> {mo_file}")
            else:
                click.echo(f"  Warning: {po_file} not found")
    
    def generate_index_page(self, locale: str) -> str:
        """Generate index.html for a specific locale."""
        # Load translations
        translations = self._get_translations(locale)
        self.env.install_gettext_translations(translations)
        
        # Get language configuration
        lang_config = self._get_language_config(locale)
        
        # Load template
        template = self.env.get_template('index.html.j2')
        
        # Render template
        html = template.render(
            locale=locale,
            config=self.config,
            alternate_lang=lang_config['alternate_lang'],
            alternate_url=lang_config['alternate_url'],
            alternate_path=lang_config['alternate_path'],
            privacy_policy_url=lang_config['privacy_policy_url'],
            path=lang_config['path'],
            language_detection=self.config.get('language_detection', {}),
            french_path=self.config['languages']['fr-tu']['path'],
            english_path=self.config['languages']['en']['path']
        )
        
        return html
    
    def generate_privacy_policy_page(self, locale: str) -> str:
        """Generate privacy-policy.html for a specific locale."""
        # Load translations
        translations = self._get_translations(locale)
        self.env.install_gettext_translations(translations)
        
        # Get language configuration
        lang_config = self._get_language_config(locale)
        
        # Update config with author email
        config = self.config.copy()
        config['author_email'] = 'archer.chris@gmail.com'
        
        # Update privacy policy URL for alternate language
        other_locale = 'fr-tu' if locale == 'en' else 'en'
        other_lang = self.config['languages'][other_locale]
        privacy_alternate_url = f"{other_lang['alternate_url']}privacy-policy"
        
        # Set home URL for the current locale
        home_url = "/en-GB/" if locale == 'en' else "/"
        
        # Load template
        template = self.env.get_template('privacy-policy.html.j2')
        
        # Override meta tags for privacy policy
        privacy_meta = {
            'title': translations.gettext('privacy.meta.title'),
            'description': translations.gettext('privacy.meta.description'),
            'keywords': translations.gettext('privacy.meta.keywords')
        }
        
        # Render template
        html = template.render(
            locale=locale,
            config=config,
            alternate_lang=lang_config['alternate_lang'],
            alternate_url=privacy_alternate_url,
            alternate_path=f"{other_lang['path']}privacy-policy",
            privacy_policy_url=lang_config['privacy_policy_url'],
            path=f"{lang_config['path']}privacy-policy",
            meta_override=privacy_meta,
            home_url=home_url
        )
        
        return html
    
    def generate_eli5_page(self, locale: str) -> str:
        """Generate eli5.html for a specific locale."""
        # Load translations
        translations = self._get_translations(locale)
        self.env.install_gettext_translations(translations)

        # Load template
        template = self.env.get_template('eli5.html.j2')
        
        # Get language configuration
        lang_config = self._get_language_config(locale)

        # Determine alternate ELI5 URL and path
        if locale == 'en':
            eli5_alternate_locale = 'fr-tu'
        elif locale == 'fr-tu':
            eli5_alternate_locale = 'en'
        else:
            eli5_alternate_locale = 'en' # Default to English ELI5

        eli5_other_lang = self.config['languages'][eli5_alternate_locale]
        eli5_alternate_url = f"{eli5_other_lang['alternate_url']}eli5/"
        eli5_alternate_path = f"{eli5_other_lang['path']}eli5/"

        # Set home URL for the current locale
        home_path = "/en-GB/" if locale == 'en' else "/"

        # Render template
        html = template.render(
            locale=locale,
            config=self.config,
            alternate_lang=lang_config['alternate_lang'],
            alternate_url=eli5_alternate_url,
            eli5_alternate_path=eli5_alternate_path,
            privacy_policy_url=lang_config['privacy_policy_url'],
            path=f"{lang_config['path']}eli5/",
            home_path=home_path
        )
        
        return html
    
    def generate_changelog_page(self, locale: str) -> str:
        """Generate changelog.html for a specific locale."""
        # Load translations
        translations = self._get_translations(locale)
        self.env.install_gettext_translations(translations)
        
        # Get language config
        lang_config = self._get_language_config(locale)
        
        # Determine which changelog file to load
        project_root = self.build_dir.parent
        if locale == 'en':
            changelog_path = project_root / 'docs' / 'CHANGELOG.md'
        elif locale == 'fr-tu':
            changelog_path = project_root / 'docs' / 'CHANGELOG.fr.md'
        else:
            changelog_path = project_root / 'docs' / 'CHANGELOG.md'  # Default to English
        
        # Read and convert markdown to HTML
        changelog_content = ""
        if changelog_path.exists():
            with open(changelog_path, 'r', encoding='utf-8') as f:
                markdown_content = f.read()
                # Convert markdown to HTML with proper extensions
                md = markdown.Markdown(extensions=['extra', 'codehilite', 'toc'])
                changelog_content = md.convert(markdown_content)
        else:
            changelog_content = f"<p>Changelog file not found: {changelog_path}</p>"
        
        # Set up alternate paths for language switcher
        if locale == 'en':
            # English changelog, alternate is French
            changelog_alternate_path = "/"
        elif locale == 'fr-tu':
            # French changelog, alternate is English  
            changelog_alternate_path = "/en-GB/"
        else:
            changelog_alternate_path = "/"
        
        # Home path based on locale
        home_path = "../" if locale == 'en' else "../"
        
        # Render template
        template = self.env.get_template('changelog.html.j2')
        html = template.render(
            locale=lang_config['hreflang'],
            config=self.config,
            alternate_lang=lang_config['alternate_lang'],
            alternate_url=f"{lang_config['alternate_url']}changelog/",
            alternate_path=changelog_alternate_path,
            privacy_policy_url=lang_config['privacy_policy_url'],
            path=f"{lang_config['path']}changelog/",
            home_path=home_path,
            changelog_content=changelog_content
        )
        
        return html
    
    def build_site(self) -> None:
        """Build the complete site for all locales."""
        click.echo("Building site...")
        
        # Ensure output directory exists
        self.output_dir.mkdir(exist_ok=True)
        
        # Compile translations first
        self.compile_translations()
        
        # Generate pages for each locale
        for locale, lang_config in self.config['languages'].items():
            click.echo(f"  Generating {locale} pages...")
            
            # Generate index page
            html = self.generate_index_page(locale)
            
            # Determine output path based on new structure
            if locale == 'en':
                # English goes to en-GB directory
                locale_dir = self.output_dir / 'en-GB'
                locale_dir.mkdir(exist_ok=True)
                output_path = locale_dir / 'index.html'
            elif locale == 'fr-tu':
                # Informal French goes to root (default)
                output_path = self.output_dir / 'index.html'
            
            # Write HTML file
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(html)
            
            click.echo(f"    Created: {output_path}")
            
            # Generate privacy policy page
            privacy_html = self.generate_privacy_policy_page(locale)
            
            # Determine privacy policy output path based on new structure
            if locale == 'en':
                # English privacy policy goes to en-GB/privacy-policy
                privacy_dir = self.output_dir / 'en-GB' / 'privacy-policy'
                privacy_dir.mkdir(parents=True, exist_ok=True)
                privacy_output_path = privacy_dir / 'index.html'
            elif locale == 'fr-tu':
                # Informal French privacy policy goes to root privacy-policy
                privacy_dir = self.output_dir / 'privacy-policy'
                privacy_dir.mkdir(exist_ok=True)
                privacy_output_path = privacy_dir / 'index.html'
            
            # Write privacy policy HTML file
            with open(privacy_output_path, 'w', encoding='utf-8') as f:
                f.write(privacy_html)
            
            click.echo(f"    Created: {privacy_output_path}")

            # Generate ELI5 page
            eli5_html = self.generate_eli5_page(locale)
            
            # Determine ELI5 output path based on new structure
            if locale == 'en':
                # English ELI5 goes to en-GB/eli5
                eli5_dir = self.output_dir / 'en-GB' / 'eli5'
                eli5_dir.mkdir(parents=True, exist_ok=True)
                eli5_output_path = eli5_dir / 'index.html'
            elif locale == 'fr-tu':
                # Informal French ELI5 is at root eli5 (default French)
                eli5_dir = self.output_dir / 'eli5'
                eli5_dir.mkdir(exist_ok=True)
                eli5_output_path = eli5_dir / 'index.html'

            with open(eli5_output_path, 'w', encoding='utf-8') as f:
                f.write(eli5_html)
            click.echo(f"    Created: {eli5_output_path}")
            
            # Generate Changelog page
            changelog_html = self.generate_changelog_page(locale)
            
            # Determine Changelog output path based on new structure
            if locale == 'en':
                # English Changelog goes to en-GB/changelog
                changelog_dir = self.output_dir / 'en-GB' / 'changelog'
                changelog_dir.mkdir(parents=True, exist_ok=True)
                changelog_output_path = changelog_dir / 'index.html'
            elif locale == 'fr-tu':
                # Informal French Changelog is at root changelog
                changelog_dir = self.output_dir / 'changelog'
                changelog_dir.mkdir(exist_ok=True)
                changelog_output_path = changelog_dir / 'index.html'

            with open(changelog_output_path, 'w', encoding='utf-8') as f:
                f.write(changelog_html)
            click.echo(f"    Created: {changelog_output_path}")
    
    def validate_build(self) -> bool:
        """Validate the generated site."""
        click.echo("Validating build...")
        
        # Check that all expected files exist (new structure)
        expected_files = [
            self.output_dir / 'index.html',                           # French homepage (root)
            self.output_dir / 'privacy-policy' / 'index.html',       # French privacy policy (root)
            self.output_dir / 'eli5' / 'index.html',                 # French ELI5 (root)
            self.output_dir / 'changelog' / 'index.html',            # French Changelog (root)
            self.output_dir / 'en-GB' / 'index.html',                # English homepage
            self.output_dir / 'en-GB' / 'privacy-policy' / 'index.html', # English privacy policy
            self.output_dir / 'en-GB' / 'eli5' / 'index.html',       # English ELI5
            self.output_dir / 'en-GB' / 'changelog' / 'index.html',  # English Changelog
        ]
        
        all_valid = True
        for file_path in expected_files:
            if file_path.exists():
                click.echo(f"  ✓ {file_path}")
            else:
                click.echo(f"  ✗ Missing: {file_path}")
                all_valid = False
        
        # Basic HTML validation
        for file_path in expected_files:
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if '<html' in content and '</html>' in content:
                        click.echo(f"  ✓ {file_path} has valid HTML structure")
                    else:
                        click.echo(f"  ✗ {file_path} invalid HTML structure")
                        all_valid = False
        
        return all_valid
    
    def extract_strings(self) -> None:
        """Extract strings from templates for translation."""
        click.echo("Extracting strings from templates...")
        
        from babel.messages.extract import extract_from_dir
        from babel.messages.catalog import Catalog
        from babel.messages.pofile import write_po
        
        # Create POT catalog
        catalog = Catalog(
            project='Emoty Website',
            version='1.0',
            copyright_holder='Christopher Archer',
            msgid_bugs_address='support@emoty.fr',
            charset='utf-8'
        )
        
        # Extract strings from templates
        extracted = extract_from_dir(
            str(self.templates_dir), 
            method_map=[('*.j2', 'jinja2')],
            options_map={'*.j2': {'extensions': 'jinja2.ext.i18n'}}
        )
        
        for message in extracted:
            catalog.add(message[2], locations=[(message[0], message[1])])
        
        # Write POT file
        pot_file = self.build_dir / 'messages.pot'
        with open(pot_file, 'wb') as f:
            write_po(f, catalog)
        
        click.echo(f"  Created template: {pot_file}")
        click.echo(f"  Extracted {len(catalog)} strings")


@click.group()
@click.pass_context
def cli(ctx):
    """Emoty Website Generator CLI."""
    ctx.ensure_object(dict)
    ctx.obj['generator'] = SiteGenerator()


@cli.command()
@click.pass_context
def extract(ctx):
    """Extract translatable strings from templates."""
    ctx.obj['generator'].extract_strings()


@cli.command()
@click.pass_context
def merge(ctx):
    """Merge new strings into PO files."""
    generator = ctx.obj['generator']
    pot_file = generator.build_dir / 'messages.pot'
    if not pot_file.exists():
        click.echo("✗ POT file not found. Run 'extract' first.")
        sys.exit(1)

    for locale in generator.config['languages'].keys():
        po_file = generator.locales_dir / locale / 'LC_MESSAGES' / 'messages.po'
        if po_file.exists():
            click.echo(f"Merging strings into {po_file}...")
            os.system(f"msgmerge --update {po_file} {pot_file}")
        else:
            click.echo(f"Creating {po_file} from {pot_file}...")
            os.system(f"msginit --no-translator --locale={locale} --input={pot_file} --output-file={po_file}")


@cli.command()
@click.pass_context
def compile(ctx):
    """Compile PO files to MO files."""
    ctx.obj['generator'].compile_translations()


@cli.command()
@click.pass_context
def build(ctx):
    """Build the complete website."""
    generator = ctx.obj['generator']
    generator.build_site()
    
    if generator.validate_build():
        click.echo("✓ Build completed successfully!")
    else:
        click.echo("✗ Build completed with errors!")
        sys.exit(1)


@cli.command()
@click.pass_context
def validate(ctx):
    """Validate the generated site."""
    generator = ctx.obj['generator']
    
    if generator.validate_build():
        click.echo("✓ Validation passed!")
    else:
        click.echo("✗ Validation failed!")
        sys.exit(1)


@cli.command()
@click.option('--target', '-t', default='../output', help='Target directory for deployment')
@click.pass_context
def deploy(ctx, target):
    """Deploy generated files to target directory."""
    generator = ctx.obj['generator']
    target_path = Path(target).resolve()
    
    click.echo(f"Deploying to: {target_path}")
    
    # Copy files based on new structure
    if target_path.exists():
        # Copy French index.html to root (default language)
        src_index = generator.output_dir / 'index.html'
        if src_index.exists():
            shutil.copy2(src_index, target_path / 'index.html')
            click.echo(f"  Copied: index.html (French)")
        
        # Copy French privacy-policy directory to root
        src_privacy = generator.output_dir / 'privacy-policy'
        target_privacy = target_path / 'privacy-policy'
        if src_privacy.exists():
            if target_privacy.exists():
                shutil.rmtree(target_privacy)
            shutil.copytree(src_privacy, target_privacy)
            click.echo(f"  Copied: privacy-policy/ (French)")
        
        # Copy French eli5 directory to root
        src_eli5 = generator.output_dir / 'eli5'
        target_eli5 = target_path / 'eli5'
        if src_eli5.exists():
            if target_eli5.exists():
                shutil.rmtree(target_eli5)
            shutil.copytree(src_eli5, target_eli5)
            click.echo(f"  Copied: eli5/ (French)")
        
        # Copy French changelog directory to root
        src_changelog = generator.output_dir / 'changelog'
        target_changelog = target_path / 'changelog'
        if src_changelog.exists():
            if target_changelog.exists():
                shutil.rmtree(target_changelog)
            shutil.copytree(src_changelog, target_changelog)
            click.echo(f"  Copied: changelog/ (French)")
        
        # Copy en-GB directory
        src_en = generator.output_dir / 'en-GB'
        target_en = target_path / 'en-GB'
        if src_en.exists():
            if target_en.exists():
                shutil.rmtree(target_en)
            shutil.copytree(src_en, target_en)
            click.echo(f"  Copied: en-GB/ (English)")
        
        # Copy tu directory (informal French)
        src_tu = generator.output_dir / 'tu'
        target_tu = target_path / 'tu'
        if src_tu.exists():
            if target_tu.exists():
                shutil.rmtree(target_tu)
            shutil.copytree(src_tu, target_tu)
            click.echo(f"  Copied: tu/ (Informal French)")
        
        click.echo("✓ Deployment completed!")
    else:
        click.echo(f"✗ Target directory does not exist: {target_path}")
        sys.exit(1)


if __name__ == '__main__':
    cli()