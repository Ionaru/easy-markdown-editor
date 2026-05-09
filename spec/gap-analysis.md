# EasyMDE V3 — Gap Analysis

Comparison against EasyMDE V2 (the reference) and the goals expressed in issue #447.

## Critical gaps — block the MVP

### 1. Preview rendering

`marked` is imported but there is no preview pane, no `togglePreview()`, and no rendering path.
The user's stated MVP requirement is "writing markdown & previewing the result."

**Needed:** `src/preview/preview.ts` with a `render(md: string): void` method, HTML sanitization, and a `togglePreview()` public method. See milestone A step 5.

### 2. Inline code vs fenced code block

The current `code` button wraps selection in single back-ticks (`` ` ``). V2 has two separate concepts:

- **Inline code**: wraps in `` ` ``
- **Code block**: wraps in triple back-tick fences (or indents with 4 spaces)

`blockStyles.code` is set to `` ` `` but used for a button labelled "Code" that implies a block action. Must be split.

### 3. Line-prefix toggles (heading, quote, lists)

`toggleBlock` handles symmetric inline pairs (`**text**`). It cannot handle line-prefix syntax: `# heading`, `> quote`, `- list item`, `1. ordered`.

**Needed:** A `toggleLine` / `togglePrefix` utility that operates on every line intersecting the current selection, idempotently adds/removes a given prefix.

### 4. All remaining toolbar button actions

Heading, quote, unordered list, ordered list, clean-block, link, image all render in the toolbar but have no action. These block a usable editor experience.

### 5. Link and image prompts

V2 opens `window.prompt` (or a custom prompt via `promptTexts`). V3 needs to implement at minimum a `window.prompt` fallback, honouring the `promptURLs` and `promptTexts` options.

### 6. Undo / redo

CodeMirror 6's `history()` extension is not added to the editor state. The toolbar buttons exist in V2 but are absent from V3's default toolbar entirely.

### 7. Keyboard shortcuts

No keymap extension is installed. V2 provided 15+ default bindings (Ctrl+B, Ctrl+I, Ctrl+K, F9, F11, etc.). Without these, V3 is significantly less usable.

### 8. Form sync

When a `<form>` is submitted with the editor mounted, the textarea still holds its original value — CM content is never written back. V2 handled this with a `submit` listener and optional `forceSync` (write on every change).

### 9. Public API

V2 exposed: `value()`, `value(text)`, `toTextArea()`, `cleanup()`, `isPreviewActive()`, `isSideBySideActive()`, `isFullscreenActive()`, `clearAutosavedValue()`. V3 has none of these. Without `value()`, consumers cannot programmatically read or write content.

### 10. Custom element stub

`<easy-markdown-editor>` renders "Hello World!". Either implement it as a real thin wrapper around `EasyMDE` or remove it from the public exports before shipping.

### 11. FontAwesome full-bundle

`library.add(fas)` pulls ~1400 icons. Issue #447 explicitly listed "icon flexibility without bloated downloads" as a V3 goal. Only ~12 icons are used by the default toolbar.

---

## Important gaps — needed for stable 1.0

### 12. Side-by-side mode

50/50 split view with the CM editor on the left and a live-updating preview on the right. Requires the preview pipeline. V2 keyboard shortcut: F9.

### 13. Fullscreen mode

The editor expands to fill the viewport. V2 keyboard shortcut: F11. Needs CSS + `body` class toggle + Escape handler.

### 14. Dark mode / theming

Issue #447 explicitly listed "built-in dark mode" as a goal. `styles.scss` has a commented-out `prefers-color-scheme: dark` block and the CSS custom properties are already in place as the groundwork.

### 15. Custom toolbar configuration

`InputOptions.toolbar` accepts `false`, a boolean, or a custom array; `hideIcons`/`showIcons` also exist in the type. But `defaultToolbar` is hard-wired — none of this is honoured at runtime.

### 16. HTML sanitization in preview

Rendering user-supplied Markdown to HTML without sanitization is an XSS vector. A default safe path is required before production (either DOMPurify, escape-only, or a required `sanitizerFunction`). See `decisions.md`.

### 17. Image upload (paste / drop / dialog)

V2's image upload with CSRF, size/type validation, and server endpoint support. Large V2 feature; a natural plugin candidate for V3.

---

## Architectural gaps

### A. Async constructor

`EasyMDE`'s constructor fires `void this.construct()`. There is no way for consumers to `await` readiness, and `isRendered` is a boolean that can be false after construction completes. Solution: static `EasyMDE.create(opts)` factory, or synchronous construction (move dynamic imports to eager).

### B. Plugin lifecycle contract

`IEasyMDEPlugin` requires `build(args: unknown)` and `destroy()`. No built-in plugin honours this: `Toolbar` builds in its constructor; `StatusBar` is not even registered as a plugin. The contract should be `{ mount(container): HTMLElement; unmount(): void }` and `addPlugin` should drive the lifecycle.

### C. `Toolbar.build()` duplication

Constructor and `build()` both append buttons to `this.element`. Only the constructor path is currently active. Remove one or clearly document the distinction.

### D. `countWords` regex

`current.split(" ")` misses tab/newline/multi-space boundaries. Replace with `/\S+/g` match or `.split(/\s+/)`.

### E. `Options` vs `InputOptions` divergence

`InputOptions` defines ~40 fields. `Options` (the resolved type) only models 3. Either `Options` should be the fully-resolved/defaulted config shape (with every field typed), or the unsupported fields should be removed from `InputOptions` so consumers don't pass things that do nothing.

### F. Accessibility baseline

- `tabIndex=-1` on every toolbar button means keyboard users cannot reach the toolbar.
- No `role="toolbar"` on the toolbar container.
- No `aria-label` (only `title`).
- No `aria-pressed` for toggle buttons.

### G. No integration tests

Only `toggle-block.spec.ts` exists. The toolbar wiring, status bar, preview, public API, and `EasyMDE` end-to-end flow are untested.

### H. Dev server story

`tests/index.html` loads from `../dist/` and requires a prior `vp pack`. There is no `vp dev` path that serves source directly.
