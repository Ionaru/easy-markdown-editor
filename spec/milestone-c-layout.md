# Milestone C — Layout Modes

**Goal:** Side-by-side, fullscreen, and dark mode / theming.  
Depends on Milestone A (preview pipeline) and Milestone B (toolbar actions).

---

## Conventions established by Milestones A and B

**Preview plugin.** `src/preview/preview.ts` exports `Preview implements IEasyMDEPlugin` and is registered through `EasyMDE.addPlugin` during `construct()`. `togglePreview()` / `isPreviewActive()` (from [milestone-a-foundations.md A5–A6](milestone-a-foundations.md)) toggle the `preview-active` class on the container, which CSS-swaps the CM editor and the `.easymde-preview` pane (`src/styles.scss`). Side-by-side and fullscreen reuse this exact element — no new preview DOM is built.

**Deferred toolbar buttons.** `src/toolbar/button-registry.ts` declares `DEFERRED_BUTTON = Symbol("deferred-button")` and maps `"side-by-side"` and `"fullscreen"` to it; `buildToolbar` silently drops `DEFERRED_BUTTON` entries from the resolved layout (see [milestone-b-toolbar.md B15](milestone-b-toolbar.md#b15--custom-toolbar-configuration)). C1 and C2 each replace one sentinel with the real `IToolbarButtonOptions`.

**Dormant keymap stubs.** [milestone-b-toolbar.md B14](milestone-b-toolbar.md#b14--keyboard-shortcuts) registers F9 and F11 as `() => false` no-ops at `src/keymap.ts:71-72` so they fall through to the browser. C1 and C2 swap those to `bind(...)` calls against the new public methods, and the corresponding placeholder tests (`src/keymap.spec.ts:208` for F9, `:221` for F11) are rewritten to assert the real action fires.

**Boundary discipline.** Public toolbar action functions accept `EasyMDE`; the new `toggleSideBySide`/`toggleFullscreen` methods live on `EasyMDE` itself and the button actions are one-liners that call them. No utility module needed — both modes are pure DOM/state on the editor instance.

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

`src/toolbar/buttons/toggle-side-by-side.ts` — action: `editor.toggleSideBySide()`, active: `editor.isSideBySideActive()`. Replace the `DEFERRED_BUTTON` sentinel under `"side-by-side"` in `src/toolbar/button-registry.ts` with `toggleSideBySideButton`. Add a new trailing group `[toggleSideBySideButton, toggleFullscreenButton]` to `src/toolbar/default-toolbar.ts` (after the existing `[openGuideButton]` group).

The button file must `import type { EasyMDE }` to avoid the registry ↔ default-toolbar circular-import TDZ trap (see `src/toolbar/buttons/*` for the established pattern).

### Options addition

Declare on `InputOptions` and resolve in `resolveOptions`:

```ts
syncSideBySidePreviewScroll?: boolean;
sideBySideFullscreen?: boolean;
```

```ts
syncSideBySidePreviewScroll: input.syncSideBySidePreviewScroll ?? true,
sideBySideFullscreen: input.sideBySideFullscreen ?? false,
```

Both become non-optional `boolean` in the resolved `Options` type. `sideBySideFullscreen: false` is a deliberate departure from V2 (which defaulted to `true` and coupled the two modes); V3 lets consumers opt back in by passing `true`.

### Keymap

Replace `src/keymap.ts:71` `{ key: "F9", run: () => false }` with `{ key: "F9", run: bind((e) => e.toggleSideBySide()) }` and rewrite `src/keymap.spec.ts:208` to assert the call instead of fall-through.

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

`src/toolbar/buttons/toggle-fullscreen.ts` — action: `editor.toggleFullscreen()`, active: `editor.isFullscreenActive()`. Replace the `DEFERRED_BUTTON` sentinel under `"fullscreen"` in `src/toolbar/button-registry.ts` with `toggleFullscreenButton`. Wired into the trailing default-toolbar group alongside side-by-side per C1.

Same `import type { EasyMDE }` rule applies.

### Options addition

Declare on `InputOptions`:

```ts
onToggleFullScreen?: (entering: boolean) => void;
```

No `resolveOptions` default — optional callback, called only when set. Stays optional in the resolved `Options` type.

### Keymap

Replace `src/keymap.ts:72` `{ key: "F11", run: () => false }` with `{ key: "F11", run: bind((e) => e.toggleFullscreen()) }` and rewrite `src/keymap.spec.ts:221` to assert the call. Note: this preempts the browser-native F11; the dormant version intentionally fell through so users kept browser fullscreen — document the change in CHANGELOG.

---

## C3 — Dark mode and theming

**Files:** `src/styles.scss`

### CSS custom properties

`src/styles.scss:6-9` already declares four tokens for toolbar chrome (`--easymde-border-color`, `--easymde-enabled-color`, `--easymde-hover-color`, `--easymde-active-color`). The lightness-twiddled hover/enabled/active set was scoped to the toolbar; C3 broadens to editor / preview / statusbar surfaces and namespaces the toolbar-only tokens explicitly to free the unprefixed names.

**Rename** the existing tokens — every use site in `src/styles.scss` updates in the same pass:

| Before                    | After                       |
| ------------------------- | --------------------------- |
| `--easymde-enabled-color` | `--easymde-toolbar-enabled` |
| `--easymde-hover-color`   | `--easymde-toolbar-hover`   |
| `--easymde-active-color`  | `--easymde-toolbar-active`  |

`--easymde-border-color` keeps its name. Then finalise the full set:

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
```

The existing `.easymde-preview { background: white; }` (`src/styles.scss:109`) and the hard-coded `color: #595959` in `.easymde-statusbar` (`src/styles.scss:130`) become `var(--easymde-preview-bg)` and `var(--easymde-statusbar-text)` respectively.

### Dark mode

`src/styles.scss:12-19` currently contains a commented-out `@media (prefers-color-scheme: dark)` skeleton with placeholder colours. Replace it with the production block:

```scss
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

Add to `InputOptions`:

```ts
theme?: string;
```

No `resolveOptions` default (omitted → no attribute set). In `EasyMDE.construct()`, after the container is built and before plugins mount, apply:

```ts
if (this.#options.theme) {
    this.#container.dataset.easymdeTheme = this.#options.theme;
}
```

Consumers override variables by targeting `[data-easymde-theme="custom"]` in their own CSS. The V3 bundle ships no named themes beyond the light/dark default — this is a deliberate departure from V2's `simplemde` theme.

For [issue #447](https://github.com/Ionaru/easy-markdown-editor/issues/447), **“updated standard look”** means this **tokenized default theme** (light + automatic dark via `prefers-color-scheme`, plus optional `data-easymde-theme` overrides) shipped with **`v3.0.0`**. A **full visual redesign** (new layout paradigm, illustration-heavy chrome, marketing-grade polish) is **out of scope for Stable** unless separately scheduled — track such work as **Post-`v3.0.0`** in [overview.md](overview.md).

### Acceptance criteria for Milestone C

- [x] `toggleSideBySide()` splits the container and re-renders preview on each change.
- [x] `isSideBySideActive()` returns the correct boolean.
- [x] Scroll sync works when `syncSideBySidePreviewScroll` is true.
- [x] `sideBySideFullscreen: true` couples side-by-side with fullscreen (V2 parity opt-in).
- [x] `toggleFullscreen()` covers full viewport; Escape exits.
- [x] `isFullscreenActive()` returns the correct boolean.
- [x] `onToggleFullScreen` callback fires with correct boolean.
- [x] F9 / F11 keyboard shortcuts work.
- [x] Dark mode applies automatically via `prefers-color-scheme: dark`.
- [x] `theme` option sets `data-easymde-theme` for consumer CSS targeting.
- [x] `vp check` and `vp test` pass.
