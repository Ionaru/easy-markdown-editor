# EasyMDE Changelog
All notable changes to easymde will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

[comment]: <> (## [Unreleased])
## [2.14.0] - 2021-02-14
### Added
- The `scrollbarStyle` option to change the style of the scrollbar (Thanks to [@danice], [#250]).

### Fixed
- Issues with images not displaying correctly in the preview screen (Thanks to [@ivictbor], [#253]).
- An error when both `sideBySideFullscreen` and `status` were set to `false` (Thanks to [@joahim], [#272]).
- Editor trying to display non-image files (Thanks to [@Juupaa], [#277])
- Unneeded call to `window.removeEventListener` (Thanks to [@emirotin], [#280])
- Spell checker (Thanks to [@Fanvadar], [#284]).
- Focus issues with toolbar dropdown menus (Thanks to [@Situphen], [#285]).
- Interaction between the `sideBySideFullscreen` and the preview state (Thanks to [@smundro], [#286])
- Refactored strange method of padding the toolbar into regular padding (Thanks to [@sn3p], [#293]).
- Security issue in `marked` dependency (Thanks to [@dependabot], [#298]).

## [2.13.0] - 2020-11-11
### Added
- CodeMirror autorefresh plugin and autoRefresh option (Thanks to [@mbolli], [#249]).
- `lineNumbers` option to display line numbers in the editor (Thanks to [@nhymxu], [#267]).

### Fixed
- CSS scoping issues when the editor is used in combination with other CodeMirror instances ([#252]).

## [2.12.1] - 2020-10-06
### Changed
- Set `previewImagesInEditor` option to `false` by default ([#251]).

## [2.12.0] - 2020-09-29
### Added
- `this` context in imageUploadFunction (Thanks to [@JoshuaLicense], [#225]).
- `previewImagesInEditor` option to display images in editor mode (Thanks to [@ivictbor], [#235]).
- `overlayMode` options to supply an additional codemirror mode (Thanks to [@czynskee], [#244]).

### Fixed
- Corrected default size units from `b,Kb,Mb` to ` B, KB, MB` ([#239]).
- Max height less than min height (Thanks to [@nick-denry], [#222]).
- toTextArea issue (Thanks to [@nick-denry], [#223]).
- Error when updateStatusBar was called during image upload, but the status bar is disabled (Thanks to [@JoshuaLicense], [#224]).

## [2.11.0] - 2020-07-16
### Added
- Support for Node.js 14.
- Preview without fullscreen (Thanks to [@nick-denry], [#196]).

### Fixed
- Fix cursor displayed position on activity (Thanks to [@firm1], [#184]).
- Checkboxes always have bullets in front of them ([#136]).
- Save the text only when modifying the content of the easymde instance (Thanks to [@firm1], [#181]).

## [2.10.1] - 2020-04-06
### Fixed
- Typescript error when entering certain strings for toolbar buttons ([#178]).

## [2.10.0] - 2020-04-02
### Added
- `inputStyle` and `nativeSpellcheck` options to manage the native language of the browser (Thanks to [@firm1], [#143]).
- Group buttons in drop-down lists by adding a sub-option `children` for the items in the toolbar (Thanks to [@firm1], [#141]).
- `sanitizerFunction` option to allow custom HTML sanitizing in the markdown preview (Thanks to [@adamb70], [#147]).
- Time formatting and custom text options for the autosave message (Thanks to [@dima-bzz], [#170]).
### Changed
- Delay before assuming that submit of the form as failed is `autosave.submit_delay` instead of `autosave.delay` (Thanks to [@Situphen], [#139]).
- Add `watch` task for gulp (Thanks to [@A-312], [#150]).
### Fixed
- Issue with Marked when using IE11 and webpack (Thanks to [@felipefdl], [#169]).
- Updated codemirror to version 5.52.2 (Thanks to [@A-312], [#173]).
- Editor displaying on top of other elements on a webpage (Thanks to [@StefKors], [#175]).

## [2.9.0] - 2020-01-13
### Added
- Missing minHeight option in type definition (Thanks to [@t49tran], [#123]).
- Other missing type definitions ([#126]).

### Changed
- The editor will remove its saved contents when the editor is emptied, allowing to reload a default value (Thanks to [@Situphen], [#132]).

## [2.8.0] - 2019-08-20
### Added
- Upload images functionality (Thanks to [@roipoussiere] and [@JeroenvO], [#71], [#101]).
- Allow custom image upload function (Thanks to [@sperezp], [#106]).
- More polish to the upload images functionality (Thanks to [@jfly], [#109]).
- Improved React compatibility (Thanks to [@richtera], [#97]).

### Fixed
- Missing link in dist file header.

## [2.7.0] - 2019-07-13
### Added
- `previewClass` option for overwriting the preview screen class ([#99]).

### Fixed
- Updated dependencies to resolve potential security issue.
- Resolved small code style issues shown by new eslint rules.

## [2.6.1] - 2019-06-17
### Fixed
- Error when toggling between ordered and unordered lists (Thanks to [@roryok], [#93]).
- Keyboard shortcuts for custom actions not working (Thanks to [@ysykzheng], [#75]).

## [2.6.0] - 2019-04-15
### Added
- Contributing guide (Thanks to [@roipoussiere], [#54]).
- Issue templates.
- Standardized changelog file.

### Changed
- Finish rewrite of README (Thanks to [@roipoussiere], [#54]).
- Image and link prompt fill with "https://" by default.
- Link to markdown guide to <https://www.markdownguide.org/basic-syntax/>.

### Fixed
- Backwards compatibility in the API with SimpleMDE 1.0.0 ([#41]).
- Automatic publish of master branch to `@next`

### Removed
- Distribution files from source-control.

## [2.5.1] - 2019-01-17
### Fixed
- `role="button"` needed to be `type="button"` ([#45]).

## [2.5.0] - 2019-01-17
### Added
- Typescript support (Thanks to [@FranklinWhale], [#44]).
- `role="button"` to toolbar buttons ([#38]).

### Fixed
- Eraser icon not working with FontAwesome 5.

## [2.4.2] - 2018-11-09
### Added
- Node.js 11 support.

### Fixed
- Header button icons not showing sub-icons with FontAwesome 5.
- Inconsistent autosave behaviour when submitting a form (Thanks to [@Furgas] and [@adamb70], [#31]).

## [2.4.1] - 2018-10-15
### Added
- `fa-redo` class to redo button for FA5 compatibility (Thanks to [@Summon528], [#27]).

## [2.4.0] - 2018-10-15
### Added
- Theming support (Thanks to [@LeviticusMB], [#17]).
- onToggleFullscreen event hook (Thanks to [@n-3-0], [#16]).

### Fixed
- Fullscreen not working with `toolbar: false` (Thanks to [@aphitiel], [#19]).

## [2.2.2] - 2019-07-03
### Fixed
- Automatic publish only publishing tags.

## [2.2.1] - 2019-06-29
### Changed
- Attempt automatic publish `@next` version on npm.
- Links in the preview window will open in a new tab by default.

### Fixed
- Multi-text select issue by disabling multi-select in the editor ([#10]).
- `main` file in package.json (Thanks to [@sne11ius], [#11]).

## [2.0.1] - 2018-05-13
### Changed
- Rewrote part of the documentation for EasyMDE.
- Updated gulp to version 4.0.0.

### Fixed
- Icons for `heading-smaller`, `heading-bigger`, `heading-1`, `heading-2` and `heading-3` not showing ([#9]).

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

<!-- Linked issues -->
[#252]: https://github.com/Ionaru/easy-markdown-editor/issues/252
[#251]: https://github.com/Ionaru/easy-markdown-editor/issues/251
[#239]: https://github.com/Ionaru/easy-markdown-editor/issues/239
[#178]: https://github.com/Ionaru/easy-markdown-editor/issues/178
[#136]: https://github.com/Ionaru/easy-markdown-editor/issues/136
[#126]: https://github.com/Ionaru/easy-markdown-editor/issues/126
[#99]: https://github.com/Ionaru/easy-markdown-editor/issues/99
[#45]: https://github.com/Ionaru/easy-markdown-editor/issues/45
[#44]: https://github.com/Ionaru/easy-markdown-editor/issues/44
[#41]: https://github.com/Ionaru/easy-markdown-editor/issues/41
[#38]: https://github.com/Ionaru/easy-markdown-editor/issues/38
[#17]: https://github.com/Ionaru/easy-markdown-editor/issues/17
[#16]: https://github.com/Ionaru/easy-markdown-editor/issues/16
[#11]: https://github.com/Ionaru/easy-markdown-editor/issues/11
[#10]: https://github.com/Ionaru/easy-markdown-editor/issues/10
[#9]: https://github.com/Ionaru/easy-markdown-editor/issues/9

<!-- Linked PRs -->
[#298]: https://github.com/Ionaru/easy-markdown-editor/pull/298
[#293]: https://github.com/Ionaru/easy-markdown-editor/pull/293
[#286]: https://github.com/Ionaru/easy-markdown-editor/pull/286
[#285]: https://github.com/Ionaru/easy-markdown-editor/pull/285
[#284]: https://github.com/Ionaru/easy-markdown-editor/pull/284
[#280]: https://github.com/Ionaru/easy-markdown-editor/pull/280
[#277]: https://github.com/Ionaru/easy-markdown-editor/pull/277
[#272]: https://github.com/Ionaru/easy-markdown-editor/pull/272
[#267]: https://github.com/Ionaru/easy-markdown-editor/pull/267
[#250]: https://github.com/Ionaru/easy-markdown-editor/pull/250
[#249]: https://github.com/Ionaru/easy-markdown-editor/pull/249
[#244]: https://github.com/Ionaru/easy-markdown-editor/pull/244
[#235]: https://github.com/Ionaru/easy-markdown-editor/pull/235
[#225]: https://github.com/Ionaru/easy-markdown-editor/pull/225
[#224]: https://github.com/Ionaru/easy-markdown-editor/pull/224
[#223]: https://github.com/Ionaru/easy-markdown-editor/pull/223
[#222]: https://github.com/Ionaru/easy-markdown-editor/pull/222
[#196]: https://github.com/Ionaru/easy-markdown-editor/pull/196
[#184]: https://github.com/Ionaru/easy-markdown-editor/pull/184
[#181]: https://github.com/Ionaru/easy-markdown-editor/pull/181
[#175]: https://github.com/Ionaru/easy-markdown-editor/pull/175
[#173]: https://github.com/Ionaru/easy-markdown-editor/pull/173
[#170]: https://github.com/Ionaru/easy-markdown-editor/pull/170
[#169]: https://github.com/Ionaru/easy-markdown-editor/pull/169
[#150]: https://github.com/Ionaru/easy-markdown-editor/pull/150
[#147]: https://github.com/Ionaru/easy-markdown-editor/pull/147
[#143]: https://github.com/Ionaru/easy-markdown-editor/pull/143
[#141]: https://github.com/Ionaru/easy-markdown-editor/pull/141
[#139]: https://github.com/Ionaru/easy-markdown-editor/pull/139
[#132]: https://github.com/Ionaru/easy-markdown-editor/pull/132
[#123]: https://github.com/Ionaru/easy-markdown-editor/pull/123
[#109]: https://github.com/Ionaru/easy-markdown-editor/pull/109
[#106]: https://github.com/Ionaru/easy-markdown-editor/pull/106
[#101]: https://github.com/Ionaru/easy-markdown-editor/pull/101
[#97]: https://github.com/Ionaru/easy-markdown-editor/pull/97
[#93]: https://github.com/Ionaru/easy-markdown-editor/pull/93
[#75]: https://github.com/Ionaru/easy-markdown-editor/pull/75
[#71]: https://github.com/Ionaru/easy-markdown-editor/pull/71
[#54]: https://github.com/Ionaru/easy-markdown-editor/pull/54
[#31]: https://github.com/Ionaru/easy-markdown-editor/pull/31
[#27]: https://github.com/Ionaru/easy-markdown-editor/pull/27
[#19]: https://github.com/Ionaru/easy-markdown-editor/pull/19

<!-- Linked users -->
[@dependabot]: https://github.com/dependabot
[@emirotin]: https://github.com/emirotin
[@smundro]: https://github.com/smundro
[@Juupaa]: https://github.com/Juupaa
[@Fanvadar]: https://github.com/Fanvadar
[@danice]: https://github.com/danice
[@joahim]: https://github.com/joahim
[@nhymxu]: https://github.com/nhymxu
[@mbolli]: https://github.com/mbolli
[@ivictbor]: https://github.com/ivictbor
[@JoshuaLicense]: https://github.com/JoshuaLicense
[@czynskee]: https://github.com/czynskee
[@nick-denry]: https://github.com/nick-denry
[@StefKors]: https://github.com/StefKors
[@felipefdl]: https://github.com/felipefdl
[@A-312]: https://github.com/A-312
[@dima-bzz]: https://github.com/dima-bzz
[@firm1]: https://github.com/firm1
[@Situphen]: https://github.com/Situphen
[@t49tran]: https://github.com/t49tran
[@richtera]: https://github.com/richtera
[@jfly]: https://github.com/jfly
[@sperezp]: https://github.com/sperezp
[@JeroenvO]: https://github.com/JeroenvO
[@sn3p]: https://github.com/sn3p
[@roryok]: https://github.com/roryok
[@ysykzheng]: https://github.com/ysykzheng
[@roipoussiere]: https://github.com/roipoussiere
[@FranklinWhale]: https://github.com/FranklinWhale
[@Furgas]: https://github.com/Furgas
[@adamb70]: https://github.com/adamb70
[@Summon528]: https://github.com/Summon528
[@LeviticusMB]: https://github.com/LeviticusMB
[@n-3-0]: https://github.com/n-3-0
[@aphitiel]: https://github.com/aphitiel
[@sne11ius]: https://github.com/sne11ius

<!-- Linked versions -->
[Unreleased]: https://github.com/Ionaru/easy-markdown-editor/compare/2.13.0...HEAD
[2.13.0]: https://github.com/Ionaru/easy-markdown-editor/compare/2.12.1...2.13.0
[2.12.1]: https://github.com/Ionaru/easy-markdown-editor/compare/2.12.0...2.12.1
[2.12.0]: https://github.com/Ionaru/easy-markdown-editor/compare/2.11.0...2.12.0
[2.11.0]: https://github.com/Ionaru/easy-markdown-editor/compare/2.10.1...2.11.0
[2.10.1]: https://github.com/Ionaru/easy-markdown-editor/compare/2.10.0...2.10.1
[2.10.0]: https://github.com/Ionaru/easy-markdown-editor/compare/2.9.0...2.10.0
[2.9.0]: https://github.com/Ionaru/easy-markdown-editor/compare/2.8.0...2.9.0
[2.8.0]: https://github.com/Ionaru/easy-markdown-editor/compare/2.7.0...2.8.0
[2.7.0]: https://github.com/Ionaru/easy-markdown-editor/compare/2.6.1...2.7.0
[2.6.1]: https://github.com/Ionaru/easy-markdown-editor/compare/2.6.0...2.6.1
[2.6.0]: https://github.com/Ionaru/easy-markdown-editor/compare/2.5.1...2.6.0
[2.5.1]: https://github.com/Ionaru/easy-markdown-editor/compare/2.5.0...2.5.1
[2.5.0]: https://github.com/Ionaru/easy-markdown-editor/compare/2.4.2...2.5.0
[2.4.2]: https://github.com/Ionaru/easy-markdown-editor/compare/2.4.1...2.4.2
[2.4.1]: https://github.com/Ionaru/easy-markdown-editor/compare/2.4.0...2.4.1
[2.4.0]: https://github.com/Ionaru/easy-markdown-editor/compare/2.2.2...2.4.0
[2.2.2]: https://github.com/Ionaru/easy-markdown-editor/compare/2.2.1...2.2.2
[2.2.1]: https://github.com/Ionaru/easy-markdown-editor/compare/2.0.1...2.2.1
[2.0.1]: https://github.com/Ionaru/easy-markdown-editor/compare/2.0.0...2.0.1
[2.0.0]: https://github.com/Ionaru/easy-markdown-editor/compare/1.11.2...2.0.0
