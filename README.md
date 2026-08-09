# EasyMDE

Markdown editor built on CodeMirror 6. Ships as a class API and as the `<easy-markdown-editor>` custom element.

## Quick start

```bash
npm install easymde
```

```ts
import { EasyMDE } from "easymde";
import "easymde/style.css";

const textarea = document.querySelector<HTMLTextAreaElement>("textarea");
if (!textarea) throw new Error("No <textarea> found");

const editor = new EasyMDE({ element: textarea });

editor.value = "# Hello";
console.log(editor.value);

editor.togglePreview(); // switch to the rendered preview and back
```

`new EasyMDE(...)` is synchronous: the editor is fully constructed before the constructor returns. The wrapped `<textarea>` is hidden and its content becomes the initial document.

Prefer HTML? Use the custom element, registered automatically on import:

```html
<easy-markdown-editor name="comment">**Initial** content</easy-markdown-editor>
```

See [Web component](#web-component) for the attribute reference.

## Options reference

Every option is optional except `element`. Names and defaults below match the source of truth in `src/options.ts`.

### Core

| Option             | Type                  | Default     | Description                                                                                         |
| ------------------ | --------------------- | ----------- | --------------------------------------------------------------------------------------------------- |
| `element`          | `HTMLTextAreaElement` | required    | The `<textarea>` the editor wraps. Throws a `TypeError` if it is not a textarea.                    |
| `placeholder`      | `string`              | `undefined` | Placeholder text shown while the editor is empty.                                                   |
| `theme`            | `string`              | `undefined` | Applies a named theme by setting `data-easymde-theme` on the container. See [Theming](#theming).    |
| `trimInitialValue` | `boolean`             | `true`      | Trim leading/trailing whitespace from the textarea value at construct time.                         |
| `forceSync`        | `boolean`             | `undefined` | Mirror content to the textarea on every change. Off by default; sync otherwise runs on form submit. |

### Toolbar

| Option            | Type                       | Default                                        | Description                                                                                                                                                                                                                                           |
| ----------------- | -------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `toolbar`         | `ToolbarConfig`            | `true`                                         | `true` shows the default toolbar; `false` hides it; an array supplies a custom one. Array entries are a built-in `ToolbarButton` name, the literal `"\|"`, or an `IToolbarButtonOptions` object. See [Toolbar customisation](#toolbar-customisation). |
| `hideIcons`       | `readonly ToolbarButton[]` | `undefined`                                    | Button names to drop from the default toolbar. Ignored when `toolbar` is an array.                                                                                                                                                                    |
| `showIcons`       | `readonly ToolbarButton[]` | `undefined`                                    | Extra button names appended as a trailing group. Ignored when `toolbar` is an array.                                                                                                                                                                  |
| `toolbarGuideUrl` | `string`                   | `"https://www.markdownguide.org/cheat-sheet/"` | URL opened in a new tab by the `guide` button.                                                                                                                                                                                                        |

### Status bar

| Option      | Type      | Default | Description          |
| ----------- | --------- | ------- | -------------------- |
| `statusbar` | `boolean` | `true`  | Show the status bar. |

### Editing behaviour

| Option                 | Type                                         | Default                                                         | Description                                                                                       |
| ---------------------- | -------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `blockStyles`          | `{ bold?, italic?, strikethrough?, code? }`  | ``{ bold: "**", italic: "*", strikethrough: "~~", code: "`" }`` | Markers used by the bold/italic/strikethrough/code buttons. `code` is the **inline** code marker. |
| `unorderedListStyle`   | `"*" \| "-" \| "+"`                          | `"*"`                                                           | Bullet character used for unordered lists.                                                        |
| `orderedListDelimiter` | `"." \| ")"`                                 | `"."`                                                           | Delimiter after the number in ordered lists.                                                      |
| `promptURLs`           | `boolean`                                    | `false`                                                         | Prompt for the URL when inserting a link/image instead of a placeholder.                          |
| `promptTexts`          | `{ image?, link? }`                          | `{ image: "URL of the image:", link: "URL for the link:" }`     | Prompt strings used when `promptURLs` is on.                                                      |
| `insertTexts`          | `{ horizontalRule?, table?, link?, image? }` | built-in snippets                                               | Snippets inserted by the horizontal-rule/table/link/image buttons.                                |

### Markdown preview

Naming here matches [plugins-and-extensions.md §4](spec/plugins-and-extensions.md).

| Option                              | Type                                   | Default              | Description                                                                                       |
| ----------------------------------- | -------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------- |
| `previewRender`                     | `(markdown, previewElement) => string` | `undefined`          | Replace the default Marked pipeline. The returned HTML still passes through the sanitizer.        |
| `renderingConfig.markedOptions`     | `MarkedOptions`                        | `undefined`          | Options merged into the per-instance Marked parser (the global `marked` is never mutated).        |
| `renderingConfig.sanitizerFunction` | `(html) => string`                     | `DOMPurify.sanitize` | Final sanitizer applied to preview HTML. Always runs; pass a pass-through function to disable it. |

### Layout (side-by-side / fullscreen)

| Option                        | Type                          | Default     | Description                                                     |
| ----------------------------- | ----------------------------- | ----------- | --------------------------------------------------------------- |
| `syncSideBySidePreviewScroll` | `boolean`                     | `true`      | Sync editor and preview scroll positions in side-by-side mode.  |
| `sideBySideFullscreen`        | `boolean`                     | `false`     | Couple side-by-side with fullscreen (V2 parity).                |
| `onToggleFullScreen`          | `(entering: boolean) => void` | `undefined` | Called when fullscreen is entered (`true`) or exited (`false`). |

### Planned / not yet wired

These are accepted by the type but **not consumed yet**. They are documented so the roadmap is visible; setting them today has no effect.

| Option                                                     | Status                                                                                                               |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `codemirrorExtensions`                                     | Intended as the CodeMirror 6 escape hatch, but currently inert: extra extensions are not applied. Do not rely on it. |
| `indentWithTabs`, `tabSize`, `lineWrapping`, `lineNumbers` | Declared but not read. Line wrapping is always on; there are no line numbers.                                        |
| `minHeight`, `maxHeight`                                   | Declared but not read. Min height is a fixed `300px` in the stylesheet (retheme via CSS).                            |

Lifecycle callbacks beyond `onToggleFullScreen` are a separate case: they are **not declared at all**. Names such as `onDocumentChange`, `onPreviewToggle` and `onLayoutModeChange` are illustrative of the proposal in [plugins §7.2](spec/plugins-and-extensions.md) and are not part of `InputOptions`, so passing them is a type error rather than a silent no-op. They are targeted at a future 3.x release.

Many V2 options were dropped in V3 (image upload, autosave, spell checker, and more). See [Migrating from V2](#migrating-from-v2).

## Properties and methods

| Member                        | Description                                                                                                                                  |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `editor.value`                | Getter/setter for the current Markdown content.                                                                                              |
| `editor.element`              | The wrapped `<textarea>`.                                                                                                                    |
| `editor.container`            | The editor's container `<div>` (toolbar + editor + preview + status bar).                                                                    |
| `editor.codemirror`           | The underlying `EditorView` (CodeMirror 6).                                                                                                  |
| `editor.options`              | The fully-resolved options object (read-only).                                                                                               |
| `editor.isRendered`           | `true` after `construct()`, `false` after `destruct()`.                                                                                      |
| `editor.focus()`              | Move focus into the editor.                                                                                                                  |
| `editor.togglePreview()`      | Switch between edit and preview-only modes.                                                                                                  |
| `editor.isPreviewActive()`    | `true` while the preview pane is shown.                                                                                                      |
| `editor.toggleSideBySide()`   | Toggle the side-by-side editor + preview layout.                                                                                             |
| `editor.isSideBySideActive()` | `true` while side-by-side is active.                                                                                                         |
| `editor.toggleFullscreen()`   | Toggle fullscreen mode (Escape also exits).                                                                                                  |
| `editor.isFullscreenActive()` | `true` while fullscreen is active.                                                                                                           |
| `editor.addPlugin(plugin)`    | Register and mount a plugin (see [Plugin API](#plugin-api)).                                                                                 |
| `editor.destruct()`           | Tear down the editor: unmounts plugins (reverse order), removes the form listener, restores the textarea.                                    |
| `editor.construct()`          | Re-mount an editor that was torn down. The constructor calls it for you; throws `AlreadyConstructedError` if the editor is already rendered. |

Preview-only mode and side-by-side are mutually exclusive; toggling one turns the other off.

After `destruct()`, reading `value`, `container` or `codemirror` (and calling `focus()`) throws `NotConstructedError`. Guard with `isRendered`, or call `construct()` to re-mount. `element`, `options` and `isRendered` stay safe to read at any time.

## Toolbar customisation

Pass an array to `toolbar` to define a custom layout. Entries are built-in button **names**, the literal `"|"` for a separator group boundary, or custom button objects:

```ts
new EasyMDE({
    element: textarea,
    toolbar: ["bold", "italic", "|", "quote", "link", "|", "preview"],
});
```

An unrecognised name in the array (or in `showIcons`) is not ignored: it throws `Unknown toolbar button: "<name>"` while the editor is constructed. Unknown `hideIcons` entries are dropped silently.

### Built-in button names

`bold`, `italic`, `strikethrough`, `code`, `code-block`, `quote`, `unordered-list`, `ordered-list`, `task-list`, `clean-block`, `link`, `image`, `table`, `horizontal-rule`, `cycle-heading`, `heading-smaller`, `heading-bigger`, `heading-1`, `heading-2`, `heading-3`, `heading-4`, `heading-5`, `heading-6`, `undo`, `redo`, `preview`, `side-by-side`, `fullscreen`, `guide`.

The default layout (used when `toolbar` is `true` or omitted) is, in order, seven separated groups:

1. `bold`, `italic`, `cycle-heading`
2. `quote`, `unordered-list`, `ordered-list`, `task-list`, `clean-block`
3. `link`, `image`
4. `preview`
5. `undo`, `redo`
6. `guide`
7. `side-by-side`, `fullscreen`

The remaining buttons (`strikethrough`, `code`, `code-block`, `table`, `horizontal-rule`, `heading-1`–`heading-6`, `heading-smaller`, and `heading-bigger`) are opt-in via a custom `toolbar` array or `showIcons`.

### hideIcons / showIcons

When `toolbar` is `true` (or omitted), `hideIcons` removes buttons from the default layout and `showIcons` appends a trailing group:

```ts
new EasyMDE({ element: textarea, hideIcons: ["guide"], showIcons: ["strikethrough", "table"] });
```

Both are **ignored** when `toolbar` is an array; the array is the complete layout.

### Custom button shape

A custom toolbar entry implements `IToolbarButtonOptions`:

| Field    | Type                                                           | Description                                                                                                                                                                             |
| -------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`   | `string` (required)                                            | Becomes the button's CSS class.                                                                                                                                                         |
| `title`  | `string` (required)                                            | Tooltip and accessible name (`aria-label`).                                                                                                                                             |
| `icon`   | `IconDefinition \| LayeredIcon` (required)                     | A Font Awesome icon. Register non-default glyphs with `registerIcons` first. `LayeredIcon` is the shape `{ base, overlay }`; that type name is not exported, so pass an object literal. |
| `action` | `(editor: EasyMDE) => void` \| `string`                        | Click handler. A string is treated as a URL and opened in a new tab.                                                                                                                    |
| `active` | `boolean \| ((editor, update) => boolean \| Promise<boolean>)` | Presence makes it a toggle button: the return value drives the `.enabled` class and `aria-pressed`.                                                                                     |

```ts
import { registerIcons } from "easymde";
import { faStar } from "@fortawesome/free-solid-svg-icons";

registerIcons(faStar);

new EasyMDE({
    element: textarea,
    toolbar: [
        "bold",
        "italic",
        "|",
        {
            name: "star",
            title: "Insert a star",
            icon: faStar,
            action: (editor) => {
                editor.value += " ⭐";
            },
        },
    ],
});
```

Icons for every built-in button are registered automatically, not just the ones in the default layout. Only glyphs used by your own custom buttons need `registerIcons(...)`. The web component does **not** auto-register custom icons, so the host page must register them.

## Keyboard shortcuts

`Mod` is `Cmd` on macOS and `Ctrl` on Windows/Linux.

| Shortcut                  | Action                                            |
| ------------------------- | ------------------------------------------------- |
| `Mod-B`                   | Bold                                              |
| `Mod-I`                   | Italic                                            |
| `Mod-'`                   | Quote                                             |
| `Mod-H`                   | Heading (one level smaller)                       |
| `Shift-Mod-H`             | Heading (one level bigger)                        |
| `Mod-Alt-1` … `Mod-Alt-6` | Heading level 1–6                                 |
| `Mod-L`                   | Unordered list                                    |
| `Mod-Alt-L`               | Ordered list                                      |
| `Mod-K`                   | Insert link                                       |
| `Mod-Alt-I`               | Insert image                                      |
| `Mod-Alt-C`               | Code block                                        |
| `Mod-E`                   | Clean block                                       |
| `Mod-P`                   | Toggle preview                                    |
| `Mod-Z`                   | Undo                                              |
| `Mod-Y` / `Shift-Mod-Z`   | Redo                                              |
| `F9`                      | Toggle side-by-side                               |
| `F11`                     | Toggle fullscreen                                 |
| `Escape`                  | Exit fullscreen (only while fullscreen is active) |

Shortcut **overrides are not supported yet** (targeted at a future 3.x release). There is currently no way to remap these bindings.

## Plugin API

A plugin owns a root DOM element and a mount/unmount lifecycle:

```ts
interface IEasyMDEPlugin {
    readonly element: HTMLElement;
    mount(): void;
    unmount(): void;
}
```

`addPlugin(plugin)` pushes the plugin and calls `plugin.mount()` immediately; `destruct()` calls `unmount()` on every plugin in reverse registration order. The default toolbar, preview pane, and status bar are themselves plugins.

There is no separate event bus. Plugins observe editor state through `editor.codemirror`, the live `EditorView`.

> **Note on CodeMirror interop.** The published bundle **inlines its own copy** of `@codemirror/*`. CodeMirror recognises state effects by object identity, so an effect built from a separately installed `@codemirror/state` (for example `StateEffect.appendConfig.of(EditorView.updateListener.of(...))`) is **silently ignored** by the bundled instance: no error, no listener. Until the CodeMirror packages are exposed as peer dependencies, observe the editor through its DOM (as below) or drive updates from your own code. Reading and dispatching through `editor.codemirror` works normally.

Beyond `mount`/`unmount`, `onToggleFullScreen` is the only option-level lifecycle callback today; the others are [not declared at all yet](#planned--not-yet-wired).

```ts
import { EasyMDE, type IEasyMDEPlugin } from "easymde";

class CharCount implements IEasyMDEPlugin {
    readonly element = document.createElement("div");
    readonly #observer = new MutationObserver(() => this.#render());

    constructor(private editor: EasyMDE) {
        this.element.className = "easymde-char-count";
        this.#render();
    }

    #render = (): void => {
        this.element.textContent = `${this.editor.value.length} characters`;
    };

    mount(): void {
        this.editor.container.append(this.element);
        // Re-render on every document change. Watching the rendered DOM catches
        // typing and programmatic edits alike, and needs no CodeMirror import.
        this.#observer.observe(this.editor.codemirror.contentDOM, {
            characterData: true,
            childList: true,
            subtree: true,
        });
    }

    unmount(): void {
        this.#observer.disconnect();
        this.element.remove();
    }
}

const editor = new EasyMDE({ element: textarea });
editor.addPlugin(new CharCount(editor));
```

## Web component

The `<easy-markdown-editor>` custom element is registered automatically when `easymde` is imported.

```html
<form>
    <easy-markdown-editor name="comment">**Initial** content</easy-markdown-editor>
    <button type="submit">Post</button>
</form>
```

On `connectedCallback` the component finds a descendant `<textarea>` (the first one, at any depth) or auto-creates one, constructs `EasyMDE`, and forwards the `name` attribute to the textarea so the form posts the content under that field name. On `disconnectedCallback` it calls `destruct()`.

### Attributes

| Attribute     | Reactive | Description                                                                                                                                            |
| ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `value`       | yes      | Initial editor content. Setting it after connect updates the editor; _removing_ the attribute does not clear it (assign `element.value = ""` instead). |
| `name`        | yes      | Forwarded to the internal `<textarea>` so the editor participates in form submission.                                                                  |
| `placeholder` | no       | Read once at connect.                                                                                                                                  |
| `toolbar`     | no       | `"false"` hides the default toolbar. Custom toolbars stay JS-only via the class API.                                                                   |
| `statusbar`   | no       | `"false"` hides the status bar.                                                                                                                        |
| `theme`       | yes      | Applies a named theme by setting `data-easymde-theme` on the editor container. See [Theming](#theming).                                                |
| `trim`        | no       | `"false"` opts out of initial-value trimming (passes `trimInitialValue: false`).                                                                       |

### Initial content

Precedence (highest first):

1. `value` attribute on the host.
2. Content of a descendant `<textarea>` (the first one found, at any depth).
3. The host's own text content (e.g. `<easy-markdown-editor>hello</easy-markdown-editor>`).

All three go through `trimInitialValue` unless `trim="false"`, with one exception: host text that is entirely whitespace is always discarded, and `trim="false"` does not preserve it.

Put host text in direct text nodes. Only those are removed once captured, so text wrapped in a child element is captured _and_ left on screen as a visible duplicate. When a `<textarea>` is present, host text is ignored and left in place.

### JS property

`element.value` mirrors `editor.value` after connect. Setting `element.value` before the element connects caches the value into the `value` attribute, which is applied at construct.

## Form integration

A submit listener on the nearest ancestor `<form>` writes the current editor content to the textarea before submission. Pass `forceSync: true` to mirror on every change instead. The web component wires this for its internal textarea automatically.

## Theming

EasyMDE ships a light theme with an automatic dark variant (via `prefers-color-scheme`), so importing the stylesheet is all it takes:

```ts
import "easymde/style.css";
```

Every colour is a CSS custom property declared on the editor container (`.easymde-container`), so you can retheme entirely through variables without overriding component selectors.

Override them on `.easymde-container[data-easymde-theme="<name>"]`, not on `.easymde-container` alone. The built-in dark palette is declared on `.easymde-container:not([data-easymde-theme])`, which outranks a bare `.easymde-container` rule, so unattributed overrides are ignored under a dark OS regardless of source order.

### Tokens

| Token                              | Purpose                                                         | Light             | Dark                    |
| ---------------------------------- | --------------------------------------------------------------- | ----------------- | ----------------------- |
| `--easymde-bg`                     | Editor background                                               | `#ffffff`         | `#1e1e1e`               |
| `--easymde-text`                   | Editor text and caret                                           | `#333333`         | `#d4d4d4`               |
| `--easymde-border-color`           | Borders and separators                                          | `#d1d1d1`         | `#5a5a5a`               |
| `--easymde-selection-bg`           | Text selection                                                  | `#d7d4f0`         | `#264f78`               |
| `--easymde-placeholder`            | Placeholder text                                                | `#525252`         | `#b5b5b5`               |
| `--easymde-toolbar-bg`             | Toolbar background                                              | `#f9f9f9`         | `#252526`               |
| `--easymde-toolbar-text`           | Toolbar icon / label colour                                     | `#333333`         | `#d4d4d4`               |
| `--easymde-toolbar-hover`          | Button hover background                                         | `#e8e8e8`         | `#2d2d2d`               |
| `--easymde-toolbar-active`         | Button pressed background                                       | `#d8d8d8`         | `#3a3a3a`               |
| `--easymde-toolbar-enabled`        | Active toggle background                                        | `#e0e0e0`         | `#37373d`               |
| `--easymde-toolbar-enabled-border` | Active toggle border                                            | `#7a7a7a`         | `#888888`               |
| `--easymde-focus-ring`             | Focus outline (editor focus; keyboard focus on toolbar buttons) | `#1a5fb4`         | `#8ab4f8`               |
| `--easymde-preview-bg`             | Preview background                                              | `#ffffff`         | `#1e1e1e`               |
| `--easymde-preview-text`           | Preview text                                                    | `#333333`         | `#d4d4d4`               |
| `--easymde-preview-link`           | Preview link colour                                             | `#0645ad`         | `#8ab4f8`               |
| `--easymde-code-bg`                | Inline/block code background                                    | `rgba(0,0,0,.05)` | `rgba(255,255,255,.08)` |
| `--easymde-statusbar-text`         | Status bar text                                                 | `#525252`         | `#b5b5b5`               |

Editor Markdown syntax colours use `--easymde-syntax-{url,mark,keyword,string,literal,escape,variable,type,comment,invalid}` (each with its own light/dark value).

### Custom themes

Give the editor a theme name via the `theme` option (class API) or the `theme` attribute (web component). It is written to the container as `data-easymde-theme="<name>"`; target that selector in your own CSS and override any tokens you like:

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

The bundle ships no named themes beyond the light/dark default; `theme` is purely a hook for your CSS. A named theme is **self-contained**: it starts from the light defaults and does _not_ inherit the built-in dark values, so tokens you leave unset stay light even under a dark OS. Add your own dark handling if you want one:

```css
@media (prefers-color-scheme: dark) {
    .easymde-container[data-easymde-theme="solarized"] {
        --easymde-bg: #002b36;
        --easymde-text: #839496;
        --easymde-focus-ring: #8ab4f8;
        /* … */
    }
}
```

### Accessibility

The bundled light and dark themes meet WCAG AAA (7:1) contrast for all body text, syntax colouring and icons. Non-text state indicators are held to WCAG 1.4.11's 3:1 floor: the active-toggle border (`--easymde-toolbar-enabled-border`, 4.1:1 light / 4.3:1 dark against the toolbar) and the keyboard focus ring (`--easymde-focus-ring`, 6.0:1 / 7.3:1).

Two known exceptions: `--easymde-border-color` is a decorative box and separator line (1.5:1 light, 2.4:1 dark) and is not held to the 3:1 floor, and text on the selection background drops below AAA in both themes (light: 8.8:1 for body text but as low as 5.0:1 for syntax colours; dark: 5.7:1 and as low as 3.7:1). Both are tracked for a follow-up pass in [Milestone E](spec/milestone-e-post-stable.md).

Windows High Contrast / `forced-colors` mode is supported. Keep those ratios in mind when overriding tokens.

## Migrating from V2

EasyMDE 3 is a ground-up rewrite on CodeMirror 6 (V2 used CodeMirror 5). The API changed substantially: the library is ESM-only, `value()` is now the `editor.value` property, and many V2 options were dropped. See **[MIGRATION.md](MIGRATION.md)** for the full guide.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow.

```bash
vp install   # install dependencies
vp test      # run the test suite
vp check     # format, lint, and type-check
```

Run the live demo with `pnpm dev:app` (which runs `vp dev --port 5173 --strictPort`) and open <http://localhost:5173/tests/index.html>. Source is served directly from `src/` with hot-module reload, so there is no build step while developing.

## Toolchain

EasyMDE is built with **[Vite+](https://viteplus.dev)**, a unified toolchain driven by the single `vp` CLI that wraps Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. This is the "modern toolchain" asked for in [issue #447](https://github.com/Ionaru/easy-markdown-editor/issues/447), satisfied without tying the project to any one bundler.

The `package.json` scripts wrap the same commands (`pnpm build`, `pnpm test`, `pnpm check`). This repository is pnpm-only: its dev dependencies use pnpm's `catalog:` protocol, so install with `vp install` or `pnpm install`, not `npm install`. See [AGENTS.md](AGENTS.md) for details.
