# Milestone B — Toolbar Feature Parity

**Goal:** Every toolbar button in V2's default set has a working action in V3.  
Depends on Milestone A (especially the plugin lifecycle and `toggleLine` utility).

---

## Conventions established by Milestone A

**Button-action boundary.** Public toolbar action functions accept `EasyMDE` and call utilities with `editor.codemirror` (the CM6 `EditorView`). Mirrors `src/toolbar/buttons/toggle-bold.ts`. Utilities (`toggleBlock`, `toggleLine`, …) take `EditorView` and have no knowledge of `EasyMDE`.

**`IToolbarButtonOptions` shape** (frozen in [milestone-a-foundations.md](milestone-a-foundations.md) — see `src/toolbar/default-toolbar.ts`):

```ts
interface IToolbarButtonOptions {
    action?: ((editor: EasyMDE) => void) | string;
    active?:
        | boolean
        | ((editor: EasyMDE, update: ViewUpdate) => boolean)
        | ((editor: EasyMDE, update: ViewUpdate) => Promise<boolean>);
    icon: IconDefinition;
    readonly name: string;
    title: string;
}
```

`IToolbarButtonOptions.icon` accepts `ToolbarIcon = IconDefinition | LayeredIcon` (both exported from `src/toolbar/default-toolbar.ts`). A `LayeredIcon` is `{ base: IconDefinition; overlay: IconDefinition }` — a base FontAwesome glyph plus a small overlay glyph (a digit or an arrow), drawn at the icon's bottom-right corner via FontAwesome layering (see `src/toolbar/toolbar.ts`); added by **B2**. Fully custom non-FA icon surfaces (raw SVG string, consumer `HTMLElement`, resolver hook) remain deferred to [milestone-a-foundations.md](milestone-a-foundations.md) **A4-Stable**.

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

`toggleLine` and `checkLine` mirror `toggleBlock` / `checkBlock` (`src/utils/toggle-block.ts`) — same boundary discipline (utility takes `EditorView`, no `EasyMDE`). Use `src/utils/toggle-block.spec.ts` as the test template.

Tests must cover: single line cursor, multi-line selection, already-applied (idempotent remove), partially-applied (apply to remainder), and prefix collision (e.g. `##` vs `#`).

---

## B2 — Heading buttons

**Files:** `src/utils/toggle-heading.ts` + `src/utils/toggle-heading.spec.ts` (new), `src/toolbar/buttons/toggle-heading.ts` (new), `src/toolbar/default-toolbar.ts` + `src/toolbar/toolbar.ts` + `src/index.ts` (the `LayeredIcon` surface — see Conventions).

Heading text is stateful (a line at level N is _replaced_, not stacked), so headings get their own utility — `toggleLine` (B1) can't be reused. `src/utils/toggle-heading.ts` (takes `EditorView`):

- `setHeading(view, level)` — set every line touching the selection to exactly `level` (`# `…`###### `), replacing any existing heading prefix; if every touched line is already at `level`, strip the heading from all (toggle off). Single transaction.
- `cycleHeading(view, delta)` — `+1` smaller / `-1` bigger; each touched line moves through the cycle `none → 1 → … → 6 → none` (`-1` is the inverse), independently. Single transaction.
- `checkHeading(view, level)` — `true` if every line touching the selection is at exactly that level.
- `currentLineHasHeading(view)` — `true` if any line touching the selection carries a heading.

A line is a heading only if it matches `/^#{1,6} /` (one space required, ≤ 6 hashes) — so `#text` and `####### text` are level 0.

Actions (boundary per Conventions — each accepts `EasyMDE`, in `src/toolbar/buttons/toggle-heading.ts`):

- `toggleHeadingSmaller(editor: EasyMDE)` → `cycleHeading(editor.codemirror, 1)`.
- `toggleHeadingBigger(editor: EasyMDE)` → `cycleHeading(editor.codemirror, -1)`.
- `toggleHeading1..6(editor: EasyMDE)` → `setHeading(editor.codemirror, n)`. All six exist (for the B14 keymap and custom toolbars); only 1/2/3 + smaller/bigger get wired into `defaultToolbar`.

Icons: `heading-1..6` use `{ base: faHeading, overlay: fa1..fa6 }`; `heading-smaller` uses `{ base: faHeading, overlay: faArrowDown }`, `heading-bigger` uses `faArrowUp`. `Toolbar` draws each overlay at the icon's bottom-right corner — see Conventions.

Active state — `active` callbacks use the `(editor: EasyMDE, update: ViewUpdate) => boolean` signature from the Conventions block:

- Heading buttons glow when the cursor is on a line at that level.
- Heading-smaller / heading-bigger: active when any heading is present on the current line.

