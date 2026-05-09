# EasyMDE V3 — Gap Analysis & Production Plan

## 1. Where V3 stands today

The `src/` tree compiles, mounts CodeMirror 6 onto a textarea, and renders a toolbar + status bar around it. That is essentially everything that works.

| Subsystem                               | Status                                                              | File                                                             |
| --------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------- |
| CodeMirror 6 host                       | working (line wrap, draw selection, Markdown lang)                  | `src/easymde.ts:69`                                              |
| Heading & monospace highlight           | working                                                             | `src/easymde.ts:75-118`                                          |
| Toolbar shell                           | working, registers as `IEasyMDEPlugin`                              | `src/toolbar/toolbar.ts:7`                                       |
| Toolbar buttons with action+active      | bold, italic, strikethrough, code(inline)                           | `src/toolbar/buttons/*.ts`                                       |
| Toolbar buttons rendered but inert      | heading, quote, ul, ol, clean-block, link, image, guide-link        | `src/toolbar/default-toolbar.ts:32`                              |
| `toggleBlock` core utility              | well-tested for inline marker pairs                                 | `src/utils/toggle-block.ts:20`, `src/utils/toggle-block.spec.ts` |
| Status bar                              | lines/words/chars/pos                                               | `src/status-bar/status-bar.ts:7`                                 |
| `marked` dep                            | imported and primed but **never used** to render anything           | `src/easymde.ts:6,34`                                            |
| Custom element `<easy-markdown-editor>` | renders the literal string `"Hello World!"`                         | `src/index.ts:9`                                                 |
| Options interface                       | rich `InputOptions` (V2-shaped), but `Options` only consumes 3 keys | `src/options.ts:156` vs `:218`                                   |
| Build pipeline                          | Vite+ packs ESM + d.ts + sourcemap, all CM/lezer/FA bundled         | `vite.config.ts`                                                 |
| Tests                                   | only `toggle-block.spec.ts`                                         | —                                                                |

Issue #447 confirms the maintainer's read: _"extremely bare-bones, lots of features and configuration options are missing and there's no preview mode yet."_ The two known pain points he flagged are (a) preview, and (b) toolbar-button intent ambiguity (cursor-vs-selection semantics).

## 2. V2 → V3 feature gap

### Critical gaps (block "writing + previewing markdown" — the user's MVP definition)

