# Milestone E — Post-Stable Additions

**Goal:** Features that did not block the initial stable release but are important for V2 parity and community adoption.  
These are tracked here so they don't fall off the radar, but they should not block 1.0.

---

## E1 — Image upload plugin

**Proposed location:** `src/plugins/image-upload.ts`

A self-contained plugin that adds:

- **Drag-and-drop**: overlay shown on `dragover`; file read + upload on `drop`.
- **Paste**: `ClipboardEvent` handler for image files.
- **File dialog**: triggered by the "upload image" toolbar button (separate from the "insert image URL" button from Milestone B).

Upload flow:

1. Validate MIME type against `imageAccept` (default `image/png,image/jpeg`).
2. Validate file size against `imageMaxSize` (default 2 MB).
3. If `imageUploadFunction` is provided, delegate to it.
4. Otherwise `POST` the file to `imageUploadEndpoint`.
    - Include CSRF token if `imageCSRFToken` is set (via header if `imageCSRFHeader` is true, else form field).
5. On success: insert `![filename](url)` at cursor.
6. Update status bar text through the `imageTexts` messages during each phase.
7. On error: invoke `errorCallback` with the appropriate `errorMessages` key.

This is intentionally a plugin (not core) so consumers who don't need image upload don't pay for the drag-and-drop event wiring.

---

## E2 — Autosave plugin

**Proposed location:** `src/plugins/autosave.ts`

Mirrors V2's autosave feature:

- Save to `localStorage` keyed by `autosave.uniqueId` every `autosave.delay` ms (default 10 000).
- On `construct()`, restore saved value if present.
- Expose `easyMDE.clearAutosavedValue()` to clear the saved value.
- On form submit, clear the autosave entry.
- Update the status bar with `autosave.text` and the timestamp in `autosave.timeFormat`.
- Optional `autosave.submit_delay` to handle submit + autosave race.

---

## E3 — Keyboard shortcut overrides

**File:** `src/keymap.ts`

Extend the keymap builder to accept the `shortcuts` option from `InputOptions`:

```ts
export const buildKeymap = (
  actions: ActionMap,
  overrides?: Shortcuts,
): KeyBinding[]
```

- For each key in `overrides`, if the value is `null`, remove that binding.
- If the value is a string, replace the default binding with the new key combo.
- Keys follow CM6 notation (e.g. `"Ctrl-b"`, `"Mod-b"` for cross-platform).

---

## E4 — Status bar customisation

**File:** `src/status-bar/status-bar.ts`

Honour the `status` option:

- `status: false` — do not render the status bar.
- `status: string[]` — show only the named built-in items (`"lines"`, `"words"`, `"characters"`, `"cursor"`).
- `status: StatusBarItem[]` — mix built-in names and custom `{ className, defaultValue, onUpdate }` items.
- `status: true` (default) — show all built-in items.

This requires refactoring `StatusBar` to iterate an item list rather than hard-coding the four `<span>` elements.

---

## E5 — RTL direction support

**File:** `src/easymde.ts`, `src/styles.scss`

When `options.direction === 'rtl'`:

- Set `dir="rtl"` on the container element.
- Set `EditorView.contentAttributes({ dir: 'rtl' })` extension on the CM state.
- Ensure the toolbar and status bar layout flows right-to-left.

CSS: use logical properties (`margin-inline-start`, `padding-inline-end`, etc.) throughout `styles.scss` so that RTL is handled automatically where possible.

---

## E6 — Spellcheck decision (deferred)

See `decisions.md` §5. The recommendation is to drop the V2 JS spellchecker and rely on native browser spellcheck:

- `nativeSpellcheck: true` (default) → set `spellcheck="true"` on the CM contenteditable element via `EditorView.contentAttributes`.
- `nativeSpellcheck: false` → set `spellcheck="false"`.
- Document that the V3 JS spellchecker is removed and explain the native alternative.

No custom spellcheck plugin is planned unless there is strong community demand.

---

## E7 — `autoRefresh` for hidden editors

**File:** `src/easymde.ts`

V2 added an `autoRefresh` option to handle editors mounted inside hidden containers (e.g. a tab that is not visible on load). CM6 generally handles this better than CM2 did, but confirm whether `EditorView.requestMeasure()` is needed for any layout-sensitive scenarios. If confirmed not needed, document that `autoRefresh` is a V2-only quirk.

---

## Prioritisation

| Item                  | Priority | Reason                                       |
| --------------------- | -------- | -------------------------------------------- |
| E1 Image upload       | High     | Heavily used V2 feature; many users cited it |
| E3 Shortcut overrides | Medium   | Quality-of-life; not blocking core use       |
| E4 Status bar custom  | Medium   | Needed for power users; not complex          |
| E2 Autosave           | Medium   | Common request; isolated plugin, low risk    |
| E5 RTL                | Low      | Niche audience; mostly CSS work              |
| E6 Spellcheck         | Low      | Resolution is to drop it                     |
| E7 autoRefresh        | Low      | Likely not needed with CM6                   |
