#!/usr/bin/env python3
"""Synchronize version between package.json and site_config.json"""

import json
import sys
from pathlib import Path

def update_version():
    root_dir = Path(__file__).parent.parent
    package_json_path = root_dir / "package.json"
    site_config_path = root_dir / "build" / "config" / "site_config.json"
    
    # Read version from package.json
    try:
        with open(package_json_path, 'r') as f:
            package_data = json.load(f)
            version = package_data.get('version', '1.0.0')
    except FileNotFoundError:
        print(f"Error: {package_json_path} not found")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in {package_json_path}")
        sys.exit(1)
    
    # Update version in site_config.json
    try:
        with open(site_config_path, 'r') as f:
            site_config = json.load(f)
        
        site_config['version'] = version
        
        with open(site_config_path, 'w') as f:
            json.dump(site_config, f, indent=2, ensure_ascii=False)
            f.write('\n')  # Add trailing newline
        
        print(f"✓ Updated site_config.json with version {version}")
        
    except FileNotFoundError:
        print(f"Error: {site_config_path} not found")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in {site_config_path}")
        sys.exit(1)

if __name__ == "__main__":
    update_version()