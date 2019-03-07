# EasyMDE Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Contributing guide (Thanks to @roipoussiere, #54).
- Issue templates.
- Standardized changelog file.

### Changed
- Finish rewrite of README (Thanks to @roipoussiere, #54).
- Image and link prompt fill with "https://" by default.
- Link to markdown guide to https://www.markdownguide.org/basic-syntax/.

### Fixed
- Backwards compatibility in the API with SimpleMDE 1.0.0 (#41).
- Automatic publish of master branch to `@next`

### Removed
- Distribution files from source-control.

## [2.5.1] - 2019-01-17
### Fixed
- `role="button"` needed to be `type="button"`, fixes #45.

## [2.5.0] - 2019-01-17
### Added
- Typescript support (Thanks to @FranklinWhale, #44).
- `role="button"` to toolbar buttons (#38).

### Fixed
- Eraser icon not working with FontAwesome 5.

## [2.4.2] - 2018-11-09
### Added
- Node.js 11 support.

### Fixed
- Header button icons not showing sub-icons with FontAwesome 5.
- Inconsistent autosave behaviour when submitting a form (Thanks to @Furgas and @adamb70, #31).

## [2.4.1] - 2018-10-15
### Added
- `fa-redo` class to redo button for FA5 compatibility (Thanks to @Summon528, #27).

## [2.4.0] - 2018-10-15
### Added
- Theming support (Thanks to @LeviticusMB, #17).
- onToggleFullscreen event hook (Thanks to @n-3-0, #16).

### Fixed
- Fullscreen not working with `toolbar: false` (Thanks to @aphitiel, #19).

## [2.2.2] - 2019-07-03
### Fixed
- Automatic publish only publishing tags.

## [2.2.1] - 2019-06-29 [YANKED]
### Changed
- Attempt automatic publish `@next` version on npm.
- Links in the preview window will open in a new tab by default.

### Fixed
- Multi-text select issue by disabling multi-select in the editor (#10).
- `main` file in package.json (Thanks to @sne11ius, #11).

## [2.0.1] - 2018-05-13
### Changed
- Rewrote part of the documentation for EasyMDE.
- Updated gulp to version 4.0.0.

### Fixed
- Icons for `heading-smaller`, `heading-bigger`, `heading-1`, `heading-2` and `heading-3` not showing (#9).

## [2.0.0] - 2018-04-23
Project forked from [SimpleMDE](https://github.com/sparksuite/simplemde-markdown-editor)

### BREAKING CHANGES
- Dropped Bower support.
- Dropped support for older Node.js versions.

### Added
- FontAwesome 5 support.
- Support for newer Node.js versions.

### Changed
- Packages are now version-locked.
- Simplified build script.
- Markdown guide button is no longer disabled in preview mode.

### Fixed
- Cursor not always showing in "text" mode over the edit field

[Unreleased]: https://github.com/Ionaru/easy-markdown-editor/compare/2.5.1...HEAD
[2.5.1]: https://github.com/Ionaru/easy-markdown-editor/compare/2.5.0...2.5.1
[2.5.0]: https://github.com/Ionaru/easy-markdown-editor/compare/2.4.2...2.5.0
[2.4.2]: https://github.com/Ionaru/easy-markdown-editor/compare/2.4.1...2.4.2
[2.4.1]: https://github.com/Ionaru/easy-markdown-editor/compare/2.4.0...2.4.1
[2.4.0]: https://github.com/Ionaru/easy-markdown-editor/compare/2.2.2...2.4.0
[2.2.2]: https://github.com/Ionaru/easy-markdown-editor/compare/2.2.1...2.2.2
[2.2.1]: https://github.com/Ionaru/easy-markdown-editor/compare/2.0.1...2.2.1
[2.0.1]: https://github.com/Ionaru/easy-markdown-editor/compare/2.0.0...2.0.1
[2.0.0]: https://github.com/Ionaru/easy-markdown-editor/compare/1.11.2...2.0.0
