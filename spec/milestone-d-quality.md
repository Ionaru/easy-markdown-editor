# Milestone D — Quality, Accessibility, Docs

**Goal:** The editor is safe to ship publicly.
Depends on Milestones A–C.

---

## D1 — Accessibility

**Files:** `src/toolbar/toolbar.ts`, `src/styles.scss`

### Keyboard navigation

- Set `tabIndex=0` on the first toolbar button; all others get `tabIndex=-1`.
- Implement arrow-key navigation inside the toolbar (`role="toolbar"` keyboard pattern: left/right arrows move focus among buttons, skipping separators).
- Home / End move to first / last button.

### ARIA attributes

- Add `role="toolbar"` to `.easymde-toolbar`.
- Each button gets `aria-label` populated from its `title` (already set).
- Toggle buttons get `aria-pressed` that mirrors the `enabled` class. Update it in the same place the class is toggled.
- Separators get `role="separator"` and `aria-orientation="vertical"`.
- The preview pane gets `role="region"` and `aria-label="Preview"`.
- The status bar gets `role="status"` and `aria-live="polite"`.

### Focus management

- When `construct()` runs, focus the editor (already done at `src/easymde.ts:155`).
- When `togglePreview()` switches to preview, move focus to the preview pane.
- When preview is dismissed, return focus to the editor.

### CSS: visible focus ring

Ensure `:focus-visible` produces a visible ring on toolbar buttons. Remove `outline: none` from `.cm-editor.cm-focused` — or replace with a styled outline that fits the theme.

---

## D2 — Tests

### Unit tests to add

| File                                | What to test                                                                           |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| `src/utils/count-words.spec.ts`     | Space, tab, newline, multi-space, empty doc                                            |
| `src/utils/toggle-line.spec.ts`     | All cases: single line, multi-line, already-applied, partial, heading prefix collision |
| `src/toolbar/build-toolbar.spec.ts` | `toolbar: false`, `toolbar: array`, `hideIcons`, `showIcons` resolution                |
| `src/preview/preview.spec.ts`       | Render Markdown → HTML, sanitization (script tag stripped), `previewRender` override   |
| `src/easymde.spec.ts`               | `value()`, `value(text)`, `construct()` / `destruct()` cycle, form-submit sync         |

### Integration tests

Set up a single browser-mode vitest suite (or Playwright) that loads the editor in a real DOM:

- Bold button click → `**` added to content
- Preview button click → preview pane visible, CM editor hidden
- Keyboard shortcut Ctrl+B → bold toggle fires
- Toolbar keyboard navigation (arrow keys move focus)
- Form submit → textarea value matches editor content

### Regression protection

- Run `vp test` in CI on every PR targeting `main` / `v3`.
- Add a `vp run build` step that ensures the dist artifact builds cleanly.

---

## D3 — Dev server story

**File:** `vite.config.ts`, `tests/index.html`

- Add a `dev` task in `vite.config.ts` (or a separate `vite.demo.config.ts`) that serves `tests/index.html` with source from `src/` instead of `dist/`.
- Update `tests/index.html` to import from `src/index.ts` via a Vite dev server path (use a module script import that Vite handles via HMR).
- Add 2–3 preset demos to the HTML: default config, custom toolbar array, preview-only mode.

This allows `vp dev` to spin up a live-reloading demo during development.

---

## D4 — Documentation

**File:** `README.md`

Rewrite the readme for V3. Sections:

1. **Quick start** — install, basic usage (`new EasyMDE({ element })`), preview.
2. **Options reference** — one table per options group (display, behaviour, toolbar, preview, etc.). Mark `@deprecated` items. Clearly note which V2 options are dropped.
3. **Toolbar customisation** — custom button arrays, `hideIcons`, `showIcons`, custom button shape.
4. **Keyboard shortcuts** — full default map, note that overrides are post-1.0.
5. **Plugin API** — `IEasyMDEPlugin` interface, `addPlugin`, basic example.
6. **Web component** — `<easy-markdown-editor>` attribute reference.
7. **Migrating from V2** — table of what changed, what was removed, what behaves differently.
8. **Contributing** — link to `CONTRIBUTING.md`, how to run `vp dev`, `vp test`, `vp check`.

---

## D5 — npm beta publish

**File:** `package.json`

1. Confirm `package.json` metadata (name, homepage, repo URL, author) before publishing.
2. Update `version` to `3.0.0-beta.1` via `bumpp` or manual edit.
3. Add a `"beta"` dist-tag: `npm publish --tag beta`.
4. Document the beta in the repo (a `CHANGELOG.md` entry or a GitHub release).

The maintainer committed to this in issue #447 (comment 2025-05-01).

---

## Acceptance criteria for Milestone D

- [ ] `role="toolbar"` present; arrow-key navigation moves toolbar focus.
- [ ] `aria-pressed` on toggle buttons reflects live state.
- [ ] Preview pane receives focus on `togglePreview()`; editor regains focus on toggle-back.
- [ ] All new unit test files pass under `vp test`.
- [ ] At least one integration test confirms toolbar → editor interaction in a real DOM.
- [ ] `vp dev` serves the demo with live reload.
- [ ] README covers all options, migration from V2, and the plugin API.
- [ ] `npm publish --tag beta` produces a working installable package.
- [ ] `vp check` passes (no lint/type errors).
