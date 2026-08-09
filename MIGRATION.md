# Migrating from EasyMDE 2 to 3

EasyMDE 3 is a ground-up rewrite. The editor core moved from **CodeMirror 5 to CodeMirror 6**, the package is now **ESM-only**, and the options surface was trimmed to a supported core. This guide lists what changed so you can port a V2 integration.

If something you relied on is missing below, it was almost certainly removed; see [Removed options](#removed-options).

## At a glance

| Area               | V2                                                              | V3                                                                  |
| ------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------- |
| Editor core        | CodeMirror 5                                                    | CodeMirror 6 (`editor.codemirror` is an `EditorView`)               |
| Distribution       | npm (CommonJS, default export) or UMD bundle + global `EasyMDE` | ESM only, **named** export: `import { EasyMDE } from "easymde"`     |
| Styles             | `easymde.min.css`                                               | `import "easymde/style.css"`                                        |
| Icons              | Font Awesome auto-downloaded from a CDN                         | Font Awesome **bundled**; extra glyphs via `registerIcons`          |
| Get/set content    | `editor.value()` / `editor.value(text)`                         | `editor.value` property (getter/setter)                             |
| Teardown           | `editor.toTextArea()`                                           | `editor.destruct()`                                                 |
| Preview sanitizing | Off unless you set `sanitizerFunction`                          | **On by default** (DOMPurify)                                       |
| Theming            | CodeMirror theme name + your CSS                                | CSS custom properties with automatic dark mode                      |
| New                | (none)                                                          | `<easy-markdown-editor>` web component, `IEasyMDEPlugin` plugin API |

## Installation and consumption

**V2 (script tag / global):**

```html
<link rel="stylesheet" href="https://unpkg.com/easymde/dist/easymde.min.css" />
<script src="https://unpkg.com/easymde/dist/easymde.min.js"></script>
<script>
    const editor = new EasyMDE({ element: document.getElementById("editor") });
</script>
```

**V2 (npm):**

```js
const EasyMDE = require("easymde"); // or: import EasyMDE from "easymde";
```

**V3 (ESM):**

```ts
import { EasyMDE } from "easymde";
import "easymde/style.css";

const textarea = document.querySelector<HTMLTextAreaElement>("textarea");
if (!textarea) throw new Error("No <textarea> found");

const editor = new EasyMDE({ element: textarea });
```

V3 has **no default export** and no CommonJS build: `require("easymde")` and `import EasyMDE from "easymde"` both stop working, use the named import instead. There is also no global `EasyMDE`, no minified UMD bundle, and no CDN. Font Awesome is bundled, so the runtime no longer fetches it from `maxcdn.bootstrapcdn.com`; the `autoDownloadFontAwesome` option is gone.

## Class API changes

| V2                                                              | V3                                                                       |
| --------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `editor.value()` / `editor.value(t)`                            | `editor.value` / `editor.value = t` (property)                           |
| `editor.toTextArea()`                                           | `editor.destruct()`                                                      |
| `editor.cleanup()`                                              | handled by `destruct()`                                                  |
| `editor.getState()`                                             | removed                                                                  |
| `editor.markdown(text)`                                         | removed (internal renderer is not public)                                |
| `editor.updateStatusBar(item, html)`                            | removed (status items are not configurable)                              |
| `editor.toggleBold()` and the other text-editing action methods | removed as public methods; use the toolbar buttons or keyboard shortcuts |
| `editor.togglePreview()` / `editor.toggleSideBySide()`          | unchanged                                                                |
| `editor.toggleFullScreen()`                                     | renamed to `editor.toggleFullscreen()` (lower-case `s`)                  |
| `EasyMDE.toggleBold(editor)` statics                            | removed                                                                  |
| all `uploadImage*` methods                                      | removed (image upload is out of scope for V3)                            |

`editor.codemirror` still exists, but it is now a CodeMirror 6 `EditorView`, not a CM5 instance. Code that used the CM5 event API (`editor.codemirror.on("change", …)`) must be rewritten against CodeMirror 6. Note that the published bundle inlines its own CodeMirror instance, so an update listener built from separately installed `@codemirror/view` / `@codemirror/state` packages is silently ignored; see the [Plugin API](README.md#plugin-api) notes for the pattern that works today.

`isPreviewActive()`, `isSideBySideActive()`, and `isFullscreenActive()` are unchanged.

## Options that carried over

These keep the same name and meaning: `placeholder`, `forceSync`, `toolbar`, `hideIcons`, `showIcons`, `unorderedListStyle`, `promptURLs`, `promptTexts`, `previewRender`, `renderingConfig.markedOptions`, `renderingConfig.sanitizerFunction`, `syncSideBySidePreviewScroll`, `sideBySideFullscreen`, `onToggleFullScreen`.

Notes:

- **`element`** is now **required** and must be an `HTMLTextAreaElement`. V2's fallback to the first `<textarea>` on the page (`new EasyMDE()`) is gone; omitting `element`, or passing any other element, throws a `TypeError`.
- **`status` → `statusbar`.** V2 accepted a boolean or an array of custom status items. V3 accepts only a boolean; custom status items were dropped.
- **`blockStyles`** gains a `strikethrough` marker (default `~~`), and `code` changed meaning: in V2 it was the code _fence_ (default three backticks), in V3 it is the **inline** code marker (default `` ` ``). The `code-block` button no longer reads `blockStyles` at all.
- **`insertTexts`** changed in three ways: the `uploadedImage` entry is gone (no image upload); `table` and `horizontalRule` are now single strings holding the whole template rather than `[prefix, suffix]` pairs (`link` and `image` are still pairs); and the `#url#` placeholder is gone, because V3 splices the prompted URL in before the first `)` of the suffix. Write `["[", "](https://)"]`, not `["[", "](#url#)"]`.
- **`previewRender`** must return a string. V2's "return `null` to keep the default HTML" is gone.
- **`theme`** changed meaning: in V2 it was a CodeMirror theme name; in V3 it is a hook that sets `data-easymde-theme` for your own CSS variables (see [Theming](README.md#theming)).
- **New in V3:** `orderedListDelimiter` (`"."` or `")"`), `trimInitialValue` and `toolbarGuideUrl`.

## Removed options

No equivalent in V3:

- **Image upload (entire group):** `uploadImage`, `imageMaxSize`, `imageAccept`, `imageUploadFunction`, `imageUploadEndpoint`, `imagePathAbsolute`, `imageCSRFToken`, `imageCSRFName`, `imageCSRFHeader`, `imageInputName`, `imageTexts`, `errorMessages`, `errorCallback`, `previewImagesInEditor`, `imagesPreviewHandler`.
- **Autosave:** `autosave` and all sub-options.
- **Spell checking:** `spellChecker`, `nativeSpellcheck`, `inputStyle`.
- **Editor tuning:** `autofocus` (the editor always focuses on construct), `initialValue` (seed the `<textarea>` instead, but note V3 trims that value by default: pass `trimInitialValue: false` to keep leading/trailing whitespace), `autoRefresh`, `scrollbarStyle`, `styleSelectedText`, `direction` (RTL), `parsingConfig`, `overlayMode`.
- **Toolbar tuning:** `toolbarTips`, `toolbarButtonClassPrefix`, `iconClassMap`.
- **Preview:** `previewClass`, and the `renderingConfig` sub-options `codeSyntaxHighlighting`, `hljs` and `singleLineBreaks`.
- **Font Awesome:** `autoDownloadFontAwesome`.
- **Shortcuts:** `shortcuts` (keybinding overrides are not supported yet; see [Keyboard shortcut differences](#keyboard-shortcut-differences)).

Declared in the V3 types but **not wired up yet** (setting them has no effect): `codemirrorExtensions`, `indentWithTabs`, `tabSize`, `lineWrapping`, `lineNumbers`, `minHeight`, `maxHeight`. Do not rely on them.

## Toolbar button renames

Built-in button names changed. Update any custom `toolbar` array:

| V2 name        | V3 name         | Note                                                                                  |
| -------------- | --------------- | ------------------------------------------------------------------------------------- |
| `heading`      | `cycle-heading` | Cycles heading level.                                                                 |
| `check-list`   | `task-list`     |                                                                                       |
| `code`         | `code-block`    | V2 `code` toggled a fenced block. V3 also adds a separate `code` for **inline** code. |
| `upload-image` | _(removed)_     | No image upload in V3.                                                                |

All other names (`bold`, `italic`, `strikethrough`, `quote`, `unordered-list`, `ordered-list`, `link`, `image`, `table`, `horizontal-rule`, `clean-block`, `heading-1`…`heading-3`, `heading-smaller`, `heading-bigger`, `undo`, `redo`, `preview`, `side-by-side`, `fullscreen`, `guide`) are unchanged. `heading-4`, `heading-5` and `heading-6` are **new** toolbar names in V3: V2 had those heading levels only as action methods, never as toolbar entries. See the [full list](README.md#built-in-button-names).

### Custom toolbar buttons

The custom button object was simplified. V3's `IToolbarButtonOptions` is `{ name, title, icon, action?, active? }`:

- **`icon`** is now a Font Awesome **`IconDefinition`** (import it and pass the object), not a CSS class string. Register non-default glyphs with `registerIcons` first.
- **`active`** (a boolean or `(editor, update) => boolean | Promise<boolean>`) replaces V2's class-toggling machinery and drives `aria-pressed`.
- Dropped: `className`, `noDisable`, `noMobile`, `attributes`, dropdown `children`, and text-only buttons.

See [Custom button shape](README.md#custom-button-shape) for a full example.

## Keyboard shortcut differences

Most bindings are unchanged (`Mod` = Cmd on macOS, Ctrl elsewhere). Differences:

- **Task list** (`task-list`) has **no default shortcut** in V3. V2 bound the check list to `Shift-Mod-L` (`Shift-Ctrl-L` on Windows/Linux, `Shift-Cmd-L` on macOS).
- **Tab / Shift-Tab no longer indent lists.** V2 bound them to `tabAndIndentMarkdownList` / `shiftTabAndUnindentMarkdownList`. V3 leaves `Tab` unbound, so it moves focus out of the editor (CodeMirror 6's accessibility default); indent nested list items manually.
- **Enter no longer continues lists.** V2 bound `Enter` to `newlineAndIndentContinueMarkdownList`, so pressing it inside a list item inserted the next marker. V3 inserts a plain line break; type the next marker yourself.
- **Undo/redo** are now explicit EasyMDE bindings: `Mod-Z` (undo), `Mod-Y` and `Shift-Mod-Z` (redo). V2 leaned on CodeMirror 5's defaults.
- **Remapping is not supported yet.** The V2 `shortcuts` option is gone and there is currently no replacement.

Heading-level bindings are unchanged in effect (`Mod-Alt-1`…`Mod-Alt-6`): V2 declared them as `Ctrl+Alt+n` but rewrote `Ctrl` to `Cmd` on macOS, so the keys you actually press are the same.

See the [full shortcut map](README.md#keyboard-shortcuts).

## Behaviour differences

- **Preview is sanitized by default.** V3 runs DOMPurify over the preview HTML (including the output of a custom `previewRender`) unless you supply a pass-through `renderingConfig.sanitizerFunction`. V2 did not sanitize unless you configured it.
- **The editor always autofocuses** on construct. There is no `autofocus` option.
- **Line wrapping is always on** and cannot be disabled.
- **No spell checking at all.** V2's `spellChecker` and `nativeSpellcheck` are both gone, and CodeMirror 6 sets `spellcheck="false"` on its content element, so the browser's native checker does not run inside the editor either. There is currently no option to re-enable it.
- **Single line breaks are no longer `<br>` by default.** V2 forced `breaks: true` unless you set `renderingConfig.singleLineBreaks: false`; V3 uses marked's default. Set `renderingConfig.markedOptions = { breaks: true }` to restore the V2 rendering.
- **Preview HTML is no longer post-processed.** V2 rewrote anchors to `target="_blank"` and stripped list markers from checkbox items. V3 renders marked's output as-is, then sanitizes it.
- **Theming is CSS-variable based** with an automatic `prefers-color-scheme` dark mode, instead of a CodeMirror theme name plus a separate stylesheet.
- **A dedicated Marked instance per editor.** `renderingConfig.markedOptions` no longer mutates the global `marked`.

## New in V3

- **[Web component](README.md#web-component):** `<easy-markdown-editor>` for markup-first integration and forms.
- **[Plugin API](README.md#plugin-api):** the `IEasyMDEPlugin` interface plus `addPlugin`. The toolbar, preview, and status bar are themselves plugins.
- **Accessibility:** an ARIA toolbar with roving-tabindex keyboard navigation, `aria-pressed` on toggles, preview focus management, and WCAG AAA text contrast in both themes (see [Accessibility](README.md#accessibility) for the two documented exceptions).
