# Milestone B — Toolbar Feature Parity

**Goal:** Every toolbar button in V2's default set has a working action in V3.  
Depends on Milestone A (especially the plugin lifecycle and `toggleLine` utility).

---

## B1 — `toggleLine` utility

**Files:** `src/utils/toggle-line.ts` (new), `src/utils/toggle-line.spec.ts` (new)

A companion to `toggleBlock` for line-prefix syntax (`# heading`, `> quote`, `- list item`).

```ts
export const toggleLine = (editor: EditorView, prefix: string): void
export const checkLine = (editor: EditorView, prefix: string): boolean
```

Rules:

- Operates on every line that intersects `state.selection.main`.
- If **all** intersected lines already start with `prefix ` (prefix + space), remove it from all.
- Otherwise, add `prefix ` to all lines that don't already have it.
- Dispatch a single transaction with one change per affected line.

`checkLine` returns `true` if all intersected lines carry the prefix.

Tests must cover: single line cursor, multi-line selection, already-applied (idempotent remove), partially-applied (apply to remainder), and prefix collision (e.g. `##` vs `#`).

---

## B2 — Heading buttons

**Files:** `src/toolbar/buttons/toggle-heading.ts` (new)

Actions:

- `toggleHeadingSmaller(editor)` — step down one level (`#`→`##`→`###`→ none → `#`).
- `toggleHeadingBigger(editor)` — step up one level (inverse of above).
- `toggleHeading1..6(editor)` — set to exactly that level; remove if already at that level.

`checkHeading(editor, level)` returns `true` if all selection lines are at that heading level.

Active state (for `active` callback on buttons):

- Heading buttons glow when the cursor is on a line at that level.
- Heading-smaller / heading-bigger: active when any heading is present on the current line.

Wire into `defaultToolbar`: replace the inert `heading` button with a set of: `heading-1`, `heading-2`, `heading-3`, separator, `heading-smaller`, `heading-bigger`.

---

## B3 — Blockquote

**File:** `src/toolbar/buttons/toggle-quote.ts` (new)

```ts
export const toggleQuote = (editorView: EditorView): void => toggleLine(editorView, ">");
```

(or accept `EasyMDE` if you expose `editor.codemirror` at the boundary — **`toggleLine`** always receives **`EditorView`**.)

Active when all selection lines start with `> `.

Update `defaultToolbar` to wire the action and active state.

---

## B4 — Unordered and ordered lists

**Files:** `src/toolbar/buttons/toggle-ul.ts`, `src/toolbar/buttons/toggle-ol.ts` (new)

`toggleUnorderedList`: uses `toggleLine` with the configured `unorderedListStyle` (`*`, `-`, or `+`; default `*`). Reads `editor.options.unorderedListStyle`.

`toggleOrderedList`: more complex — sequential numbering (`1.`, `2.`, …).

- When adding: number the lines starting from `1.` (or continue from the preceding list item if the selection is inside an existing list).
- When removing: strip the `N. ` prefix from all lines.

Active state for both: `checkLine` with the appropriate prefix.

---

## B5 — Clean block

**File:** `src/toolbar/buttons/clean-block.ts` (new)

Removes all block-level formatting from the selected lines:

- Strip heading prefixes (`#`, `##`, …)
- Strip blockquote prefix (`>`)
- Strip list prefixes (`*`, `-`, `+`, `N.`)
- Strip fenced code fences if the selection is inside a fenced block

Does not touch inline formatting (bold, italic, etc.).

---

## B6 — Inline code vs fenced code block

**Files:** `src/toolbar/buttons/toggle-code.ts` (update), `src/toolbar/buttons/toggle-code-block.ts` (new)

