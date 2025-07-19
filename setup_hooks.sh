#!/bin/bash
#
# Setup script for installing git hooks for automatic version bumping
# Run this script to enable automatic version bumping for team members
#

echo "Setting up git hooks for automatic version bumping..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "Error: Not in a git repository"
    exit 1
fi

# Check if the version bump script exists
if [ ! -f "build/check_version_bump.py" ]; then
    echo "Error: build/check_version_bump.py not found"
    exit 1
fi

# Make the version bump script executable
chmod +x build/check_version_bump.py
echo "✓ Made version bump script executable"

# Check if pre-push hook already exists
if [ -f ".git/hooks/pre-push" ]; then
    echo "Warning: .git/hooks/pre-push already exists"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted"
        exit 1
    fi
    
    # Backup existing hook
    cp .git/hooks/pre-push .git/hooks/pre-push.backup
    echo "✓ Backed up existing pre-push hook"
fi

# Copy the pre-push hook template
cat > .git/hooks/pre-push << 'EOF'
#!/bin/sh
#
# Git pre-push hook for automatic version bumping
# This is a fallback for developers not using Claude CLI
#

# Hook parameters
remote="$1"
url="$2"

# Only run on pushes to main branch on origin
if [ "$remote" != "origin" ]; then
    exit 0
fi

# Check if we're pushing to main branch
while read local_ref local_oid remote_ref remote_oid
do
    if [ "$remote_ref" = "refs/heads/main" ]; then
        # Check if Python version bump script exists
        if [ -f "build/check_version_bump.py" ]; then
            echo "Running version bump check..."
            python build/check_version_bump.py
            
            # If the script made changes, we need to update the push
            if [ $? -eq 0 ]; then
                echo "Version bump completed"
            else
                echo "Version bump failed"
                exit 1
            fi
        else
            echo "Version bump script not found, skipping automatic versioning"
        fi
        break
    fi
done

exit 0
EOF

# Make the hook executable
chmod +x .git/hooks/pre-push
echo "✓ Installed pre-push hook"

echo ""
echo "Git hooks setup completed successfully!"
echo ""
echo "How it works:"
echo "- When you push to main branch, version will be automatically bumped"
echo "- Bump type is determined from your commit messages:"
echo "  • feat: → minor version bump"
echo "  • fix: → patch version bump"
echo "  • BREAKING CHANGE → major version bump"
echo ""
echo "To disable version bumping for a specific push:"
echo "  SKIP_VERSION_BUMP=1 git push"
echo ""
echo "Note: This hook only works for the main branch"