Wire into `defaultToolbar`: replace today's inert `heading` placeholder with `heading-1`, `heading-2`, `heading-3` appended to the bold/italic/strikethrough group, then `heading-smaller`, `heading-bigger` as their own group (group boundaries are the toolbar's separators — there is no separator-as-item).

---

## B3 — Blockquote

**File:** `src/toolbar/buttons/toggle-quote.ts` (new)

```ts
export const toggleQuote = (editor: EasyMDE): void => toggleLine(editor.codemirror, ">");
```

Boundary per Conventions: button action takes `EasyMDE`; `toggleLine` always receives `EditorView`.

Active when all selection lines start with `> `.

Update `defaultToolbar` to wire the action and active state.

---

## B4 — Unordered and ordered lists

**Files:** `src/toolbar/buttons/toggle-ul.ts`, `src/toolbar/buttons/toggle-ol.ts` (new)

`toggleUnorderedList(editor: EasyMDE)`: uses `toggleLine` with the configured `unorderedListStyle` (`*`, `-`, or `+`). Reads `editor.options.unorderedListStyle` (resolved default `"*"` — see Options addition below).

`toggleOrderedList(editor: EasyMDE)`: more complex — sequential numbering (`1.`, `2.`, …).

- When adding: number the lines starting from `1.` (or continue from the preceding list item if the selection is inside an existing list).
- When removing: strip the `N. ` prefix from all lines.

Active state for both: `checkLine` with the appropriate prefix.

**Options addition** — `unorderedListStyle` is already declared in `InputOptions` (`src/options.ts`). Add a default in `resolveOptions`:

```ts
unorderedListStyle: input.unorderedListStyle ?? "*",
```

`Options.unorderedListStyle` becomes `"*" | "-" | "+"` (non-optional in the resolved type).

---

## B5 — Clean block

**File:** `src/toolbar/buttons/clean-block.ts` (new)

`cleanBlock(editor: EasyMDE)` — boundary per Conventions. Removes all block-level formatting from the selected lines:

- Strip heading prefixes (`#`, `##`, …)
- Strip blockquote prefix (`>`)
- Strip list prefixes (`*`, `-`, `+`, `N.`)
- Strip fenced code fences if the selection is inside a fenced block

Does not touch inline formatting (bold, italic, etc.).

---

## B6 — Inline code vs fenced code block

**Files:** `src/toolbar/buttons/toggle-code.ts` (update), `src/toolbar/buttons/toggle-code-block.ts` (new)

- **Inline code** (`toggle-code.ts`): remains as-is (single back-tick wrapper). Rename internal action to `toggleInlineCode` for clarity. Signature `(editor: EasyMDE)` per Conventions.
- **Code block** (`toggle-code-block.ts`): `toggleCodeBlock(editor: EasyMDE)` — wraps selection in ` ``` ` fences.
    - Single-line with no selection → insert a fenced block template with cursor inside.
    - Multi-line selection → wrap the whole selection in fences.
    - If the selection is already inside fences → remove them.

**Default toolbar:** keep `code` (inline) in the default set. Add `code-block` as a non-default button consumers opt into via `showIcons: ["code-block"]` (V2 approach).

**Cleanup (Milestone A leftover):** Milestone A wired `code` (now `inline-code`) and `strikethrough` without an `active` callback. Add `active: (editor) => checkBlock(editor.codemirror, editor.options.blockStyles.code)` (and the strikethrough equivalent) so all inline-format buttons reflect cursor state.

---

## B7 — Horizontal rule

**File:** `src/toolbar/buttons/horizontal-rule.ts` (new)

`drawHorizontalRule(editor: EasyMDE)` — boundary per Conventions. Inserts `editor.options.insertTexts.horizontalRule` at the cursor position (or after the current selection).

**Options addition** — declare `InsertTexts` in `src/options.ts` and add it to `InputOptions`/`Options`:

```ts
export interface InsertTexts {
    horizontalRule?: string;
}

interface InputOptions {
    // …
    insertTexts?: InsertTexts;
}
```

`resolveOptions` shallow-merges defaults:

```ts
insertTexts: {
    horizontalRule: input.insertTexts?.horizontalRule ?? "\n\n---\n\n",
},
```

Subsequent B-sections extend `InsertTexts` with more fields.

---

## B8 — Table

**File:** `src/toolbar/buttons/table.ts` (new)

`drawTable(editor: EasyMDE)` — boundary per Conventions. Inserts `editor.options.insertTexts.table`. Position cursor at the first cell.

**Options addition** — extend `InsertTexts`:

```ts
export interface InsertTexts {
    horizontalRule?: string;
    table?: string;
}
```

Default in `resolveOptions`:

```ts
table: input.insertTexts?.table ??
    "| Column 1 | Column 2 | Column 3 |\n" +
    "| -------- | -------- | -------- |\n" +
    "| Text     | Text     | Text     |\n",