- **Inline code** (`toggle-code.ts`): remains as-is (single back-tick wrapper). Rename internal action to `toggleInlineCode` for clarity.
- **Code block** (`toggle-code-block.ts`): wraps selection in ` ``` ` fences.
    - Single-line with no selection → insert a fenced block template with cursor inside.
    - Multi-line selection → wrap the whole selection in fences.
    - If the selection is already inside fences → remove them.

Add both to `defaultToolbar` (replace the current single `code` button with `inline-code` and `code-block`, or follow V2's approach of showing only `code` by default and adding `code-block` to `showIcons`).

---

## B7 — Horizontal rule

**File:** `src/toolbar/buttons/horizontal-rule.ts` (new)

Insert `\n\n---\n\n` at the cursor position (or after the current selection).

---

## B8 — Table

**File:** `src/toolbar/buttons/table.ts` (new)

Insert a minimal Markdown table template:

```
| Column 1 | Column 2 | Column 3 |
| -------- | -------- | -------- |
| Text     | Text     | Text     |
```

Position cursor at the first cell. Use `insertTexts.table` option if provided.

---

## B9 — Link insertion

**File:** `src/toolbar/buttons/draw-link.ts` (new)

1. If `promptURLs` is true (or no selection), open `window.prompt` (or `promptTexts.link` as the dialog message) for the URL.
2. Wrap the selection (or placeholder text) in `[text](url)` syntax.
3. Use `insertTexts.link` if provided as the template.

---

## B10 — Image insertion

**File:** `src/toolbar/buttons/draw-image.ts` (new)

Same flow as link insertion, using `![alt](url)` syntax.  
`promptTexts.image` for the dialog message.  
`insertTexts.image` if provided.

Image upload (paste / drop / file dialog) is a separate feature tracked in Milestone E.

---

## B11 — Task list (checkbox)

**Files:** `src/toolbar/buttons/toggle-task.ts` (new), extend `src/utils/toggle-line.ts` or add list-specific helpers as needed

GitHub-style task list items: `- [ ]` (unchecked) and `- [x]` or `- [X]` (checked).

- Toggle adds or removes the checkbox prefix on every line intersecting the selection (same line-surgery model as `toggleLine`).
- Typing rules should align with V2 behaviour where possible; see [original-analysis.md](original-analysis.md) (line-prefix / task list gap).
- Active state: all intersected lines are task-list lines with a consistent checked/unchecked state when applicable.

Wire into `defaultToolbar` (V2 includes a task-list control in its default set).

**Tests:** mirror `toggle-line` coverage (single line, multi-line, idempotent toggle, mixed list/task lines).

---

## B12 — Markdown guide / help

**File:** `src/toolbar/buttons/open-guide.ts` (new), `src/options.ts` (option wiring)

- The default toolbar’s **guide** / **help** button opens Markdown syntax documentation in a new browser tab (or same-tab if documented otherwise — default: `target="_blank"` + `rel="noopener"`).
- Add **`toolbarGuideUrl`** (or retain / alias V2’s field name if it already exists in `InputOptions`) — `string`, defaulting to a sensible public Markdown reference URL documented in the README.
- If the URL is empty / disabled, hide the button or no-op per `toolbar` builder rules.

**Acceptance:** the default toolbar control that maps to V2’s `guide` / `guide-link` id performs a deterministic open action.

---

## B13 — Undo / redo

**Files:** `src/easymde.ts`, `src/toolbar/buttons/undo.ts`, `src/toolbar/buttons/redo.ts` (new)

1. Add `history()` from `@codemirror/commands` to the editor extensions in `construct()`.
2. `undo`: dispatch `undo` command from `@codemirror/commands`.
3. `redo`: dispatch `redo` command from `@codemirror/commands`.
4. Add both to `defaultToolbar`.

---

## B14 — Keyboard shortcuts

**File:** `src/keymap.ts` (new)

Create a CM6 keymap using `keymap.of([...])` and `Prec.high`:

| Keys (Win/Linux)      | Keys (macOS) | Action               |
| --------------------- | ------------ | -------------------- |
| Ctrl+B                | Cmd+B        | toggleBold           |
| Ctrl+I                | Cmd+I        | toggleItalic         |
| Ctrl+'                | Cmd+'        | toggleQuote          |
| Ctrl+H                | Cmd+H        | toggleHeadingSmaller |
| Shift+Ctrl+H          | Shift+Cmd+H  | toggleHeadingBigger  |
| Ctrl+L                | Cmd+L        | toggleUnorderedList  |
| Ctrl+Alt+L            | Cmd+Alt+L    | toggleOrderedList    |
| Ctrl+K                | Cmd+K        | drawLink             |
| Ctrl+Alt+I            | Cmd+Alt+I    | drawImage            |
| Ctrl+E                | Cmd+E        | cleanBlock           |
| Ctrl+Alt+C            | Cmd+Alt+C    | toggleCodeBlock      |
| Ctrl+P                | Cmd+P        | togglePreview        |
| Ctrl+Z                | Cmd+Z        | undo                 |
| Ctrl+Y / Shift+Ctrl+Z | Shift+Cmd+Z  | redo                 |
| Ctrl+Alt+1..6         | Cmd+Alt+1..6 | toggleHeading1..6    |
| F9                    | F9           | toggleSideBySide     |
| F11                   | F11          | toggleFullscreen     |

For **`v3.0.0-beta.x`**, if layout APIs do not yet exist the implementation MAY omit these bindings or leave them dormant; they **must** call the Stable public methods once Milestone **C** ships.

Bindings for **toggleSideBySide** and **toggleFullscreen** wire to [milestone-c-layout.md](milestone-c-layout.md); they ride in **`src/keymap.ts`** so the **entire default map** lives in Milestone **B**.

Use `standardKeymap` from `@codemirror/commands` as a base (provides basic editing). Override with EasyMDE-specific bindings.

Wire `keymap.ts` into `construct()`.

The `shortcuts` option override (from `InputOptions`) is deferred to post-stable; the default map ships first.

---

## B15 — Custom toolbar configuration

**File:** `src/toolbar/build-toolbar.ts` (new)

Introduce `buildToolbar(options: Options): IToolbarButtonOptions[][]`:

1. Start from `defaultToolbar`.
2. If `options.toolbar` is `false`, return empty (no toolbar rendered).
3. If `options.toolbar` is an array, use it directly (consumers can pass `ToolbarButton` strings or full `IToolbarButtonOptions` objects).
4. If `options.hideIcons` is set, filter those buttons out of the default.
5. If `options.showIcons` is set, add those buttons to the default set.

Use this in `easymde.ts` instead of hard-wiring `defaultToolbar`.

---

## Acceptance criteria for Milestone B

- [ ] All V2 default toolbar buttons have working actions.
- [ ] `toggleLine` is tested for all selection shapes and prefix types.
- [ ] Task list toggle matches V2 semantics for `- [ ]` / `- [x]` lines.
- [ ] Guide / help opens the configured URL from the default toolbar.
- [ ] Heading cycling (smaller/bigger) works correctly through H1–H6 and wraps.
- [ ] Unordered and ordered lists apply/remove correctly on multi-line selections.
- [ ] Undo / redo work in both the toolbar and via Ctrl+Z / Ctrl+Y.
- [ ] All 14+ default keyboard shortcuts fire the correct actions.
- [ ] `toolbar: false` hides the toolbar.
- [ ] `toolbar: [...]` uses the custom button list.
- [ ] `vp check` and `vp test` pass.
