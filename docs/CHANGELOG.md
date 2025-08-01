# Changelog

All notable changes to Emoty will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Emoty Android App Releases

### [App v1.9.3] - 2025-08-01

#### 🔧 Critical Bug Fixes - Noto Emoji Persistence
- **FIXED**: Noto emojis now properly maintain monochrome appearance after app restart
- **RESOLVED**: Pattern persistence system losing monochrome state when closing and reopening app
- **ENHANCED**: SequenceStateSerializer now preserves isMonochrome property across all persistence mechanisms
- **IMPROVED**: PatternOperationsManager SharedPreferences persistence includes monochrome state tracking
- **ADDED**: Automatic pattern persistence in onPause() lifecycle method for reliable state saving

#### 🏗️ Technical Architecture Improvements - Robust State Management
- **NEW**: restoreCharacterSequenceWithModesAndMonochrome() method in SequenceManager
- **ENHANCED**: Bundle-based persistence (configuration changes) now preserves monochrome states
- **IMPROVED**: SharedPreferences-based persistence (app restarts) includes monochrome state arrays
- **REFINED**: Character.fromEmoji() calls throughout codebase use actual monochrome values
- **STRENGTHENED**: Undo/redo operations maintain complete state including monochrome information

#### 🎯 User Experience - Consistent Visual Behavior
- **RESOLVED**: Visual inconsistency where Noto emojis appeared colored after app sessions
- **MAINTAINED**: Backward compatibility with existing saved patterns without monochrome data
- **ENSURED**: Graceful fallback handling for corrupted or missing monochrome state data
- **GUARANTEED**: Reliable monochrome emoji rendering across all app usage scenarios

### [App v1.9.2] - 2025-07-26

#### 🎯 Enhanced Sharing Experience - Improved Content Discovery
- **NEW**: Material Design 3 share menu with level-based progressive disclosure
- **RENAMED**: "Tools" FAB to "Share" FAB for clearer functionality understanding
- **NEW**: Rich visual interface with icons, descriptions, and format indicators
- **NEW**: SharePatternAdapter with RecyclerView for sophisticated option display
- **NEW**: Level badges showing feature requirements (BASIC, PRO, EXPERT, MASTER)
- **NEW**: Smart feature gating prevents overwhelming beginners while unlocking advanced tools

#### 🎨 Tutorial & UI Improvements - Better User Experience  
- **IMPROVED**: Tutorial button positioning with undo support functionality
- **IMPROVED**: Localized tutorial buttons displaying in user's language
- **ENHANCED**: Precise balloon targeting for specific UI elements and controls
- **REFINED**: Animation improvements and cleaner layout spacing throughout app
- **ENHANCED**: Auto-clear functionality for pattern and sequence during tutorial start
- **IMPROVED**: Background dimming when tapping empty areas during tutorial flow

#### 🔧 Technical Implementation - Modern Architecture
- **NEW**: Custom dialog layouts (dialog_share_pattern.xml, item_share_option.xml) replacing simple AlertDialog
- **NEW**: 9 comprehensive vector drawable icons for complete visual system coverage
- **NEW**: Progressive disclosure logic based on UserProgressTracker level assessment
- **ENHANCED**: Multilingual string resources for all share functionality in English and French
- **NEW**: ShareOption enum with minimum level requirements and tracking features
- **IMPROVED**: ImageShareHelper integration with sophisticated dialog management

---

## Privacy Policy Website Releases

## [2.2.0] - 2025-07-20

### Added
- Localized changelog system with English and French versions
- Changelog pages accessible at `/changelog/` and `/en-GB/changelog/`
- Footer navigation links to changelog on all pages
- Markdown-to-HTML conversion for changelog content
- Language switcher integration for changelog pages

### Changed
- Updated build system to process changelog markdown files
- Enhanced site template with changelog template

### Technical
- Added markdown dependency to build requirements
- Updated translation files with changelog footer text
- Integrated changelog generation into build and deployment process

## [2.1.0] - 2025-07-19

### Added
- Enhanced Creative Assist feature with clearer help messaging
- Improved emphasis on AI assistance availability

### Changed
- Updated privacy policy effective date to June 19, 2025
- Standardized footer format with bullet separators throughout all pages

### Fixed
- Consistent footer styling across different page types

## [2.0.0] - 2025-07-19

### Added
- Semantic versioning system implementation
- Automated version management with npm scripts
- Version display in website footer
- Git hooks for automatic version synchronization
- GitHub workflows for version management

### Changed
- Complete overhaul of version tracking system
- Migrated to proper semantic versioning (MAJOR.MINOR.PATCH)

### Technical
- Added package.json for npm-based version management
- Created automated build scripts for version updates
- Integrated version display across all site pages

[2.2.0]: https://github.com/carcher54321/emoty-privacy-policy/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/carcher54321/emoty-privacy-policy/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/carcher54321/emoty-privacy-policy/releases/tag/v2.0.0