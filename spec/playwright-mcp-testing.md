# Playwright MCP Testing Harness

Live, source-driven manual + agent-driven exploratory testing of EasyMDE. Source modules served by Vite+ dev server with HMR — no `dist/` rebuild between edits. An LLM agent with the Playwright MCP plugin can drive the editor directly.

## When to use this vs `vp test`

| Use case | Tool |
|----------|------|
| Logic, regressions, contracts | `vp test` (vitest browser mode, 224 specs in `src/**/*.spec.ts`) |
| Cursor caret position, toolbar active states, preview render, visual flows | Playwright MCP harness |
| Reproducing a user-reported bug interactively | Playwright MCP harness |
| Sanity check that source changes work in a real browser before running suites | Playwright MCP harness |

`vp test` is authoritative — MCP harness is for human-in-the-loop and agent exploration only.

## Starting the dev server

```bash
pnpm dev:app
```

Runs `vp dev --port 5173 --strictPort`. Leave running in a dedicated terminal. HMR is active — edits to `src/**/*.{ts,scss}` push to the connected browser without reload.

The harness lives at:

```
http://localhost:5173/tests/dev.html
```

`tests/dev.html` imports `/src/index.ts` directly. There is no build step in the dev loop.

## What the harness exposes

`tests/dev.html` mounts an `EasyMDE` against a textarea and a sibling `<easy-markdown-editor>` web component, then publishes:

| Global | Purpose |
|--------|---------|
| `window.editor` | Active `EasyMDE` instance |
| `window.resetEditor()` | Destroy + remount with default content |
| `window.waitForIdle()` | Resolves after two `requestAnimationFrame` frames — use after dispatching CodeMirror updates |
| `window.__devReady` | `true` once initial mount completes |

A live state mirror sits in `#cm-state` (also `[data-testid="cm-state"]`) with these dataset attrs synced on input/keyup/mouseup:

| Attr | Value |
|------|-------|
| `data-value` | Full doc string |
| `data-from` | Selection anchor offset |
| `data-to` | Selection head offset |
| `data-length` | Doc length |

## Driving via Playwright MCP

Launch and probe:

```js
mcp__plugin_playwright_playwright__browser_navigate("http://localhost:5173/tests/dev.html")

mcp__plugin_playwright_playwright__browser_evaluate(`() => ({
  ready: window.__devReady,
  value: window.editor.value,
  sel: window.editor.codemirror.state.selection.main,
})`)
```

Set selection programmatically (more reliable than simulating keyboard for setup):

```js
window.editor.codemirror.dispatch({ selection: { anchor: 2, head: 7 } })
```

Read selection / doc:

```js
const cm = window.editor.codemirror
const { from, to } = cm.state.selection.main
const doc = cm.state.doc.toString()
```

## Toolbar button selectors

All default toolbar buttons live under `.easymde-toolbar` and carry a stable class equal to the action key. Click via:

```
.easymde-toolbar button.<class>
```

Available classes:

```
bold  italic  strikethrough  heading  code  quote
unordered-list  ordered-list  clean-block
link  image  preview  guide
```

Note: when the web component is also present the page contains two `.easymde-toolbar` instances. Scope queries to the textarea's editor with:

```js
document.querySelector('#editor-textarea + .EasyMDEContainer .easymde-toolbar button.bold')
```

…or use the simpler form `document.querySelectorAll('.easymde-toolbar')[0]` if order is acceptable.

## Recipe: assert a toolbar action wraps the selection

```js
mcp__plugin_playwright_playwright__browser_evaluate(`() => {
  const ed = window.editor
  ed.codemirror.dispatch({ selection: { anchor: 2, head: 7 } })
  document.querySelector('.easymde-toolbar button.bold').click()
  const { from, to } = ed.codemirror.state.selection.main
  return { value: ed.value, from, to }
}`)
```

Expected: `value` contains `**Hello**`, `from`/`to` land between or around the inserted markers depending on action.

## Recipe: type into the editor

Programmatic — preferred for state setup:

```js
window.editor.value = "new doc content"
```

Real keyboard simulation — preferred for testing input handling:

```js
mcp__plugin_playwright_playwright__browser_click("textarea[role='textbox']") // focus
mcp__plugin_playwright_playwright__browser_press_key("Enter")
mcp__plugin_playwright_playwright__browser_type("hello")
```

After any keyboard sim, follow with `window.waitForIdle()` before reading state.

## Recipe: reset between scenarios

```js
mcp__plugin_playwright_playwright__browser_evaluate("() => window.resetEditor()")
```

Cheaper than navigating — keeps the page + HMR connection.

## Troubleshooting

**MCP says `Chromium distribution 'chrome' is not found at /opt/google/chrome/chrome`.**
Run `npx playwright install chrome` (needs sudo for system deps on Linux).

**Port 5173 already taken.**
The dev script uses `--strictPort` so `vp dev` exits immediately. Find and kill the holder: `ss -tlnp | grep 5173`.

**Edits to `src/` don't appear in the browser.**
Confirm the page is open at `:5173`, not `:5500` (Live Server) or `tests/index.html` (which loads `dist/`). `tests/dev.html` is the harness; `tests/index.html` is a manual `dist/` playground.

**`window.editor.value()` throws "is not a function".**
`value` is a getter, not a method — use `window.editor.value`.

## Files

- `tests/dev.html` — harness page
- `package.json` — `dev:app` script
- `src/index.ts` — entry imported live by the harness
