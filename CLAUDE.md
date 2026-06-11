# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Project Overview

EasyMDE is a browser-based, embeddable JavaScript Markdown editor — a drop-in `<textarea>` replacement with a rich toolbar, live preview, autosave, spell checking, and image upload. It is published to npm as the `easymde` package.

**Core dependencies**: CodeMirror 5 (editing), Marked 4 (preview rendering), Font Awesome (icons, loaded externally), codemirror-spell-checker.

## Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies and auto-runs `gulp` (prepare script) |
| `npm test` | Full test suite: lint + type check + E2E |
| `npm run lint` | ESLint on `src/js/**/*.js` (via gulp) |
| `npm run e2e` | Build + lint Cypress tests + run Cypress headlessly |
| `npm run cypress:run` | Run Cypress E2E tests headlessly |
| `npm run test:types` | TypeScript type checking (`tsc --project types/tsconfig.json`) |
| `gulp` | Full build: lint → bundle JS → minify CSS → output to `dist/` |
| `gulp watch` | Watch mode for JS and CSS changes |

## Build System

**Gulp + Browserify + Terser** — no webpack, vite, babel, or Jest.

- `gulpfile.js` defines the entire build pipeline.
- JS: Browserify bundles `src/js/easymde.js` as UMD (`standalone: 'EasyMDE'`), then Terser minifies → `dist/easymde.min.js`.
- CSS: Concatenates CodeMirror CSS + EasyMDE CSS + spell-checker CSS, minifies → `dist/easymde.min.css`.

## Architecture

### Source Layout

```
src/
  js/
    easymde.js              # ENTIRE application (~3300 lines, single file)
    codemirror/
      tablist.js            # Custom CodeMirror command for tab indentation in lists
  css/
    easymde.css             # All editor styles (~425 lines)
types/
  easymde.d.ts              # TypeScript type definitions (~300 lines)
  easymde-test.ts           # Type usage test file (~239 lines)
cypress/
  e2e/                      # 7 E2E test suites
```

### Key Architectural Points

- **Single-file application**: All application logic lives in `src/js/easymde.js`. There is no module-based architecture — it uses CommonJS (`require()`) and is bundled with Browserify.
- **Constructor + prototype pattern**: `function EasyMDE(options)` with prototype methods. Static methods on the `EasyMDE` constructor allow toolbar actions to be referenced by name (e.g., `EasyMDE.toggleBold`).
- **Toolbar system**: Dynamically creates buttons, dropdowns, separators. Supports custom buttons and actions. Toolbar items reference editor actions by function name (string) or direct function.
- **Preview system**: Renders Markdown via Marked, supports sync scrolling and side-by-side mode.
- **Image upload**: Drag-and-drop, paste, file browse. Supports custom upload functions and server endpoints.
- **Autosave**: localStorage-based with configurable delay.
- **Keyboard shortcuts**: Fully customizable, cross-platform (Cmd vs Ctrl auto-conversion via `fixShortcut()`).
- **Frontmatter processing** (opt-in via `enableFrontmatter: true`): Detects `---`/`+++` delimited YAML blocks at the top of documents. Renders them as key-value tables in preview, applies `cm-frontmatter` CSS class in the editor, blocks formatting actions inside frontmatter, and excludes frontmatter from word/line counts. Use `previewIgnoreFrontmatter: true` to suppress the table rendering in preview while keeping all other frontmatter behavior.

### Code Structure Within `easymde.js`

| Lines | Section |
|-------|---------|
| 1–15 | Imports (CodeMirror, spell-checker, marked) |
| 17–50 | Global state/constants (platform detection, key bindings, shortcuts) |
| 52–1480 | Utility functions (toolbar DOM, editor actions, toggle helpers, selection replacement, frontmatter helpers) |
| 1762 | `EasyMDE` constructor |
| 1985–3050 | Prototype methods (image upload, status bar, rendering, lifecycle, toolbar/statusbar creation, value access, state queries) |

### Frontmatter Implementation

See [`docs/frontmatter.md`](docs/frontmatter.md) for complete documentation of the frontmatter feature, including options, detection rules, preview rendering, editor styling, formatting guards, status bar behavior, YAML syntax support, API reference, and test coverage.

Key files:

| File | Purpose |
|------|---------|
| `src/js/easymde.js` | All frontmatter logic (helpers, markdown(), render(), createStatusbar(), guarded actions) |
| `src/css/easymde.css` | `.cm-frontmatter` and GFM override rules (bottom of file) |
| `types/easymde.d.ts` | `enableFrontmatter?` and `previewIgnoreFrontmatter?` option types |
| `cypress/e2e/7-frontmatter/` | 14 E2E tests for frontmatter |

## Testing

- **Cypress** for E2E tests (7 suites in `cypress/e2e/`, 61 total tests).
- **TypeScript** type checking validates `types/easymde.d.ts` against `types/easymde-test.ts`.
- CI runs on Node.js 14–24 matrix via GitHub Actions (`.github/workflows/cd.yaml`).

## Code Style

- ESLint config in `.eslintrc`: single quotes, semicolons required, trailing commas, ES2018, extends `eslint:recommended`.
- `.editorconfig`: UTF-8, LF line endings, 4-space indent (2-space for YAML).
