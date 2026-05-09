# EasyMDE V3 — Overview & Scope

## Release phases

These labels appear in the **Scope split** table below:

| Label            | Meaning                                                                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MVP (beta.1)** | First shippable prerelease, `3.0.0-beta.1`: write Markdown, preview, core toolbar, sync construction, trimmed icons, minimal web component, baseline accessibility. |
| **Stable (1.0)** | **`EasyMDE v3.0.0`** on npm — not “major 1” of the product line; the first stable V3.                                                                               |
| **Post-1.0**     | After **`v3.0.0`** (`3.0.x+`), tracked in [milestone-e-post-stable.md](milestone-e-post-stable.md).                                                                 |

**Toolchain:** V3 builds with **Vite+** (`vp`); [issue #447](https://github.com/Ionaru/easy-markdown-editor/issues/447) mentions Rollup as an example of a modern bundler — the project satisfies “modern toolchain” without being Rollup-specific.

## Vision (from issue #447)

V3 is a ground-up rewrite motivated by legacy CodeMirror 2 debt, difficult maintenance, and an outdated build pipeline. The goals stated by the maintainer are:

- **TypeScript + SCSS** throughout
- **Fully ESM** module output
- **CodeMirror 6** as the editor core (replaces CM2)
- **Modular imports** — consumers can import only what they need
- **Plugin system** — extensibility without forking
- **No magic behaviour** — no automatic textarea detection; explicit construction only
- **Icon flexibility** — no forced full-FA-bundle download; custom SVG support
- **Modern `marked`** — latest version of the Markdown renderer
- **Built-in dark mode** — first-class theming via CSS custom properties

## Scope split

| Feature                                                                                                                             | MVP (beta.1) | Stable (1.0) | Post-1.0 |
| ----------------------------------------------------------------------------------------------------------------------------------- | :----------: | :----------: | :------: |
| Writing markdown in CodeMirror 6                                                                                                    |      ✅      |              |          |
| Preview rendering (marked + sanitize)                                                                                               |      ✅      |              |          |
| Core inline toolbar actions (bold/italic/strikethrough/code)                                                                        |      ✅      |              |          |
| Heading, quote, list, clean-block toolbar actions                                                                                   |      ✅      |              |          |
| Link & image insertion                                                                                                              |      ✅      |              |          |
| Horizontal rule, table                                                                                                              |      ✅      |              |          |
| Undo / redo                                                                                                                         |      ✅      |              |          |
| Keyboard shortcuts (default map)                                                                                                    |      ✅      |              |          |
| Consumer CodeMirror extensions (`codemirrorExtensions`)                                                                             |      ✅      |              |          |
| Form sync (textarea write-back on submit)                                                                                           |      ✅      |              |          |
| Public API (`value()`, `toTextArea()`, `isPreviewActive()`)                                                                         |      ✅      |              |          |
| Plugin lifecycle (mount/unmount)                                                                                                    |      ✅      |              |          |
| Trim FontAwesome bundle                                                                                                             |      ✅      |              |          |
| Accessibility (ARIA, keyboard toolbar nav)                                                                                          |      ✅      |              |          |
| Web component (`<easy-markdown-editor>`)                                                                                            |      ✅      |              |          |
| Side-by-side mode                                                                                                                   |              |      ✅      |          |
| Fullscreen mode                                                                                                                     |              |      ✅      |          |
| Dark mode / theming CSS vars                                                                                                        |              |      ✅      |          |
| Custom toolbar (hideIcons, showIcons, custom items)                                                                                 |              |      ✅      |          |
| Sanitizer hook / DOMPurify wiring                                                                                                   |              |      ✅      |          |
| E2E / integration tests                                                                                                             |              |      ✅      |          |
| Demo & docs                                                                                                                         |              |      ✅      |          |
| npm beta publish                                                                                                                    |              |      ✅      |          |
| Autosave plugin                                                                                                                     |              |              |    ✅    |
| Image upload (paste / drop / dialog)                                                                                                |              |              |    ✅    |
| Custom shortcut overrides                                                                                                           |              |              |    ✅    |
| Status bar customization                                                                                                            |              |              |    ✅    |
| RTL direction support                                                                                                               |              |              |    ✅    |
| Spellcheck decision                                                                                                                 |              |              |    ✅    |
| Task list (checkbox) toggle (`- [ ]` / `- [x]`)                                                                                     |              |      ✅      |          |
| Markdown guide / help toolbar action                                                                                                |              |      ✅      |          |
| Toolbar icons: non-FA / raw SVG (see Milestone A A4)                                                                                |              |      ✅      |          |
| Consumer lifecycle hooks (narrow callback set; [plugins-and-extensions.md §7](plugins-and-extensions.md#7-events--hooks-issue-447)) |              |      ✅      |          |
| `package.json` `exports` / subpath imports (single package)                                                                         |              |      ✅      |          |
| Optional multipackage split (`easymde-core`, etc.)                                                                                  |              |              |    ✅    |
| Extended event API (multi-subscriber / ordering guarantees)                                                                         |              |              |    ✅    |

**Canonical scope:** The table above is the single source of truth for what ships in each phase. Supporting docs defer to this file.

**Preview HTML safety:** MVP/beta ships preview behind a safe pipeline (minimal default: escaping / equivalent so preview never assigns raw unsanitized HTML). The Stable row **Sanitizer hook / DOMPurify wiring** denotes the finalized optional-peer dependency, documented overrides, and `renderingConfig` integration per [decisions.md](decisions.md) §2 — not permission to skip safety before that.

## Milestones

| #   | Name                   | Spec file                                                |
| --- | ---------------------- | -------------------------------------------------------- |
| A   | Foundations            | [milestone-a-foundations.md](milestone-a-foundations.md) |
| B   | Toolbar feature parity | [milestone-b-toolbar.md](milestone-b-toolbar.md)         |
| C   | Layout modes           | [milestone-c-layout.md](milestone-c-layout.md)           |
| D   | Quality, a11y, docs    | [milestone-d-quality.md](milestone-d-quality.md)         |
| E   | Post-stable additions  | [milestone-e-post-stable.md](milestone-e-post-stable.md) |

Supporting reference: [current-state.md](current-state.md), [gap-analysis.md](gap-analysis.md), [decisions.md](decisions.md), [plugins-and-extensions.md](plugins-and-extensions.md) (including [§7 — Events & hooks](plugins-and-extensions.md#7-events--hooks-issue-447))
