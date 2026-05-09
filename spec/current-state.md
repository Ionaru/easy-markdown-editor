# EasyMDE V3 — Current State

An audit of what is implemented, partially implemented, or stubbed in the V3 alpha as of the initial commits.

## Source map

```
src/
  index.ts                  — public entry point; exports EasyMDE + stubs web component
  imports.ts                — lazy-import helpers for Toolbar and defaultToolbar
  easymde.ts                — core EasyMDE class
  options.ts                — InputOptions / Options type definitions
  styles.scss               — CSS: toolbar, container, status bar; dark mode commented out
  errors/
    already-constructed-error.ts
    not-constructed-error.ts
  toolbar/
    toolbar.ts              — Toolbar class (IEasyMDEPlugin); builds button DOM
    default-toolbar.ts      — defaultToolbar constant (button definitions)
    buttons/
      toggle-bold.ts        — action + active check
      toggle-italic.ts      — action + active check
      toggle-strikethrough.ts — action only
      toggle-code.ts        — action only
  status-bar/
    status-bar.ts           — lines / words / chars / cursor pos display
  utils/
    toggle-block.ts         — inline marker toggle utility (tested)
    count-words.ts          — simple space-split word counter
    toggle-block.spec.ts    — 50+ vitest unit tests
```

## What works

| Subsystem                                         | Notes                                                                   |
| ------------------------------------------------- | ----------------------------------------------------------------------- |
| CodeMirror 6 mount                                | Line wrap, draw selection, Markdown language support                    |
| Syntax highlighting                               | Headings H1–H6 with proportional font sizes; monospace inline code      |
| Toolbar shell                                     | Renders buttons + separators; sections driven by `defaultToolbar`       |
| Bold button                                       | Toggle + active state detection                                         |
| Italic button                                     | Toggle + active state detection                                         |
| Strikethrough button                              | Toggle (no active state)                                                |
| Code button                                       | Toggle inline back-tick (no active state)                               |
| Status bar                                        | Lines, words, characters, cursor position; updates live                 |
| `toggleBlock` utility                             | Robust inline marker toggle tested across all selection/position combos |
| `construct()` / `destruct()`                      | Mount/unmount cycle; value written back on destruct                     |
| `AlreadyConstructedError` / `NotConstructedError` | Thrown correctly                                                        |
| Build pipeline                                    | Vite+ → ESM chunk split, d.ts, sourcemaps, inline all CM/lezer/FA deps  |

## What is rendered but does nothing

These toolbar buttons exist in `defaultToolbar` with no `action` set:

- heading
- quote
- unordered-list
- ordered-list
- clean-block
- link
- image

## What is stubbed / placeholder

- `<easy-markdown-editor>` custom element renders `"Hello World!"` (src/index.ts:9)
- `marked` is imported and pre-warmed with one call but never used to render anything
- Dark mode block in `styles.scss` is fully commented out
- The `Options` type resolves only 3 fields (`statusbar`, `toolbar`, `blockStyles`) — the remaining ~40 fields in `InputOptions` are decorative

## Known bugs

1. **Double-build risk**: `Toolbar` constructor builds its DOM, and `Toolbar.build()` also builds DOM. `easymde.ts:188` has the `build()` call commented out, but removing that comment would duplicate every button.
2. **Inline code vs code block**: the `code` button toggles a single back-tick. The toolbar icon and title say "Code" but the canonical action is fenced block (` ``` `). V2 treats these as two distinct buttons.
3. **`countWords` undercounts**: splits only on `" "`, so tab-separated or multi-space words register as one word. Should split on `/\s+/`.
4. **`construct()` is async but called from constructor** via `void`. Consumers can't know when the editor is ready; `isRendered` is a race condition.
5. **Status bar not an `IEasyMDEPlugin`**: it is constructed directly in `#createStatusBar` and never passed to `addPlugin`. This means `destruct()` does not call any cleanup on it.
6. **`addPlugin` stores but never calls `build()`**: the `IEasyMDEPlugin` interface exposes `build()` but no built-in plugin is actually triggered via `addPlugin`. Plugins build in their own constructors.
7. **FontAwesome full-bundle import**: `library.add(fas)` in `src/index.ts` imports all ~1400 solid icons. The issue #447 goal was to avoid this.
8. **No form sync**: submitting a `<form>` while the editor is mounted sends the original textarea value (the CM editor content is never written back until `destruct()`).
