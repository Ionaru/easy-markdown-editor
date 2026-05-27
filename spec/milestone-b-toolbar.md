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

**Spec basis.** CommonMark [§4.2 ATX headings](https://spec.commonmark.org/0.31.2/#atx-headings), [§5.1 block quotes](https://spec.commonmark.org/0.31.2/#block-quotes), and [§5.2 list items](https://spec.commonmark.org/0.31.2/#list-items) admit a wider whitespace set after the marker than `toggleLine` recognises — tab as well as space for headings/lists, and a bare `>` (no following space) for block quotes. `toggleLine` requires `prefix` + ASCII space because the toolbar always emits that form; tab and bare-`>` variants are intentionally not detected on toggle-off. Round-trip cleanliness wins over CommonMark-completeness here.

---

## B2 — Heading buttons

**Files:** `src/utils/toggle-heading.ts` + `src/utils/toggle-heading.spec.ts` (new), `src/toolbar/buttons/toggle-heading.ts` (new), `src/toolbar/default-toolbar.ts` + `src/toolbar/toolbar.ts` + `src/index.ts` (the `LayeredIcon` surface — see Conventions).

Heading text is stateful (a line at level N is _replaced_, not stacked), so headings get their own utility — `toggleLine` (B1) can't be reused. `src/utils/toggle-heading.ts` (takes `EditorView`):

- `setHeading(view, level)` — set every line touching the selection to exactly `level` (`# `…`###### `), replacing any existing heading prefix; if every touched line is already at `level`, strip the heading from all (toggle off). Single transaction.
- `cycleHeading(view, delta)` — `+1` smaller / `-1` bigger; each touched line moves through the cycle `none → 1 → … → 6 → none` (`-1` is the inverse), independently. Single transaction.
- `checkHeading(view, level)` — `true` if every line touching the selection is at exactly that level.
- `currentLineHasHeading(view)` — `true` if any line touching the selection carries a heading.

A line is a heading only if it matches `/^#{1,6} /` (one space required, ≤ 6 hashes) — so `#text` and `####### text` are level 0.

**Spec basis.** CommonMark [§4.2](https://spec.commonmark.org/0.31.2/#atx-headings) admits `#…` "followed by spaces or tabs, or by the end of line". V3 narrows to a single ASCII space for round-trip stability with what `setHeading` emits; tab-after-hash and hash-at-EOL are intentionally not detected.

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

**Spec basis.** CommonMark [§5.1](https://spec.commonmark.org/0.31.2/#block-quotes) defines a block-quote marker as "(a) the character `>` together with a following space of indentation, or (b) a single character `>` not followed by a space of indentation." V3 requires `> ` (space form) for both emission and detection; bare `>foo` is valid CommonMark but is not round-tripped by this toolbar.

---

## B4 — Unordered and ordered lists

**Files:** `src/toolbar/buttons/toggle-ul.ts`, `src/toolbar/buttons/toggle-ol.ts` (new)

`toggleUnorderedList(editor: EasyMDE)`: uses `toggleLine` with the configured `unorderedListStyle` (`*`, `-`, or `+`). Reads `editor.options.unorderedListStyle` (resolved default `"*"` — see Options addition below).

`toggleOrderedList(editor: EasyMDE)`: more complex — sequential numbering (`1.`, `2.`, …, or `1)`, `2)`, … when `orderedListDelimiter` is `)`).

- When adding: number the lines starting from `1` (or continue from the preceding list item if the selection is inside an existing list).
- When removing: strip the `N. ` / `N) ` prefix from all lines.
- Detection regex: `^(\d{1,9})([.)]) ` — 1–9 digits per CommonMark §5.2, either delimiter.
- "Inside an existing list" means **the immediately preceding line carries an ordered marker (either delimiter)**; blank-line-separated runs start a fresh `1` per CommonMark §5.4.

Active state for both: `checkLine` (or `checkList` for the unified utility) with the appropriate prefix; the OL active check returns `true` for either delimiter.

**Options addition** — `unorderedListStyle` is already declared in `InputOptions` (`src/options.ts`). Add defaults in `resolveOptions`:

```ts
unorderedListStyle: input.unorderedListStyle ?? "*",
orderedListDelimiter: input.orderedListDelimiter ?? ".",
```

`Options.unorderedListStyle` becomes `"*" | "-" | "+"` (non-optional in the resolved type). `Options.orderedListDelimiter` becomes `"." | ")"` (non-optional in the resolved type).

**Spec basis.** CommonMark [§5.2](https://spec.commonmark.org/0.31.2/#list-items) defines a bullet marker as `-`, `+`, or `*`, and an ordered marker as "a sequence of 1–9 arabic digits, followed by either a `.` character or a `)` character" — the 1–9 cap exists because larger numbers risk integer overflow in some browsers. CommonMark [§5.4](https://spec.commonmark.org/0.31.2/#lists) states that "Changing the bullet or ordered list delimiter starts a new list" — `1. foo` followed by `2) bar` is therefore two separate lists, which is why the continuation rule above looks only one line back and at the exact marker shape.

---

## B5 — Clean block

**Files:** `src/toolbar/buttons/clean-block.ts` (new), `src/utils/clean-block.ts` (new), `src/utils/fences.ts` (new — shared with B6)

`cleanBlock(editor: EasyMDE)` — boundary per Conventions, delegates to `cleanBlock(editor: EditorView)` in `src/utils/clean-block.ts`. Strips all block-level formatting from every line intersecting the selection in a single transaction:

- Strip ATX heading prefixes — `#{1,6}` followed by a space, per CommonMark [§4.2](https://spec.commonmark.org/0.31.2/#atx-headings)
- Strip blockquote prefix (`> `) per CommonMark [§5.1](https://spec.commonmark.org/0.31.2/#block-quotes)
- Strip list prefixes (`*`, `-`, `+`, `N. `, **`N) `**) — both CommonMark ordered-list delimiters per [§5.2](https://spec.commonmark.org/0.31.2/#list-items)
- Strip the GFM [§5.3](https://github.github.com/gfm/#task-list-items-extension-) task-list marker **together with** its host list marker — `- [ ] foo` becomes `foo`, not `- foo`. Destructive semantics override `toggleList`'s host-preserving checklist-off behavior because cleanBlock is not a toggle.
- Strip the opening and closing fences of any fenced-code block any selected line falls inside, per CommonMark [§4.5](https://spec.commonmark.org/0.31.2/#fenced-code-blocks). Lines inside a fence are treated as literal content — block-prefix-shaped characters on those lines (e.g. a `>` inside a code block) are NOT stripped.

Does not touch inline formatting (bold, italic, strikethrough, inline code) — those are character-level, not block-level.

**Shared fence utility.** `src/utils/fences.ts` exports `findFenceBlocks(state): FenceBlock[]` (one pass over the document, returns every block in order) and `blockContaining(blocks, lineNumber): FenceBlock | null` (linear lookup against a previously-computed block list). The scan toggles fence state per CommonMark §4.5: closing fence must use the same character — back-tick or tilde — and be at least as long as the opener; opening fence may be indented up to three spaces; an unterminated opener emits a block with `close: null`. Splitting the scan from the membership query keeps the per-button cost at O(L + S) for L document lines and S selected lines, instead of the O(L·S) shape a per-line containment query would have. B6 reuses both exports to detect "selection already inside a fence" for `toggleCodeBlock`.

**Detection narrowness.** Heading prefix detection caps at `#{1,6}` (CommonMark requires 1–6 hashes; seven or more is not a heading). The checklist regex accepts the GFM checkbox states `[ ]`, `[x]`, and `[X]` only — other characters inside the brackets are not GFM task markers. Setext headings (`====` / `----` underlines, [§4.3](https://spec.commonmark.org/0.31.2/#setext-headings)) and indented code blocks ([§4.4](https://spec.commonmark.org/0.31.2/#indented-code-blocks)) are out of scope: neither carries a single-line prefix to strip.

---

## B6 — Inline code vs fenced code block

**Files:** `src/toolbar/buttons/toggle-code.ts` (update), `src/toolbar/buttons/toggle-code-block.ts` (new)

- **Inline code** (`toggle-code.ts`): remains as-is (single back-tick wrapper). Rename internal action to `toggleInlineCode` for clarity. Signature `(editor: EasyMDE)` per Conventions.
- **Code block** (`toggle-code-block.ts`): `toggleCodeBlock(editor: EasyMDE)` — wraps selection in ` ``` ` fences.
    - Single-line with no selection → insert a fenced block template with cursor inside.
    - Multi-line selection → wrap the whole selection in fences.
    - If the selection is already inside fences → remove them.

**Default toolbar:** Neither button is in the default set. Add `code` and `code-block` as a non-default button consumers opt into via `showIcons: ["code-block"]` (V2 approach).

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

**Spec basis.** CommonMark [§4.1](https://spec.commonmark.org/0.31.2/#thematic-breaks) defines a thematic break as three or more matching `-`, `_`, or `*` characters on a line of their own. The leading `\n\n` in the default `"\n\n---\n\n"` template is **mandatory**: a bare `---` placed directly after a paragraph line is parsed as a Setext H2 underline ([§4.3](https://spec.commonmark.org/0.31.2/#setext-headings)) instead of a thematic break, which would silently promote the preceding line to a heading.

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
    "\n\n| Column 1 | Column 2 | Column 3 |\n" +
    "| -------- | -------- | -------- |\n" +
    "| Text     | Text     | Text     |\n\n",
```

**Spec basis.** Tables are a GFM extension, not CommonMark. [GFM §4.10](https://github.github.com/gfm/#tables-extension-) requires a header row plus a delimiter row of `-` cells (optionally bookended with `:` for alignment), and breaks the table at the first blank line. This feature is therefore **GFM-only**: `renderingConfig.markedOptions.gfm` must be `true` (Marked's default) for the rendered preview to match the inserted source. The template is wrapped in `\n\n` for the same reason as B7 — to guarantee block context regardless of where the cursor sits.

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

**Detection regex.** `^(?:[*\-+]|\d{1,9}[.)]) \[[\sxX]\] ` — matches a task marker hosted on **any** list-item kind (bullet `*`/`-`/`+` or ordered `N.`/`N)`), with any whitespace character (space or tab) inside the brackets.

**Emission.** New items always emit `- [ ] ` (the canonical bullet + unchecked form). Pre-existing host markers are preserved on swap (e.g. `1. foo` → toggle checklist → `1. [ ] foo` would be valid GFM, but the current swap rewrites the whole marker to `- [ ] foo` — see open question below).

**Toggle-off semantics.** Per [GFM §5.3](https://github.github.com/gfm/#task-list-items-extension-), a task list item _is_ a list item — toggling the task off should strip only the `[?] ` portion, leaving the host list marker behind. So `- [ ] foo` → `- foo`, `1. [x] foo` → `1. foo`, `* [X] foo` → `* foo`. Removing the bullet too requires a second click on the matching UL/OL button.

**Tests:** mirror `toggle-line` coverage (single line, multi-line, idempotent toggle, mixed list/task lines), plus the cross-host detection cases above.

**Spec basis.** [GFM §5.3](https://github.github.com/gfm/#task-list-items-extension-): "A task list item marker consists of an optional number of spaces, a left bracket (`[`), either a whitespace character or the letter `x` in either lowercase or uppercase, and then a right bracket (`]`)." GFM example 280 nests task items inside both bullet and ordered lists, which is why detection accepts any list-marker host — not only `- `.

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