```

---

## B9 — Link insertion

**File:** `src/toolbar/buttons/draw-link.ts` (new)

`drawLink(editor: EasyMDE)` — boundary per Conventions.

1. If `editor.options.promptURLs` is true (or no selection), open `window.prompt` (using `editor.options.promptTexts.link` as the dialog message) for the URL.
2. Wrap the selection (or placeholder text) in `[text](url)` syntax using `editor.options.insertTexts.link` as the `[prefix, suffix]` template.

**Options addition** — extend `InsertTexts`:

```ts
export interface InsertTexts {
    horizontalRule?: string;
    table?: string;
    link?: [prefix: string, suffix: string];
}
```

Default in `resolveOptions`:

```ts
link: input.insertTexts?.link ?? ["[", "](https://)"],
```

---

## B10 — Image insertion

**File:** `src/toolbar/buttons/draw-image.ts` (new)

`drawImage(editor: EasyMDE)` — boundary per Conventions. Same flow as link insertion using `![alt](url)` syntax. `editor.options.promptTexts.image` for the dialog message. `editor.options.insertTexts.image` as the `[prefix, suffix]` template.

**Options addition** — extend `InsertTexts`:

```ts
export interface InsertTexts {
    horizontalRule?: string;
    table?: string;
    link?: [prefix: string, suffix: string];
    image?: [prefix: string, suffix: string];
}
```

Default in `resolveOptions`:

```ts
image: input.insertTexts?.image ?? ["![](", ")"],
```

Image upload (paste / drop / file dialog) is a separate feature tracked in Milestone E.

---

## B11 — Task list (checkbox)

**Files:** `src/toolbar/buttons/toggle-task.ts` (new), extend `src/utils/toggle-line.ts` or add list-specific helpers as needed

`toggleTaskList(editor: EasyMDE)` — boundary per Conventions. GitHub-style task list items: `- [ ]` (unchecked) and `- [x]` or `- [X]` (checked).

- Toggle adds or removes the checkbox prefix on every line intersecting the selection (same line-surgery model as `toggleLine`).
- Typing rules should align with V2 behaviour where possible; see [original-analysis.md](original-analysis.md) (line-prefix / task list gap).
- Active state: all intersected lines are task-list lines with a consistent checked/unchecked state when applicable.

Wire into `defaultToolbar` (V2 includes a task-list control in its default set).

**Tests:** mirror `toggle-line` coverage (single line, multi-line, idempotent toggle, mixed list/task lines).

---

## B12 — Markdown guide / help

**File:** `src/toolbar/buttons/open-guide.ts` (new), `src/options.ts` (option wiring)

- The default toolbar's **guide** / **help** button opens Markdown syntax documentation in a new browser tab — `target="_blank"` + `rel="noopener"`.
- `openGuide(editor: EasyMDE)` — boundary per Conventions. Reads `editor.options.toolbarGuideUrl`.
- Replace the hard-coded `"https://simplemde.com/markdown-guide"` string at `src/toolbar/default-toolbar.ts:97` with the new function so the URL flows from `Options`.
- If `toolbarGuideUrl` is empty, hide the button or no-op per `toolbar` builder rules.

**Options addition** — add to `InputOptions`:

```ts
toolbarGuideUrl?: string;
```

`resolveOptions` default:

```ts
toolbarGuideUrl: input.toolbarGuideUrl ?? "https://www.markdownguide.org/cheat-sheet/",
```

No V2-alias — V3's `InputOptions` never carried a guide-URL field.

**Acceptance:** the default toolbar control that maps to V2's `guide` / `guide-link` id performs a deterministic open action against the resolved `toolbarGuideUrl`.

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

**Coexistence with the existing Enter binding:** Milestone A registered a single `Prec.low(keymap.of([{ key: "Enter", … }]))` in `src/easymde.ts:148–158`. The new EasyMDE shortcut map registers at **`Prec.high`** so it overrides defaults without colliding with the low-precedence Enter handler — both stay.

**`Ctrl/Cmd+P`** invokes the existing public `editor.togglePreview()` method shipped in [milestone-a-foundations.md](milestone-a-foundations.md) **A5** — no new preview wiring needed.

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

**Options addition** — add to `InputOptions`:

```ts
hideIcons?: ToolbarButton[];
showIcons?: ToolbarButton[];
```

No `resolveOptions` default needed — both are optional and consumed only by `buildToolbar`.

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
- [ ] `Options` resolves `insertTexts`, `toolbarGuideUrl`, and `unorderedListStyle` to documented defaults.
- [ ] All toolbar action functions accept `EasyMDE`; utilities (`toggleLine`, `toggleBlock`, `checkLine`, `checkHeading`, …) accept `EditorView`.
- [ ] `inline-code` and `strikethrough` buttons expose `active` callbacks.
- [ ] `vp check` and `vp test` pass.
