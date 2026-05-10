# Milestone A — Foundations

**Goal:** Every non-UI building block is correct and the preview pipeline works end-to-end.
Milestone A is a prerequisite for all other milestones.

---

## A1 — Resolve Options

**Files:** `src/options.ts`

- Introduce `resolveOptions(input: InputOptions): Options` that applies all defaults.
- Expand `Options` to include every field that will have a runtime effect in milestones A–D (at minimum): `toolbar`, `statusbar`, `blockStyles`, `unorderedListStyle`, `indentWithTabs`, `tabSize`, `lineWrapping`, `lineNumbers`, `minHeight`, `maxHeight`, `placeholder`, `forceSync`, `promptURLs`, `promptTexts`; **`codemirrorExtensions`** ([plugins-and-extensions.md §3](plugins-and-extensions.md#31-consumer-facing-api-10-target)); and for preview/Marked the names in [plugins-and-extensions.md §4.2](plugins-and-extensions.md#42-marked-api-policy-10): top-level **`previewRender`**, and nested **`renderingConfig`** with **`markedOptions`** and **`sanitizerFunction`** (no parallel top-level duplicate for the sanitizer).
- Strip fields from `InputOptions` that will not be supported in V3 (or mark them `/** @deprecated */` and document the intention).
- Call `resolveOptions` at the start of `EasyMDE.construct()` and use the resolved value everywhere.

---

## A2 — Synchronous construction

**Files:** `src/easymde.ts`, `src/imports.ts`

- Remove the `void this.construct()` fire-and-forget pattern and all `async` from `construct()`.
- Eagerly import `Toolbar`, `defaultToolbar`, and `StatusBar` — remove `src/imports.ts` if it becomes dead.
- **Normative UX:** **`new EasyMDE(opts)` invokes `construct()` synchronously before the constructor returns** so a freshly constructed instance is immediately usable (**no** latent async race).
- Keep **`construct()` public** **only if** embedding patterns need a guarded “prepare options → mount” sequence; README MUST state that **`new`** is the normal path — any manual pattern calls **`construct()`** exactly once afterward (same synchronous rules).
- Update the `NotConstructedError` / `AlreadyConstructedError` guard to match.

---

## A3 — Plugin lifecycle

**Files:** `src/easymde.ts`, `src/toolbar/toolbar.ts`, `src/status-bar/status-bar.ts`

Replace the current `IEasyMDEPlugin` interface with:

```ts
export interface IEasyMDEPlugin {
    readonly element: HTMLElement;
    mount(): void;
    unmount(): void;
}
```

- `addPlugin(plugin)` stores the plugin and calls `plugin.mount()`.
- `destruct()` calls `plugin.unmount()` on every registered plugin and clears the list.
- Refactor `Toolbar` and `StatusBar` to implement the new interface.
    - `Toolbar.mount()` appends `this.element` to the editor container (move out of constructor).
    - `StatusBar.mount()` appends `this.element`.
    - Both `unmount()` methods call `this.element.remove()`.
- Remove the double-build: `Toolbar.build()` goes away; DOM is built once in the constructor (or a private `#build()` called by `mount()`).
- Register `StatusBar` via `addPlugin` (currently constructed ad-hoc in `#createStatusBar`).

---

## A4 — Trim FontAwesome bundle & icon surfaces

**Files:** `src/index.ts`, `src/toolbar/default-toolbar.ts`, `src/toolbar/*` (button types as needed)

**By MVP (beta.1):**

- Replace `library.add(fas)` with individual icon imports for only the icons used by the default toolbar (~12 icons).
- Export a `registerIcons(...icons: IconDefinition[]): void` helper so consumers can add Font Awesome icon definitions for custom toolbar buttons without importing `fas`.

**Documentation:** Consumers call **`registerIcons`** for custom FA buttons; **`registerIcons`** is **not** auto-invoked by the web component (**[decisions.md](decisions.md)** §**8** MVP bullet).

**By Stable (`v3.0.0`):**

- Support **custom toolbar icons without Font Awesome** as a normative part of `IToolbarButtonOptions` (exact field names ship with implementation), for example one or more of:
    - inline **SVG string** (sanitised / constrained to `<svg>` subtree),
    - **`HTMLElement`** supplied by the consumer,
    - or a small documented **`icon` resolver** hook that returns an element to place inside the button.
- Font Awesome remains **one** backend: default toolbar buttons may keep using `@fortawesome` + `registerIcons`; custom buttons may use the non-FA surfaces above.
- README must document the recommended approach for “raw SVG” from [issue #447](https://github.com/Ionaru/easy-markdown-editor/issues/447) / [#491](https://github.com/Ionaru/easy-markdown-editor/issues/491).

Implementation order: ship **trimmed FA + `registerIcons`** first; **non-FA / SVG** completes by Stable, not blocking beta.

---

## A5 — Preview pipeline

**Files:** `src/preview/preview.ts` (new), `src/easymde.ts`

Create a `Preview` class:

```ts
class Preview implements IEasyMDEPlugin {
    readonly element: HTMLDivElement;
    mount(): void;
    unmount(): void;
    render(markdown: string): void;
}
```

- `render` calls the shared Markdown → HTML pipeline from [plugins-and-extensions.md §4](plugins-and-extensions.md) (`renderMarkdownToHtmlForPreview`-style helper): dedicated per-instance **`Marked`** + optional **`previewRender`** override, then **`renderingConfig.sanitizerFunction`** (or safe built-in default per [decisions.md](decisions.md) §2). Never assigns raw HTML without that final step.
- Sets `this.element.innerHTML` to the sanitized HTML.
- `element` has `class="easymde-preview"` and is hidden by default via CSS.

Expose on `EasyMDE`:

```ts
togglePreview(): void
isPreviewActive(): boolean
```

`togglePreview()`:

1. Hides the CM editor DOM node and shows the preview element (CSS class toggle).
2. Calls `preview.render(this.value())` when switching to preview.
3. Updates the active state of the preview toolbar button.

Connect `Preview` to the live update listener so a future side-by-side mode can call `render()` incrementally (debounced).

---

## A6 — Public API

**Files:** `src/easymde.ts`, `src/index.ts`

Add to `EasyMDE`:

```ts
get value(): string
set value(text: string)
destruct(): void
isPreviewActive(): boolean
```

**Value access:** Property-style getter/setter (`editor.value` / `editor.value = "..."`) — matches `<textarea>.value` shape and avoids overload-signature noise. No `getValue()` / `setValue()` methods; no callable `value()` overload.

- `get value` returns `this.codemirror.state.doc.toString()`.
- `set value` dispatches a full-document replacement transaction on the CM state (`changes: { from: 0, to: doc.length, insert: text }`).
- Export all public types from `src/index.ts`.

---

## A7 — Form sync

**Files:** `src/easymde.ts`

On `construct()`:

1. Find the nearest `<form>` ancestor of the textarea (`element.closest('form')`).
2. Attach a `submit` listener that calls `this.#element.value = this.value` before the form submits.
3. Store the listener reference so `destruct()` can remove it.

For `forceSync` mode:

- Install a CM `EditorView.updateListener` extension that writes to `this.#element.value` on every `docChanged` transaction.

---

## A8 — Web component

**Files:** `src/index.ts` (or new `src/web-component.ts`)

Implement `<easy-markdown-editor>` as a thin wrapper (**[decisions.md](decisions.md) §3**, option **B**):

- On `connectedCallback`, locate a `<textarea>` child (slot or auto-created) and construct `EasyMDE` on it.
- Observed attributes: `value`, `placeholder`, **`toolbar`** (**boolean semantics only**: attribute `"false"` hides the default toolbar; custom toolbar definitions stay **JavaScript-only** via the class API), **`statusbar`** (same), **`theme`**.
- On `disconnectedCallback`, call **`easyMDE.destruct()`**.
- Expose a `value` JS property that proxies `easyMDE.value()`.

---

## A9 — Fix `countWords`

**File:** `src/utils/count-words.ts`

Replace the space-only split with a whitespace-aware match:

```ts
export const countWords = (document: Text) =>
    document.toJSON().reduce((acc, line) => acc + (line.match(/\S+/g)?.length ?? 0), 0);
```

Update the spec (`toggle-block.spec.ts` does not cover this; add `count-words.spec.ts`).

---

## Acceptance criteria for Milestone A

- [ ] `new EasyMDE({ element })` is synchronous; no race condition.
- [ ] `easyMDE.value` returns the current editor text.
- [ ] `easyMDE.value = 'new text'` updates the editor.
- [ ] `easyMDE.togglePreview()` shows a rendered HTML preview of the Markdown content.
- [ ] `easyMDE.isPreviewActive()` returns the correct boolean.
- [ ] Submitting a `<form>` containing the editor writes the current content to the textarea before submission.
- [ ] `destruct()` cleans up all plugins and the form listener.
- [ ] `library.add(fas)` is gone; only the ~12 default toolbar icons are imported.
- [ ] `vp check` and `vp test` pass with no errors.
