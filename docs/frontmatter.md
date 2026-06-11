# Frontmatter Processing

EasyMDE supports optional YAML/TOML frontmatter detection and rendering. When enabled, frontmatter blocks at the top of a document are rendered as key-value tables in the preview, visually distinguished in the editor, excluded from formatting actions, and excluded from word/line counts.

## Table of Contents

- [Overview](#overview)
- [Options](#options)
- [Frontmatter Detection](#frontmatter-detection)
- [Preview Rendering](#preview-rendering)
- [Editor Styling](#editor-styling)
- [Formatting Guard](#formatting-guard)
- [Status Bar](#status-bar)
- [YAML Syntax Support](#yaml-syntax-support)
- [API Reference](#api-reference)
- [Testing](#testing)

---

## Overview

Frontmatter is a metadata block at the top of a Markdown document, commonly used by static site generators (Jekyll, Hugo, etc.). EasyMDE supports both YAML (`---`) and TOML (`+++`) delimiters.

**Example document with frontmatter:**

```markdown
---
title: My Document
author: Jane Doe
description: |
  This is a multi-line
  description value.
# This is a comment
---

# Heading

Body text here.
```

**In the editor:** The three `---` delimiter lines and the metadata lines between them are styled in gray italic text with GFM heading/hr formatting suppressed.

**In the preview:** The frontmatter is rendered as an HTML `<table>` above the body content. Delimiter lines and comment lines are excluded from the table.

---

## Options

Frontmatter processing is controlled by two options in the `EasyMDE.Options` configuration:

### `enableFrontmatter`

| | |
|---|---|
| **Type** | `boolean` |
| **Default** | `false` |
| **Required** | Yes (set to `true` to activate frontmatter processing) |

Enables frontmatter detection, rendering, editor styling, formatting exclusion, and status bar adjustments.

```js
const editor = new EasyMDE({
    enableFrontmatter: true
});
```

### `previewIgnoreFrontmatter`

| | |
|---|---|
| **Type** | `boolean` |
| **Default** | `false` |
| **Required** | No |

When `true`, the frontmatter block is still detected and stripped from the body text (so it doesn't leak into the markdown rendering), but the key-value `<table>` is **not** rendered in the preview. All other frontmatter behavior (editor styling, formatting guard, status bar exclusion) remains active.

This option has no effect when `enableFrontmatter` is `false`.

```js
const editor = new EasyMDE({
    enableFrontmatter: true,
    previewIgnoreFrontmatter: true
});
```

---

## Frontmatter Detection

Detection is handled by `findFrontmatterEnd(text)`, which returns the line index after the closing delimiter, or `-1` if no valid frontmatter block exists.

**Rules:**

1. The first line of the document must be exactly `---` or `+++` (whitespace-trimmed).
2. A matching closing delimiter must appear later in the document. Without one, no frontmatter is detected.
3. The delimiter type must match: `---` opens and closes with `---`; `+++` opens and closes with `+++`.

```js
// Returns the line index after the closing delimiter (0-indexed)
findFrontmatterEnd('---\ntitle: Hello\n---\n\nBody text'); // Returns 3
findFrontmatterEnd('---\ntitle: Hello\n\nBody text');       // Returns -1 (no closing ---)
findFrontmatterEnd('# Heading\n\nBody text');               // Returns -1 (no opening ---)
```

---

## Preview Rendering

When frontmatter is enabled and `previewIgnoreFrontmatter` is `false`, the `markdown()` method in `EasyMDE.prototype.markdown()` processes frontmatter before passing text to `marked.parse()`:

1. **Detect** the frontmatter block via `findFrontmatterEnd()`.
2. **Render** the frontmatter as an HTML `<table>` via `renderFrontmatterTable()`.
3. **Strip** the frontmatter lines from the text passed to `marked.parse()`.
4. **Prepend** the table HTML to the rendered markdown output.

The resulting preview HTML structure:

```html
<table>
    <tr><td>title</td><td>My Document</td></tr>
    <tr><td>author</td><td>Jane Doe</td></tr>
</table>
<h1>Heading</h1>
<p>Body text here.</p>
```

---

## Editor Styling

When `enableFrontmatter` is enabled, frontmatter lines receive the `cm-frontmatter` CSS class via CodeMirror's `addLineClass()` method. This is managed by `EasyMDE.prototype.updateFrontmatterLineClasses()`.

The class is applied to every line from line 0 through the closing delimiter line (exclusive of the body content). It is re-applied on every `change` event and after initial render.

**CSS rules (`src/css/easymde.css`):**

```css
/* Frontmatter line styling */
.cm-frontmatter {
    color: #777;
    font-style: italic;
}

/* Suppress GFM heading/hr styling inside frontmatter lines */
.cm-frontmatter .cm-header {
    font-size: inherit;
    font-weight: normal;
    color: inherit;
}
.cm-frontmatter .cm-hr {
    color: inherit;
    font-weight: normal;
}
.cm-frontmatter .cm-formatting {
    color: inherit;
    font-weight: normal;
}
```

The `.cm-header` override prevents CodeMirror's GFM mode from rendering frontmatter content (e.g., `# comment` or text before `---`) as large headings. The `.cm-hr` and `.cm-formatting` overrides prevent horizontal rule and formatting token styling from activating within frontmatter.

---

## Formatting Guard

All formatting action functions guard against cursor positions inside frontmatter. The guard checks whether the cursor's starting line falls within the frontmatter block:

```js
if (editor.codemirror && isLineInFrontmatter(editor.codemirror, editor.codemirror.getCursor('start').line)) return;
```

**Guarded functions (21 total):**

| Function | Purpose |
|----------|---------|
| `toggleBold` | Bold formatting |
| `toggleItalic` | Italic formatting |
| `toggleStrikethrough` | Strikethrough formatting |
| `toggleCodeBlock` | Code block formatting |
| `toggleBlockquote` | Blockquote formatting |
| `toggleHeadingSmaller` | Decrease heading level |
| `toggleHeadingBigger` | Increase heading level |
| `toggleHeading1`–`toggleHeading6` | Set heading level 1–6 |
| `toggleUnorderedList` | Unordered list |
| `toggleOrderedList` | Ordered list |
| `toggleCheckList` | Checklist |
| `cleanBlock` | Clean block formatting |
| `drawLink` | Insert link |
| `drawImage` | Insert image |
| `drawTable` | Insert table |
| `drawHorizontalRule` | Insert horizontal rule |

When the cursor is on a frontmatter line, these functions return immediately without modifying the document.

---

## Status Bar

When `enableFrontmatter` is enabled, the status bar's word and line counts exclude frontmatter lines:

- **Word count:** Frontmatter lines are stripped from the text before `wordCount()` is called.
- **Line count:** `fmEnd` (the number of frontmatter lines) is subtracted from `cm.lineCount()`.

This applies to both the initial value and the `onUpdate` handler, so counts stay accurate as the user types.

---

## YAML Syntax Support

`renderFrontmatterTable()` parses frontmatter lines into a 2-column `<table>` (key / value). It supports:

### Standard key-value pairs

Lines matching the pattern `key: value` are rendered as table rows:

```yaml
title: My Document
author: Jane Doe
```

Renders as:

| Key | Value |
|-----|-------|
| title | My Document |
| author | Jane Doe |

### Comments

Lines where `#` is the first non-whitespace character are treated as comments and excluded from the table:

```yaml
# This is a comment
title: My Doc
```

Only `title: My Doc` appears in the rendered table.

### Multi-line values

A value of `|` (literal block scalar) or `>` (folded block scalar) indicates a multi-line value. Subsequent non-blank lines are collected until a blank line or the closing delimiter:

```yaml
description: |
  First line
  Second line
```

Renders as a single table row with the value `First line<br>Second line`.

### Indented keys

Leading whitespace on a key is converted to `&nbsp;` characters (2 per indent level) in the rendered table:

```yaml
title: Test
  child: value1
```

The `child` key renders as `&nbsp;&nbsp;child` in the table.

### Non-matching lines

Lines that don't match the `key: value` pattern and aren't comments are silently ignored (not rendered in the table).

---

## API Reference

### `findFrontmatterEnd(text)`

Returns the line index after the closing frontmatter delimiter, or `-1` if no valid frontmatter block is found.

| Parameter | Type | Description |
|-----------|------|-------------|
| `text` | `string` | Full document text |

**Returns:** `number` — Line index after closing delimiter, or `-1`.

---

### `renderFrontmatterTable(text)`

Parses frontmatter lines and returns an HTML `<table>` string. Returns empty string if no frontmatter is found or no valid key-value pairs exist.

| Parameter | Type | Description |
|-----------|------|-------------|
| `text` | `string` | Full document text |

**Returns:** `string` — HTML table markup, or `''`.

---

### `isLineInFrontmatter(cm, line)`

Checks whether a given 0-indexed line number falls within the frontmatter block.

| Parameter | Type | Description |
|-----------|------|-------------|
| `cm` | `CodeMirror.Editor` | The CodeMirror instance |
| `line` | `number` | 0-indexed line number |

**Returns:** `boolean` — `true` if the line is inside the frontmatter block.

---

### `EasyMDE.prototype.updateFrontmatterLineClasses()`

Clears `cm-frontmatter` from all lines, then re-applies it to frontmatter lines. Called automatically on `change` events and after initial render.

**Parameters:** None.

---

### `escapeHtml(s)`

Escapes `&`, `<`, `>`, and `"` characters to their HTML entity equivalents. Used internally by `renderFrontmatterTable()`.

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` | Raw string |

**Returns:** `string` — HTML-escaped string.

---

## Testing

Frontmatter is tested by a dedicated Cypress E2E test suite in `cypress/e2e/7-frontmatter/`. The suite contains 14 test cases:

| # | Test | What it verifies |
|---|------|-----------------|
| 1 | Simple frontmatter with single key | Table renders with correct cells; no spurious heading; body text renders |
| 2 | No heading styling in editor | `.cm-frontmatter` class applied; `.cm-header` still works for real headings; font size is normal |
| 3 | Frontmatter rendered as table | Multiple key-value pairs render correctly; body content also renders |
| 4 | Delimiters not shown in preview | `---` lines don't appear as `<code>---</code>` in preview HTML |
| 5 | Comment lines ignored | Lines starting with `#` are excluded from the table |
| 6 | Multi-line values with `\|` indicator | Block scalar `\|` collects multiple lines into one table row |
| 7 | Indented keys with `&nbsp;` | Indented keys produce `&nbsp;&nbsp;` in rendered HTML |
| 8 | Non-key:value lines ignored | Random text without a colon is not rendered as a table row |
| 9 | Word count excludes frontmatter | Word count reflects only body text |
| 10 | Line count excludes frontmatter | Line count reflects only body lines |
| 11 | Formatting blocked in frontmatter | Bold button has no effect when cursor is on a frontmatter line |
| 12 | `+++` TOML delimiter variant | `+++` works identically to `---` |
| 13 | No closing delimiter | Without closing `---`, no table is rendered; content renders as normal markdown |
| 14 | CSS class applied | `.cm-frontmatter` elements exist after typing frontmatter |

**Test page:** `cypress/e2e/7-frontmatter/index.html` — Creates an editor instance with `enableFrontmatter: true`.

**Run tests:**

```bash
npm run e2e          # Full suite (build + lint + all 61 tests)
npm run cypress:run  # Cypress only (requires prior build)
```