1. **Preview pipeline** — `marked` is imported but no preview pane, no `togglePreview()`, no sanitization. The user's stated MVP requires this.
2. **Inline code vs fenced code block** — current `code` button toggles a single back-tick around inline text. V2 has both `toggleCodeBlock` (fenced ` ``` `) and inline. The marker `` ` `` in `blockStyles.code` is wrong for a "code" button labeled like a block toggle.
3. **Line-prefix toggles** — heading (#, ##, ###), blockquote (`>`), ordered/unordered list (`1.`, `*`/`-`/`+`), task list (`- [ ]`). `toggleBlock` only handles symmetric inline pairs. A separate `toggleLine` / `toggleHeading` utility is needed.
4. **Link & image insertion** — both buttons exist but have no action. Need prompt UI (or inline placeholder text) and `promptURLs` / `promptTexts` honoring.
5. **Horizontal rule, table, clean-block** — present in toolbar UI, no actions.
6. **Undo / redo** — not wired (CM6 has `history()`; just needs to be added to the extension list and exposed).
7. **Keyboard shortcuts** — none. CM6 defaults give arrow/typing only; no formatting keymap.
8. **Form sync** — `destruct()` writes back to the textarea, but there's no `forceSync` on every change, and no `submit` handler. Forms that submit while the editor is mounted will send the _original_ textarea value.
9. **Public API** — V2's surface (`value()`, `value(text)`, `toTextArea()`, `isPreviewActive()`, `cleanup()`, `clearAutosavedValue()`) is absent. Without it we can't claim feature-parity for embedders.
10. **Custom element** — `<easy-markdown-editor>` is a stub that prints "Hello World". Either implement it as a real wrapper around `EasyMDE` or remove it from the public surface.
11. **FontAwesome bundle bloat** — `library.add(fas)` pulls every solid icon (issue #447 explicitly calls this out: _"Custom SVG support without bloated downloads"_). Should import only icons used by the default toolbar, and let consumers add their own.

### Important gaps (V2 parity, but deferrable past first stable)

12. **Side-by-side and fullscreen** modes (`F9`, `F11` in V2)
13. **Autosave** (localStorage + delay + `uniqueId`)
14. **Image upload** — paste, drag-drop, file picker, CSRF, custom uploader
15. **Custom toolbar config** — `hideIcons`, `showIcons`, custom buttons, dropdowns. Type definitions exist in `options.ts`, but `defaultToolbar` is hard-wired in `easymde.ts:144`.
16. **Spell-check toggle** — issue #447 thread leans toward dropping `nuspell`/typo.js spellchecker; rely on `contenteditable` `spellcheck` attribute. Decision needed.
17. **Theme/dark mode** — explicit goal in issue #447. Stub exists in `styles.scss:12-19` (commented out).
18. **RTL/LTR `direction`**
19. **Status bar customization** (`status: false | string[] | StatusBarItem[]`)
20. **Custom shortcut overrides** (`shortcuts: {…}`)
21. **Sanitizer hook** for preview HTML (defaults to DOMPurify or a no-HTML mode)

### Architectural / quality gaps

22. **Async constructor** — `EasyMDE` constructor calls `void this.construct()`. Consumers can't `await` readiness; `isRendered` is a boolean racer. Either: (a) make construction sync by removing dynamic imports, or (b) require `await EasyMDE.create(opts)`.
23. **Toolbar double-build** — `Toolbar`'s constructor builds the DOM, _and_ `build()` does the same; `easymde.ts:188` has the `build()` call commented out, but the bug is one un-comment away. Pick one path.
24. **Plugin lifecycle** — `addPlugin` stores plugins but never calls `build()`. The interface promises `build(arguments_: unknown)` but the only built-in plugin (`Toolbar`) builds in its constructor instead. The status bar isn't even an `IEasyMDEPlugin` despite needing the same lifecycle.
25. **`countWords`** splits on `" "` only, undercounts when separators are tabs/newlines/multi-space. V2 uses a regex.
26. **Element validation** — only accepts `HTMLTextAreaElement`. V2 accepted a selector string and an element; "no magic" from #447 supports keeping it strict, but at least support `Element | string` for ergonomics or document the choice.
27. **`Options` type vs `InputOptions`** — `Options` only models 3 fields; the rest of `InputOptions` is decorative. Either expand `Options` to be the resolved/normalized config (with defaults applied), or delete `InputOptions` fields you don't intend to support.
28. **No e2e/integration tests** — `toggle-block.spec.ts` is unit-level; no test for toolbar wiring, status bar, preview, or `EasyMDE` end-to-end.
29. **No published demo** — `tests/index.html` only loads from `dist/`; no `vp dev` story.
30. **Accessibility** — toolbar uses `<button tabIndex=-1>` (every button) which excludes them from keyboard focus, no `aria-label` (only `title`), no `aria-pressed` for toggle state, no `role="toolbar"`.

## 3. Recommended scope split

**MVP (V3.0.0-beta.1 — "write + preview"):** items 1–11 above, plus 22, 24, 30.
**Stable (V3.0.0):** items 12, 14, 15, 17, 21, 25, 27, 28, 29.
**Post-1.0:** 13 (autosave), 16 (spellcheck decision), 18 (RTL), 19 (status custom), 20 (shortcut overrides).

## 4. Implementation plan

### Milestone A — MVP foundations

1. **Unify configuration.** Rewrite `options.ts` so `resolveOptions(input: InputOptions): Options` produces a fully-defaulted object. Drop fields that won't ship in V3 from `InputOptions` (don't let dead types accrete). Files: `src/options.ts`.
2. **Fix construction lifecycle.** Replace async constructor with a static `EasyMDE.create()` that does the dynamic imports and returns `Promise<EasyMDE>`; constructor stays sync and private/internal. Or, eagerly import toolbar/status-bar (the dynamic split has no measurable benefit at this size). Files: `src/easymde.ts`.
3. **Plugin lifecycle pass.** Define `IEasyMDEPlugin` as `{ mount(host): HTMLElement; unmount(): void }`. Make `Toolbar` and `StatusBar` both implement it; `addPlugin` calls `mount` and tracks the result. Files: `src/easymde.ts`, `src/toolbar/toolbar.ts`, `src/status-bar/status-bar.ts`.
4. **Trim FA bundle.** Replace `library.add(fas)` with explicit imports of only the ~12 icons the default toolbar uses; export a helper `registerIcons(...)` for plugin authors. Files: `src/index.ts`, `src/toolbar/default-toolbar.ts`.
5. **Preview rendering.** Add `src/preview/preview.ts` that owns a `<div class="easymde-preview">` and a `render(markdown: string)` method using `marked` + a sanitizer (DOMPurify behind an interface; default to "escape HTML" if no sanitizer is provided so we don't ship an XSS hole). Add a `togglePreview()` method on `EasyMDE` that hides the CM editor, shows the preview, and re-renders. Wire to a new `preview` toolbar button. Files: new `src/preview/`, `src/easymde.ts`, `src/toolbar/buttons/toggle-preview.ts`.
6. **Public API.** Implement `value()`, `value(text)`, `toTextArea()` (alias for `destruct()`), `isPreviewActive()`. Files: `src/easymde.ts`, `src/index.ts`.
7. **Form sync.** Listen for `submit` on the closest enclosing `<form>` and write the editor value into the textarea before submission; also add an `EditorView.updateListener` that copies on each change when `forceSync` is true. Files: `src/easymde.ts`.
8. **Web component decision.** Either (a) implement `<easy-markdown-editor>` as a thin wrapper that constructs `EasyMDE` on a slotted `<textarea>` (and forwards a few attributes → options), or (b) remove the stub. Recommended: (a), kept minimal and documented as "subset of the JS API". Files: `src/index.ts`.

### Milestone B — Toolbar feature parity

9. **Add `toggleLine` utility** for line-prefix markers. Operates on every line that intersects the selection, idempotently adds/removes a prefix. Tests in `src/utils/toggle-line.spec.ts`. Use it for blockquote, lists, headings.
10. **Heading buttons** (`heading-smaller`, `heading-bigger`, `heading-1..3`). Cycle `# → ## → ### → none` for smaller/bigger; explicit set for 1/2/3. File: `src/toolbar/buttons/toggle-heading.ts`.
11. **Quote, unordered list, ordered list, task list** via `toggleLine`. Honor `unorderedListStyle`. Files: `src/toolbar/buttons/{toggle-quote,toggle-ul,toggle-ol,toggle-task}.ts`.
12. **Code block** — distinguish from inline `code`. Wrap selection in ` ``` ` fences, language-tag opener if cursor is on a single line. File: `src/toolbar/buttons/toggle-code-block.ts`.
13. **Link / image insertion** with `promptURLs` honoring `window.prompt` (and an option for app-supplied prompt). Files: `src/toolbar/buttons/{draw-link,draw-image}.ts`.
14. **Horizontal rule, table, clean-block.** Files: `src/toolbar/buttons/{horizontal-rule,table,clean-block}.ts`.
15. **Undo/redo** — add `history()` to extensions and expose buttons. File: `src/toolbar/buttons/{undo,redo}.ts`.
16. **Keymap.** Build a CM6 `Prec.high` keymap matching V2's defaults (Ctrl/Cmd+B/I/K/L, Ctrl+Alt+1..6, etc.). File: `src/keymap.ts`. Make it overridable via `shortcuts` option in a later milestone — for MVP, ship the defaults.
17. **Custom toolbar.** Honor `toolbar: false`, `toolbar: array`, `hideIcons`, `showIcons`. Replace `defaultToolbar` import flow with a `buildToolbar(options)` resolver. Files: `src/toolbar/build-toolbar.ts`.

### Milestone C — Layout modes

18. **Side-by-side mode** — split the container 50/50, one side CM, the other a live-updating preview. Requires the preview pipeline from step 5 to debounce-render on doc updates.
19. **Fullscreen mode** — body class + container fills viewport; `Esc` exits.
20. **Theme + dark mode** — finalize the CSS variables in `src/styles.scss:5-10`, add a `[data-easymde-theme="dark"]` block and a `prefers-color-scheme: dark` default. Optional `theme` option overrides.

### Milestone D — Quality, a11y, docs

21. **Accessibility.** `role="toolbar"`, `aria-label` per button (use `title` text), `aria-pressed` for active toggles, restore `tabIndex` to 0 (current `-1` means tab skips the toolbar entirely), focus ring CSS. Verify with axe in a browser test.
22. **Tests.** Add vitest specs covering: `toggleLine`, `countWords` regex, preview render+sanitize, public API, form-submit sync, custom-toolbar resolution. Add a smoke E2E (Playwright or `@vitest/browser`) that loads `tests/index.html` and asserts a bold-button click.
23. **Demo.** Wire `vp dev` to serve `tests/index.html` against `src/index.ts` directly (currently it loads `dist/`). Add a few preset demos (default, custom toolbar, preview-only).
24. **Docs.** Re-purpose `README.md` to document the V3 API surface, options, and the migration delta from V2 (what's removed, renamed, behavior changes). The existing V2 README on the upstream repo is a useful template.
25. **Publish beta.** `npm publish --tag beta`, addressing the maintainer's promise in issue #447 ("I'll setup publishing of the v3 branch").

### Milestone E — Beyond first stable

26. Autosave plugin (extracted into `src/plugins/autosave.ts` to keep core small).
27. Image upload plugin: paste handler, drop zone overlay, file dialog, progress in status bar.
28. Custom shortcuts overrides + status bar item customization.
29. RTL support.
30. Spell-check decision: I'd recommend **dropping** the JS spellchecker entirely and documenting that consumers can set `spellcheck="true"` on the underlying contenteditable; this matches sentiment in #447 comments and reduces the dependency surface.

## 5. Decisions to lock in before coding

These came up while reading; flagging so they aren't deferred indefinitely:

- **Sanitization default**: ship DOMPurify (adds a dep but makes the editor safe by default), or escape-only and document `sanitizerFunction`?
- **Web component scope**: full attribute → option mapping, or just construct from a slotted textarea?
- **`toggleBlock` rewrite**: the maintainer's headline complaint is toolbar-intent ambiguity. Worth investing in a small "selection-intent" helper (`expandToWord` vs `expandToBlock` vs `keepRange`) and reusing it across all toolbar buttons. Then write tests that spell out the rule for cursor-mid-word, cursor-at-boundary, range-selection.
- **Construction API**: sync constructor + lazy-mount, or `await EasyMDE.create()`? Affects every example in the docs.
- **Whether to keep the `IEasyMDEPlugin` shape exposed in the public exports** — once you add multiple built-in plugins, third-party plugins become viable, but the API needs to be stable before the 3.0 ship.
