# EasyMDE

Markdown editor built on CodeMirror 6. Ships as a class API and as the `<easy-markdown-editor>` custom element.

## Install

```bash
npm install easymde
```

```ts
import "easymde/style.css";
```

## Class API

```ts
import { EasyMDE } from "easymde";

const textarea = document.querySelector("textarea");
const editor = new EasyMDE({ element: textarea });

editor.value = "# Hello";
console.log(editor.value);
```

`new EasyMDE(...)` is synchronous — the editor is fully constructed before the constructor returns.

### Options

| Option                              | Type                                        | Default                    | Description                                                                                                   |
| ----------------------------------- | ------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `element`                           | `HTMLTextAreaElement`                       | required                   | Textarea the editor wraps.                                                                                    |
| `toolbar`                           | `boolean \| Array<ToolbarItem>`             | `true`                     | `true` shows the default toolbar; `false` hides it; an array supplies a custom toolbar.                       |
| `statusbar`                         | `boolean`                                   | `true`                     | Show the status bar.                                                                                          |
| `forceSync`                         | `boolean`                                   | `false`                    | Mirror editor content to the textarea on every change. Off by default; auto-sync runs on form submit instead. |
| `trimInitialValue`                  | `boolean`                                   | `true`                     | Trim leading/trailing whitespace from the textarea value at construct time.                                   |
| `blockStyles`                       | `{ bold?, italic?, strikethrough?, code? }` | `{ "**", "*", "~~", "`" }` | Markers used by the bold/italic/strikethrough/code toolbar buttons.                                           |
| `previewRender`                     | `(markdown, element) => string`             | undefined                  | Override the Markdown→HTML pipeline used by the preview pane.                                                 |
| `renderingConfig.markedOptions`     | `MarkedOptions`                             | undefined                  | Forwarded to the per-instance Marked parser.                                                                  |
| `renderingConfig.sanitizerFunction` | `(html) => string`                          | DOMPurify (when installed) | Final sanitizer applied before the preview pane's HTML is assigned. Never bypassed.                           |
| `theme`                             | `string`                                    | undefined                  | Applies a named theme by setting `data-easymde-theme` on the container. See [Theming](#theming).              |
| `placeholder`                       | `string`                                    | undefined                  | Placeholder text shown while the editor is empty.                                                             |

### Properties and methods

| Member                     | Description                                                                                           |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| `editor.value`             | Getter/setter for the current Markdown content.                                                       |
| `editor.element`           | The wrapped `<textarea>`.                                                                             |
| `editor.container`         | The editor's container `<div>` (toolbar + editor + preview + statusbar).                              |
| `editor.codemirror`        | The underlying `EditorView` (CodeMirror 6).                                                           |
| `editor.options`           | The fully-resolved options object (read-only).                                                        |
| `editor.isRendered`        | `true` after `construct()`, `false` after `destruct()`.                                               |
| `editor.focus()`           | Move focus into the editor.                                                                           |
| `editor.togglePreview()`   | Switch between edit and preview modes.                                                                |
| `editor.isPreviewActive()` | Returns `true` while the preview pane is shown.                                                       |
| `editor.addPlugin(plugin)` | Register and mount a plugin (see [Plugins](#plugins)).                                                |
| `editor.destruct()`        | Tear down the editor: unmounts plugins (reverse order), removes form listener, restores the textarea. |

## `<easy-markdown-editor>` web component

The custom element is registered automatically when `easymde` is imported.

```html
<form>
    <easy-markdown-editor name="comment">**Initial** content</easy-markdown-editor>
    <button type="submit">Post</button>
</form>
```

On `connectedCallback` the component finds a child `<textarea>` (or auto-creates one), constructs `EasyMDE`, and forwards the `name` attribute to the textarea so the form posts the content under that field name. On `disconnectedCallback` it calls `destruct()`.

### Attributes

| Attribute     | Reactive | Description                                                                                             |
| ------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `value`       | yes      | Initial editor content. Mutating after connect updates the editor.                                      |
| `name`        | yes      | Forwarded to the internal `<textarea>` so the editor participates in form submission.                   |
| `placeholder` | no       | Read once at connect.                                                                                   |
| `toolbar`     | no       | `"false"` hides the default toolbar. Custom toolbars stay JS-only via the class API.                    |
| `statusbar`   | no       | `"false"` hides the status bar.                                                                         |
| `theme`       | yes      | Applies a named theme by setting `data-easymde-theme` on the editor container. See [Theming](#theming). |
| `trim`        | no       | `"false"` opts out of initial-value trimming (passes `trimInitialValue: false` to `EasyMDE`).           |

### Initial content

Precedence (highest first):

1. `value` attribute on the host.
2. Content of a child `<textarea>` (if present).
3. Text nodes inside the host (e.g. `<easy-markdown-editor>hello</easy-markdown-editor>`).

All three sources go through `trimInitialValue` unless `trim="false"`.

### JS property

`element.value` mirrors `editor.value` after connect. Setting `element.value` before the element connects caches the value into the `value` attribute, which is then applied at construct.

## Form integration

A submit listener on the nearest ancestor `<form>` writes the current editor content to the textarea before submission. Pass `forceSync: true` to mirror on every change instead. The web component wires this for the internal textarea automatically.

## Theming

EasyMDE ships a light theme with an automatic dark variant (via `prefers-color-scheme`), so importing the stylesheet is all it takes:

```ts
import "easymde/style.css";
```

Every colour is a CSS custom property declared on the editor container (`.easymde-container`), so you can retheme entirely through variables without overriding component selectors.

### Tokens

| Token                              | Purpose                      | Light             | Dark                    |
| ---------------------------------- | ---------------------------- | ----------------- | ----------------------- |
| `--easymde-bg`                     | Editor background            | `#ffffff`         | `#1e1e1e`               |
| `--easymde-text`                   | Editor text and caret        | `#333333`         | `#d4d4d4`               |
| `--easymde-border-color`           | Borders and separators       | `#d1d1d1`         | `#5a5a5a`               |
| `--easymde-selection-bg`           | Text selection               | `#d7d4f0`         | `#264f78`               |
| `--easymde-placeholder`            | Placeholder text             | `#525252`         | `#b5b5b5`               |
| `--easymde-toolbar-bg`             | Toolbar background           | `#f9f9f9`         | `#252526`               |
| `--easymde-toolbar-text`           | Toolbar icon / label colour  | `#333333`         | `#d4d4d4`               |
| `--easymde-toolbar-hover`          | Button hover background      | `#e8e8e8`         | `#2d2d2d`               |
| `--easymde-toolbar-active`         | Button pressed background    | `#d8d8d8`         | `#3a3a3a`               |
| `--easymde-toolbar-enabled`        | Active toggle background     | `#e0e0e0`         | `#37373d`               |
| `--easymde-toolbar-enabled-border` | Active toggle border         | `#7a7a7a`         | `#888888`               |
| `--easymde-preview-bg`             | Preview background           | `#ffffff`         | `#1e1e1e`               |
| `--easymde-preview-text`           | Preview text                 | `#333333`         | `#d4d4d4`               |
| `--easymde-preview-link`           | Preview link colour          | `#0645ad`         | `#8ab4f8`               |
| `--easymde-code-bg`                | Inline/block code background | `rgba(0,0,0,.05)` | `rgba(255,255,255,.08)` |
| `--easymde-statusbar-text`         | Status bar text              | `#525252`         | `#b5b5b5`               |

Editor Markdown syntax colours use `--easymde-syntax-{url,mark,keyword,string,literal,escape,variable,type,comment,invalid}` (each with its own light/dark value).

### Custom themes

Give the editor a theme name — the `theme` option (class API) or the `theme` attribute (web component). It is written to the container as `data-easymde-theme="<name>"`; target that selector in your own CSS and override any tokens you like:

```ts
new EasyMDE({ element: textarea, theme: "solarized" });
```

```html
<easy-markdown-editor theme="solarized">…</easy-markdown-editor>
```

```css
.easymde-container[data-easymde-theme="solarized"] {
    --easymde-bg: #fdf6e3;
    --easymde-text: #073642;
    --easymde-toolbar-bg: #eee8d5;
    /* …only the tokens you want to change… */
}
```

The bundle ships no named themes beyond the light/dark default — `theme` is purely a hook for your CSS. A named theme is also **self-contained**: it starts from the light defaults and does _not_ inherit the built-in dark values, so tokens you leave unset stay light even under a dark OS. Add your own dark handling inside the theme if you want one:

```css
@media (prefers-color-scheme: dark) {
    .easymde-container[data-easymde-theme="solarized"] {
        --easymde-bg: #002b36;
        --easymde-text: #839496;
        /* … */
    }
}
```

### Accessibility

The bundled light and dark themes meet WCAG AAA (7:1) contrast for all text and icons, and ≥3:1 for borders and state indicators such as the active-toggle affordance (WCAG 1.4.11). Windows High Contrast / `forced-colors` mode is supported. Keep those ratios in mind when overriding tokens.

## Custom toolbar icons (Font Awesome)

The default toolbar's icons are registered automatically. For custom toolbar buttons that use Font Awesome icons, register the icon definitions yourself:

```ts
import { registerIcons } from "easymde";
import { faStar } from "@fortawesome/free-solid-svg-icons";

registerIcons(faStar);
```

The web component does **not** auto-register custom icons; the host page must call `registerIcons(...)` for any glyph beyond the trimmed default set.

## Plugins

```ts
interface IEasyMDEPlugin {
    readonly element: HTMLElement;
    mount(): void;
    unmount(): void;
}
```

`addPlugin(plugin)` calls `plugin.mount()`; `destruct()` calls `plugin.unmount()` in reverse registration order. The default toolbar, preview pane, and status bar are themselves plugins.

## Development

```bash
vp install   # install dependencies
vp test      # run unit tests
vp check     # format + lint + type-check
vp pack      # build the library
```
