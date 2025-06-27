#!/usr/bin/env python3
"""
Clean up old files that might conflict with the new build system.
"""

import os
import sys
from pathlib import Path
import click

def cleanup_old_files(project_root):
    """Remove old files that conflict with new structure."""
    project_root = Path(project_root)
    
    # Files to remove
    old_files = [
        project_root / 'privacy-policy.html',  # Old privacy policy file
    ]
    
    removed = []
    
    for old_file in old_files:
        if old_file.exists():
            try:
                old_file.unlink()
                removed.append(str(old_file.relative_to(project_root)))
                click.echo(f"🗑️  Removed: {old_file.relative_to(project_root)}")
            except Exception as e:
                click.echo(f"❌ Failed to remove {old_file.relative_to(project_root)}: {e}")
    
    if not removed:
        click.echo("✅ No old files to clean up")
    else:
        click.echo(f"🧹 Cleaned up {len(removed)} old files")
    
    return len(removed)

@click.command()
@click.option('--project-root', default='..', help='Project root directory')
def main(project_root):
    """Clean up old files that might conflict with new build system."""
    cleanup_old_files(project_root)

if __name__ == '__main__':
    main()