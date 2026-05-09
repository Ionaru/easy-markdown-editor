# EasyMDE V3 — Design Decisions

These are open questions that need an answer before or during coding. Deferring them leads to inconsistent code. Each entry has a recommendation — but mark it as resolved once a direction is confirmed.

---

## 1. Construction API: sync constructor vs async factory

**Options:**

- A) Keep async constructor, but expose a `ready: Promise<void>` property consumers can await.
- B) Make `construct()` synchronous by removing all dynamic imports (`toolbar` and `status-bar` become eager imports). Bundle size difference is negligible since all deps are already inlined.
- C) Replace with a static `await EasyMDE.create(opts)` factory. Constructor becomes private/protected.

**Recommendation:** **B** (synchronous construction).  
The toolbar and status bar are not optional in the default flow; the dynamic import provides no measurable performance benefit for a library of this size. Sync construction is simpler to reason about, document, and test. If consumers need a render-later pattern they can pass `toolbar: false` and call a `render()` method manually.

**Status:** open

---

## 2. Sanitization default in preview

The preview pipeline renders arbitrary Markdown to HTML. Without sanitization this is an XSS vector.

**Options:**

- A) Require consumers to pass `sanitizerFunction`; throw if omitted (opt-out impossible). Very safe, but breaks drop-in use.
- B) Bundle DOMPurify as a default and apply it automatically; `sanitizerFunction` overrides. Adds a dependency.
- C) Default to HTML-escaping any raw HTML in Markdown input (no embedded HTML rendered). Safest, but breaks Markdown that intentionally embeds HTML.
- D) Render unsanitized by default, document the risk, let consumers bring their own sanitizer. Matches V2 behaviour.

**Recommendation:** **B** (bundle DOMPurify as optional peer dependency, apply by default).  
A library that is safe by default is more valuable than one that is flexible but footgunny. Make DOMPurify a peer dep so bundle-size-conscious consumers can replace it. If DOMPurify is not available, fall back to HTML escape (option C).

**Status:** open

---

## 3. Web component scope

`<easy-markdown-editor>` is currently a stub. Options:

- A) Remove it entirely — it was an experiment; the JS class API is sufficient.
- B) Implement as a minimal wrapper: the web component creates a `<textarea>` internally and constructs `EasyMDE` on it; a limited set of attributes (e.g. `value`, `toolbar`, `statusbar`) map to options. Does not aim for full option parity.
- C) Full parity: every `InputOptions` field maps to an attribute or a property on the element.

**Recommendation:** **B** (minimal wrapper).  
Option A discards functionality that may be useful for framework-agnostic embedding. Option C is a massive surface to maintain. A small attribute set (value, placeholder, toolbar, statusbar, theme) is enough for the dominant "drop it in a form" use case, and the JS API covers everything else.

**Status:** open

---

## 4. Toolbar button intent: cursor vs. selection semantics

The maintainer identified this as V3's hardest problem (issue #447 comment, 2025-04-25): what should happen when Bold is clicked with the cursor mid-word, at a boundary, or with a range selection?

**Proposal (to discuss):**

1. **Cursor with no selection**: expand to the nearest word boundary (stop at whitespace/punctuation), apply the marker to that word.
2. **Cursor inside an already-marked block**: remove the marker from that block.
3. **Explicit selection**: apply/remove the marker to exactly the selection range, regardless of word boundaries.
4. **Multi-line selection**: for inline markers, apply independently to each word/token; for line-prefix markers, apply to all lines in the selection.

This should be codified in a helper (e.g. `resolveRange(state, type: 'inline' | 'line')`) and tested exhaustively before wiring buttons to it. The existing `toggle-block.spec.ts` is the template for those tests.

**Status:** open

---

## 5. Spellcheck: keep or drop?

V2 bundled a `typo.js`-based spellchecker. Issue #447 comments suggest dropping it in favour of browser-native spellcheck.

**Options:**

- A) Drop entirely; document that consumers should set `spellcheck` attribute and `nativeSpellcheck` option.
- B) Keep as an optional built-in plugin (not in the default bundle).
- C) Keep as it was in V2.

**Recommendation:** **A**.  
Browser spellcheck has improved significantly; every major browser supports it in contenteditable. Keeping a JS spellchecker adds bundle size, a stale dictionary dependency, and maintenance burden for limited incremental value.

**Status:** open

---

## 6. `IEasyMDEPlugin` lifecycle shape

**Normative detail:** [plugins-and-extensions.md](plugins-and-extensions.md) §2 (Editor plugins).

Current interface is `{ build(args: unknown): Promise<void>; destroy(): Promise<void> }`. Problems:

- `build` takes `unknown` arguments — not type-safe, and no caller passes arguments.
- `build` is never called by `addPlugin`.
- Return values are ignored.

**Proposed replacement:**

```ts
export interface IEasyMDEPlugin {
    readonly element: HTMLElement;
    mount(): void;
    unmount(): void;
}
```

`addPlugin` calls `mount()` after registering, and `destruct()` calls `unmount()` on each registered plugin. The `element` property lets `EasyMDE.construct()` append the plugin's DOM in order (toolbar → editor → status bar → custom plugins).

**Status:** open (interface agreed in spec; implementation tracks [milestone-a-foundations.md](milestone-a-foundations.md) A3)

---

## 7. `Options` / `InputOptions` normalization

Do we want a single `Options` type (fully resolved) or separate `InputOptions` (what the consumer passes) and `Options` (internal resolved shape)?

**Recommendation:** Keep both, but ensure `Options` is genuinely the resolved type — i.e. every field that can default to something is non-optional in `Options`. `resolveOptions(input: InputOptions): Options` is the single point where defaults are applied. This makes the internal code simpler (no `??` chains throughout).

**Status:** open

---

## 8. Module exports surface

What should `import { ... } from 'easymde'` expose?

**Minimum for beta:**

- `EasyMDE` class
- `IEasyMDEPlugin` interface
- `InputOptions`, `Options` types
- `importToolbar`, `importDefaultToolbar` (keep for consumers building custom toolbars; but remove if construction goes sync)

**Defer to stable:**

- Individual button actions (`toggleBold`, `toggleItalic`, …) for consumers who compose custom toolbars programmatically
- `Toolbar`, `StatusBar` classes
- `registerIcons()` helper

**Status:** open
