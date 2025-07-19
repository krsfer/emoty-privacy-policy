#!/usr/bin/env python3
"""
Version bump checker for git push operations.
Analyzes commits and automatically bumps version based on conventional commits.
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path

def run_command(cmd, capture_output=True):
    """Run a shell command and return the result."""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=capture_output, text=True)
        return result.stdout.strip() if capture_output else result.returncode
    except Exception as e:
        print(f"Error running command '{cmd}': {e}")
        return None

def get_current_branch():
    """Get the current git branch name."""
    return run_command("git rev-parse --abbrev-ref HEAD")

def get_latest_tag():
    """Get the most recent version tag."""
    return run_command("git describe --tags --abbrev=0 2>/dev/null")

def get_commits_since_tag(tag):
    """Get all commit messages since the given tag."""
    if tag:
        cmd = f"git log {tag}..HEAD --pretty=format:'%s'"
    else:
        # If no tag exists, get all commits
        cmd = "git log --pretty=format:'%s'"
    
    output = run_command(cmd)
    return output.split('\n') if output else []

def determine_version_bump(commits):
    """
    Determine the type of version bump needed based on commit messages.
    Returns: 'major', 'minor', 'patch', or None
    """
    has_breaking = False
    has_feature = False
    has_fix = False
    
    for commit in commits:
        # Check for breaking changes
        if 'BREAKING CHANGE' in commit or 'breaking change' in commit:
            has_breaking = True
        if re.match(r'^[a-z]+!:', commit):  # feat!: fix!: etc.
            has_breaking = True
            
        # Check for features
        if re.match(r'^feat(\(.*\))?:', commit, re.IGNORECASE):
            has_feature = True
            
        # Check for fixes
        if re.match(r'^fix(\(.*\))?:', commit, re.IGNORECASE):
            has_fix = True
    
    if has_breaking:
        return 'major'
    elif has_feature:
        return 'minor'
    elif has_fix:
        return 'patch'
    else:
        # Default to patch for any other changes
        return 'patch' if commits else None

def get_current_version():
    """Get the current version from package.json."""
    package_json_path = Path(__file__).parent.parent / 'package.json'
    try:
        with open(package_json_path, 'r') as f:
            data = json.load(f)
            return data.get('version', '0.0.0')
    except Exception as e:
        print(f"Error reading package.json: {e}")
        return '0.0.0'

def main():
    """Main function to check and bump version if needed."""
    
    # Check if we should skip version bumping
    if os.environ.get('SKIP_VERSION_BUMP') == '1':
        print("Version bump skipped (SKIP_VERSION_BUMP=1)")
        return 0
    
    # Get current branch
    branch = get_current_branch()
    if branch != 'main':
        print(f"Not on main branch (current: {branch}), skipping version bump")
        return 0
    
    # Get the latest tag
    latest_tag = get_latest_tag()
    current_version = get_current_version()
    
    print(f"Current version: {current_version}")
    print(f"Latest tag: {latest_tag or 'No tags found'}")
    
    # Check if current version matches latest tag
    if latest_tag and latest_tag.lstrip('v') == current_version:
        # Get commits since the tag
        commits = get_commits_since_tag(latest_tag)
        
        if not commits:
            print("No new commits since last version tag")
            return 0
        
        print(f"Found {len(commits)} commits since {latest_tag}")
        
        # Determine version bump type
        bump_type = determine_version_bump(commits)
        
        if bump_type:
            print(f"Version bump needed: {bump_type}")
            
            # Run npm version command
            cmd = f"npm version {bump_type} -m 'chore: release v%s'"
            print(f"Running: {cmd}")
            
            result = run_command(cmd, capture_output=False)
            if result == 0:
                print("Version bumped successfully")
                
                # Run the version sync script
                sync_result = run_command("python build/update_version.py", capture_output=False)
                if sync_result == 0:
                    print("Version synced to site config")
                    # Stage the site config changes
                    run_command("git add build/config/site_config.json", capture_output=False)
                    # Amend the version commit
                    run_command("git commit --amend --no-edit", capture_output=False)
                else:
                    print("Warning: Failed to sync version to site config")
            else:
                print("Error: Failed to bump version")
                return 1
        else:
            print("No version bump needed")
    else:
        print("Version mismatch or no tags - manual version management may be needed")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())