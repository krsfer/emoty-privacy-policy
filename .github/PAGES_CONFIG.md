# GitHub Pages Configuration

This repository uses GitHub Actions workflow for deployment instead of Jekyll.

Configuration: build_type = 'workflow'
Set via: gh api --method PUT repos/krsfer/emoty-privacy-policy/pages

This prevents Jekyll build conflicts with our custom Python build system.

