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

| Attribute     | Reactive | Description                                                                                   |
| ------------- | -------- | --------------------------------------------------------------------------------------------- |
| `value`       | yes      | Initial editor content. Mutating after connect updates the editor.                            |
| `name`        | yes      | Forwarded to the internal `<textarea>` so the editor participates in form submission.         |
| `placeholder` | no       | Read once at connect.                                                                         |
| `toolbar`     | no       | `"false"` hides the default toolbar. Custom toolbars stay JS-only via the class API.          |
| `statusbar`   | no       | `"false"` hides the status bar.                                                               |
| `theme`       | yes      | Sets `data-theme` on the host element. Themes are otherwise opt-in via your own CSS.          |
| `trim`        | no       | `"false"` opts out of initial-value trimming (passes `trimInitialValue: false` to `EasyMDE`). |

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
