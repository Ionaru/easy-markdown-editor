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

## E8 — Colour contrast follow-up (WCAG)

**File:** `src/styles.scss`

Two tokens fall short of the contrast the README originally claimed outright. The README now documents them as explicit exceptions ([Accessibility](../README.md#accessibility)); this item is about fixing the colours so the unqualified claim can come back.

| Token                    | Pair                                                      | Light                      | Dark                       | Target            |
| ------------------------ | --------------------------------------------------------- | -------------------------- | -------------------------- | ----------------- |
| `--easymde-border-color` | on `--easymde-bg` / `--easymde-toolbar-bg`                | 1.53:1 / 1.45:1            | 2.42:1 / 2.22:1            | 3:1 (WCAG 1.4.11) |
| `--easymde-selection-bg` | editor text (body and syntax) on the selection background | 8.76:1 body / 5.01:1 worst | 5.73:1 body / 3.74:1 worst | 7:1 (AAA)         |

- The border is currently decorative, so raising it to 3:1 is a visual-design decision rather than a pure bug fix: `#d1d1d1` would need to go to about `#949494` on white (3.0:1, the boundary) and darker still against the toolbar background, which reads as a noticeably heavier box.
- The selection backgrounds need work in **both** themes, measured against the _worst_ token rather than body text. Dark `#264f78`: body text `#d4d4d4` is 5.73:1, but `--easymde-syntax-invalid` is the floor at 3.74:1, with `mark`, `keyword`, `comment` and `string` all under 4:1. Light `#d7d4f0`: body text is fine at 8.76:1, but `--easymde-syntax-comment` drops to 5.01:1 and every other syntax colour sits between 5.2:1 and 6.6:1.
- Note this is a harder fix than it looks: the selection background has to clear 7:1 against ten syntax colours at once, so it may be better to lighten/darken the syntax palette for selected ranges than to move the selection colour alone.
- Everything else already passes. Against the normal editor and toolbar backgrounds, all body text and every syntax colour measure at AAA (7:1+) in both themes, and the focus ring and active-toggle border sit comfortably above the 3:1 floor.

Once fixed, restore the unqualified wording in the README's Accessibility section and drop the exceptions paragraph.

## E9 — Ship CodeMirror as peer dependencies

**Files:** `vite.config.ts`, `package.json`

`vite.config.ts` lists `@codemirror/*` in `deps.alwaysBundle`, so `dist/index.mjs` inlines its own copy of CodeMirror, while `package.json` _also_ declares `@codemirror/state` and `@codemirror/view` as runtime dependencies. A consumer therefore resolves a second, separate instance.

CodeMirror identifies state effects by object identity, so anything a plugin author builds from their own copy is silently ignored by the bundled editor:

```ts
// Does nothing: no error, no listener, no update.
editor.codemirror.dispatch({
    effects: StateEffect.appendConfig.of(EditorView.updateListener.of(handler)),
});
```

This is why the README's plugin example observes the rendered DOM with a `MutationObserver` instead of appending an `updateListener`.

Fix: drop `@codemirror/*` from `alwaysBundle` and declare those packages as `peerDependencies` so the host application and the editor share one instance. Then:

- restore the idiomatic `updateListener` / `ViewPlugin` example in the README's [Plugin API](../README.md#plugin-api) section and delete the interop warning,
- re-check bundle size and the `exports` map,
- add a test asserting that a consumer-built `StateEffect` is honoured.

## E10 — Wire or remove the inert options

**File:** `src/options.ts`

These are declared in `InputOptions` but never read, which forces the README to carry a "not wired" caveat table:

`codemirrorExtensions`, `indentWithTabs`, `tabSize`, `lineWrapping`, `lineNumbers`, `minHeight`, `maxHeight`.

Each needs a decision: implement it, or delete it from the type so the surface stops promising it. `codemirrorExtensions` is the important one, since it is the intended CM6 escape hatch and pairs naturally with E9. `minHeight` / `maxHeight` currently exist only as a hard-coded `300px` in `styles.scss`.

## E11 — Lifecycle callbacks

Implement the option-level hooks proposed in [plugins-and-extensions.md §7.2](plugins-and-extensions.md), such as `onDocumentChange`, `onPreviewToggle` and `onLayoutModeChange`. Today `onToggleFullScreen` is the only one that exists, and the others are not declared in `InputOptions` at all, so passing them is a type error rather than a no-op. Dropping the caveat from the README options reference depends on this.

## E12 — Export the toolbar icon types

**File:** `src/index.ts`

`IToolbarButtonOptions` is exported, but `ToolbarIcon` and `LayeredIcon` are not. A consumer writing a custom layered-icon button cannot name the type and has to rely on an inferred object literal. Export both.

---

## Prioritisation

| Item                    | Priority | Reason                                                        |
| ----------------------- | -------- | ------------------------------------------------------------- |
| E9 CodeMirror peer deps | High     | Plugin API is effectively unusable for CM6-aware plugins      |
| E1 Image upload         | High     | Heavily used V2 feature; many users cited it                  |
| E8 Colour contrast      | Medium   | Accessibility claim has to stay qualified until this is fixed |
| E10 Inert options       | Medium   | Documented caveat; `codemirrorExtensions` is the escape hatch |
| E11 Lifecycle callbacks | Medium   | Asked for in #447; only `onToggleFullScreen` exists today     |
| E3 Shortcut overrides   | Medium   | Quality-of-life; not blocking core use                        |
| E4 Status bar custom    | Medium   | Needed for power users; not complex                           |
| E2 Autosave             | Medium   | Common request; isolated plugin, low risk                     |
| E5 RTL                  | Low      | Niche audience; mostly CSS work                               |
| E6 Spellcheck           | Low      | Resolution is to drop it                                      |
| E7 autoRefresh          | Low      | Likely not needed with CM6                                    |
| E12 Export icon types   | Low      | Small DX fix                                                  |
