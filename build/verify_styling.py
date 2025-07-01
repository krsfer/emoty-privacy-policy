#!/usr/bin/env python3
"""
Verify that all deployed HTML files have consistent styling and structure.
"""

import os
import sys
from pathlib import Path
from bs4 import BeautifulSoup
import click

class StyleVerifier:
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        
    def check_for_conflicting_files(self):
        """Check for old files that might conflict with new structure."""
        conflicts = []
        
        # Check for old privacy-policy.html that conflicts with privacy-policy/index.html
        old_privacy = self.project_root / 'privacy-policy.html'
        new_privacy = self.project_root / 'privacy-policy' / 'index.html'
        
        if old_privacy.exists() and new_privacy.exists():
            conflicts.append(f"Conflicting files: {old_privacy.name} and {new_privacy.relative_to(self.project_root)}")
        
        return conflicts
        
    def get_deployed_files(self):
        """Get all deployed HTML files."""
        return [
            self.project_root / 'index.html',
            self.project_root / 'privacy-policy' / 'index.html',
            self.project_root / 'eli5' / 'index.html',
            self.project_root / 'en-GB' / 'index.html',
            self.project_root / 'en-GB' / 'privacy-policy' / 'index.html',
            self.project_root / 'en-GB' / 'eli5' / 'index.html',
        ]
    
    def extract_styles(self, html_file):
        """Extract key styling elements from HTML."""
        if not html_file.exists():
            return None
            
        with open(html_file, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
        
        # Extract key elements
        styles = {}
        
        # Check for Emoty header
        header = soup.find('header')
        styles['has_header'] = header is not None
        styles['has_emoty_logo'] = soup.find(class_='emoty-logo') is not None
        styles['has_lang_switch'] = soup.find(class_='lang-switch') is not None
        
        # Check for consistent styling
        container = soup.find(class_='container')
        styles['has_container'] = container is not None
        
        # Check for footer
        footer = soup.find('footer')
        styles['has_footer'] = footer is not None
        
        # Extract CSS
        style_tags = soup.find_all('style')
        styles['css_count'] = len(style_tags)
        styles['has_gradient_header'] = any('linear-gradient' in tag.text for tag in style_tags)
        styles['has_emoty_text_styling'] = any('.emoty-text' in tag.text for tag in style_tags)
        
        # Check meta tags
        styles['title'] = soup.find('title').text if soup.find('title') else ''
        styles['lang'] = soup.find('html').get('lang', '') if soup.find('html') else ''
        
        return styles
    
    def verify_consistency(self):
        """Verify all files have consistent styling."""
        # First check for conflicting files
        conflicts = self.check_for_conflicting_files()
        if conflicts:
            click.echo("🚨 File Conflicts Found:")
            for conflict in conflicts:
                click.echo(f"  • {conflict}")
            click.echo("  Remove old files and redeploy!")
            click.echo()
        
        files = self.get_deployed_files()
        results = {}
        
        click.echo("🔍 Verifying styling consistency...")
        click.echo()
        
        for file_path in files:
            relative_path = file_path.relative_to(self.project_root)
            styles = self.extract_styles(file_path)
            results[str(relative_path)] = styles
            
            if styles is None:
                click.echo(f"❌ {relative_path}: File not found")
            else:
                click.echo(f"✅ {relative_path}: Analyzed")
        
        click.echo()
        
        # Check for consistency issues
        issues = []
        
        # All files should have header, container, footer
        required_elements = ['has_header', 'has_container', 'has_footer', 'has_emoty_logo', 'has_lang_switch']
        
        for element in required_elements:
            values = [r[element] for r in results.values() if r is not None]
            if not all(values):
                missing_files = [f for f, r in results.items() if r and not r[element]]
                issues.append(f"Missing {element}: {', '.join(missing_files)}")
        
        # Check CSS consistency (privacy policy pages should have 2 blocks, others 1)
        for file_path, result in results.items():
            if result is None:
                continue
            expected_css = 2 if 'privacy-policy' in file_path else 1
            if result['css_count'] != expected_css:
                issues.append(f"Unexpected CSS count in {file_path}: got {result['css_count']}, expected {expected_css}")
        
        # Check styling features
        style_features = ['has_gradient_header', 'has_emoty_text_styling']
        for feature in style_features:
            values = [r[feature] for r in results.values() if r is not None]
            if not all(values):
                missing_files = [f for f, r in results.items() if r and not r[feature]]
                issues.append(f"Missing {feature}: {', '.join(missing_files)}")
        
        # Add conflicts to issues
        issues.extend(conflicts)
        
        # Report results
        if issues:
            click.echo("🚨 Styling Issues Found:")
            for issue in issues:
                click.echo(f"  • {issue}")
            return False
        else:
            click.echo("✅ All files have consistent styling!")
            return True
    
    def show_details(self):
        """Show detailed analysis of each file."""
        files = self.get_deployed_files()
        
        click.echo("📊 Detailed Analysis:")
        click.echo()
        
        for file_path in files:
            relative_path = file_path.relative_to(self.project_root)
            styles = self.extract_styles(file_path)
            
            click.echo(f"📄 {relative_path}:")
            if styles is None:
                click.echo("  ❌ File not found")
            else:
                click.echo(f"  Title: {styles['title']}")
                click.echo(f"  Language: {styles['lang']}")
                click.echo(f"  Header: {'✅' if styles['has_header'] else '❌'}")
                click.echo(f"  Emoty Logo: {'✅' if styles['has_emoty_logo'] else '❌'}")
                click.echo(f"  Language Switch: {'✅' if styles['has_lang_switch'] else '❌'}")
                click.echo(f"  Container: {'✅' if styles['has_container'] else '❌'}")
                click.echo(f"  Footer: {'✅' if styles['has_footer'] else '❌'}")
                click.echo(f"  CSS Blocks: {styles['css_count']}")
                click.echo(f"  Gradient Header: {'✅' if styles['has_gradient_header'] else '❌'}")
                click.echo(f"  Emoty Text Styling: {'✅' if styles['has_emoty_text_styling'] else '❌'}")
            click.echo()

@click.command()
@click.option('--details', '-d', is_flag=True, help='Show detailed analysis')
@click.option('--project-root', default='build/output', help='Project root directory')
def main(details, project_root):
    """Verify styling consistency across all deployed HTML files."""
    verifier = StyleVerifier(project_root)
    
    if details:
        verifier.show_details()
    else:
        success = verifier.verify_consistency()
        sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()