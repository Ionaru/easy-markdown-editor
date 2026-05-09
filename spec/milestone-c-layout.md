# Milestone C — Layout Modes

**Goal:** Side-by-side, fullscreen, and dark mode / theming.  
Depends on Milestone A (preview pipeline) and Milestone B (toolbar actions).

---

## C1 — Side-by-side mode

**Files:** `src/easymde.ts`, `src/toolbar/buttons/toggle-side-by-side.ts` (new), `src/styles.scss`

### Behaviour

- The container is split 50/50 between the CM editor pane and the preview pane.
- The preview re-renders on every document change (debounced, ~300ms).
- Scroll positions are synchronised: scrolling one side proportionally scrolls the other (controlled by `syncSideBySidePreviewScroll` option, default `true`).
- Side-by-side can operate independently of fullscreen (controlled by `sideBySideFullscreen` option, default `false` for V3 — V2 defaulted to `true`, coupling the two modes).

### Implementation

1. `EasyMDE.toggleSideBySide()` public method.
2. When activated:
    - Add CSS class `easymde-side-by-side` to the container.
    - Show the preview pane (already exists from Milestone A).
    - Install a CM `updateListener` extension that debounce-calls `preview.render(this.value())`.
    - If `syncSideBySidePreviewScroll`, install scroll listeners on both panes.
3. When deactivated: remove the class, hide the preview, remove scroll listeners.
4. `isSideBySideActive()` public method.

### CSS additions

```scss
.easymde-container.easymde-side-by-side {
    display: grid;
    grid-template-columns: 1fr 1fr;
    /* toolbar and status bar span both columns */
}
```

### Toolbar button

`src/toolbar/buttons/toggle-side-by-side.ts` — action: `editor.toggleSideBySide()`, active: `editor.isSideBySideActive()`. Add to default toolbar (last group, before fullscreen).

---

## C2 — Fullscreen mode

**Files:** `src/easymde.ts`, `src/toolbar/buttons/toggle-fullscreen.ts` (new), `src/styles.scss`

### Behaviour

- The editor container expands to fill the entire viewport (position: fixed, inset: 0).
- The page body scrolls are suppressed while fullscreen is active.
- Pressing Escape exits fullscreen.
- `onToggleFullScreen(entering: boolean)` callback is fired on each transition.

### Implementation

1. `EasyMDE.toggleFullscreen()` public method.
2. When activated:
    - Add CSS class `easymde-fullscreen` to the container.
    - Add `overflow: hidden` to `document.body` (stored for restore).
    - Register a one-time `keydown` listener for Escape.
    - Call `options.onToggleFullScreen?.(true)`.
3. When deactivated: reverse all of the above, call `options.onToggleFullScreen?.(false)`.
4. `isFullscreenActive()` public method.

### CSS additions

```scss
.easymde-container.easymde-fullscreen {
    position: fixed;
    inset: 0;
    z-index: 9999;
    border-radius: 0;
    display: flex;
    flex-direction: column;

    .cm-editor {
        flex: 1;
        border-radius: 0;
    }
}
```

### Toolbar button

`src/toolbar/buttons/toggle-fullscreen.ts`. **Default key bindings** for side-by-side and fullscreen are listed in [milestone-b-toolbar.md — B14](milestone-b-toolbar.md#b14--keyboard-shortcuts) (F9 / F11). Add to default toolbar.

---

## C3 — Dark mode and theming

**Files:** `src/styles.scss`

### CSS custom properties (already partially in place)

Finalise the variable set:

```scss
:root {
    --easymde-border-color: #d1d1d1;
    --easymde-bg: #ffffff;
    --easymde-text: #333333;
    --easymde-toolbar-bg: #f9f9f9;
    --easymde-toolbar-hover: #e8e8e8;
    --easymde-toolbar-active: #d8d8d8;
    --easymde-toolbar-enabled: #e0e0e0;
    --easymde-preview-bg: #ffffff;
    --easymde-preview-text: #333333;
    --easymde-statusbar-text: #595959;
}

@media (prefers-color-scheme: dark) {
    :root {
        --easymde-border-color: #444444;
        --easymde-bg: #1e1e1e;
        --easymde-text: #d4d4d4;
        --easymde-toolbar-bg: #252526;
        --easymde-toolbar-hover: #2d2d2d;
        --easymde-toolbar-active: #3a3a3a;
        --easymde-toolbar-enabled: #37373d;
        --easymde-preview-bg: #1e1e1e;
        --easymde-preview-text: #d4d4d4;
        --easymde-statusbar-text: #858585;
    }
}
```

### `theme` option

`InputOptions.theme` sets a `data-easymde-theme` attribute on the container:

```ts
if (options.theme) {
    container.dataset.easymdeTheme = options.theme;
}
```

Consumers override variables by targeting `[data-easymde-theme="custom"]` in their own CSS. The V3 bundle ships no named themes beyond the light/dark default — this is a deliberate departure from V2's `simplemde` theme.

For [issue #447](https://github.com/Ionaru/easy-markdown-editor/issues/447), **“updated standard look”** means this **tokenized default theme** (light + automatic dark via `prefers-color-scheme`, plus optional `data-easymde-theme` overrides) shipped with **`v3.0.0`**. A **full visual redesign** (new layout paradigm, illustration-heavy chrome, marketing-grade polish) is **out of scope for Stable** unless separately scheduled — track such work as **Post-`v3.0.0`** in [overview.md](overview.md).

### Acceptance criteria for Milestone C

- [ ] `toggleSideBySide()` splits the container and re-renders preview on each change.
- [ ] `isSideBySideActive()` returns the correct boolean.
- [ ] Scroll sync works when `syncSideBySidePreviewScroll` is true.
- [ ] `toggleFullscreen()` covers full viewport; Escape exits.
- [ ] `isFullscreenActive()` returns the correct boolean.
- [ ] `onToggleFullScreen` callback fires with correct boolean.
- [ ] F9 / F11 keyboard shortcuts work.
- [ ] Dark mode applies automatically via `prefers-color-scheme: dark`.
- [ ] `theme` option sets `data-easymde-theme` for consumer CSS targeting.
- [ ] `vp check` and `vp test` pass.
