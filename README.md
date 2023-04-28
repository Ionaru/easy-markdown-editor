# EasyMDE - Markdown Editor

[![npm version](https://img.shields.io/npm/v/easymde.svg?style=for-the-badge)](https://www.npmjs.com/package/easymde)
[![npm version](https://img.shields.io/npm/v/easymde/next.svg?style=for-the-badge)](https://www.npmjs.com/package/easymde/v/next)
[![Build Status](https://img.shields.io/github/actions/workflow/status/ionaru/easy-markdown-editor/cd.yaml?branch=master&style=for-the-badge)](https://github.com/Ionaru/easy-markdown-editor/actions?query=branch%3Amaster)

> This repository is a fork of
> [SimpleMDE, made by Sparksuite](https://github.com/sparksuite/simplemde-markdown-editor/).
> Go to the [dedicated section](#simplemde-fork) for more information.

A drop-in JavaScript textarea replacement for writing beautiful and understandable Markdown.
EasyMDE allows users who may be less experienced with Markdown to use familiar toolbar buttons and shortcuts.

In addition, the syntax is rendered while editing to clearly show the expected result. Headings are larger, emphasized words are italicized, links are underlined, etc.

EasyMDE also features both built-in auto saving and spell checking.
The editor is entirely customizable, from theming to toolbar buttons and javascript hooks.

[**Try the demo**](https://stackblitz.com/edit/easymde)

[![Preview](https://user-images.githubusercontent.com/3472373/51319377-26fe6e00-1a5d-11e9-8cc6-3137a566796d.png)](https://stackblitz.com/edit/easymde)

## Quick access

-   [EasyMDE - Markdown Editor](#easymde---markdown-editor)
    -   [Quick access](#quick-access)
    -   [Install EasyMDE](#install-easymde)
    -   [How to use](#how-to-use)
    -   [How it works](#how-it-works)
    -   [SimpleMDE fork](#simplemde-fork)
    -   [Contributing](#contributing)
    -   [License](#license)

## Install EasyMDE

Via [npm](https://www.npmjs.com/package/easymde):

```
npm install easymde
```

## How to use

TBD

## How it works

EasyMDE is a continuation of SimpleMDE.

SimpleMDE began as an improvement of [lepture's Editor project](https://github.com/lepture/editor), but has now taken on an identity of its own. It is bundled with [CodeMirror](https://github.com/codemirror/codemirror) and depends on [Font Awesome](http://fontawesome.io).

CodeMirror is the backbone of the project and parses much of the Markdown syntax as it's being written. This allows us to add styles to the Markdown that's being written. Additionally, a toolbar and status bar have been added to the top and bottom, respectively. Previews are rendered by [Marked](https://github.com/chjj/marked) using GitHub Flavored Markdown (GFM).

## SimpleMDE fork

I originally made this fork to implement FontAwesome 5 compatibility into SimpleMDE. When that was done I submitted a [pull request](https://github.com/sparksuite/simplemde-markdown-editor/pull/666), which has not been accepted yet. This, and the project being inactive since May 2017, triggered me to make more changes and try to put new life into the project.

Changes include:

-   FontAwesome 5 compatibility
-   Guide button works when editor is in preview mode
-   Links are now `https://` by default
-   Small styling changes
-   Support for Node 8 and beyond
-   Lots of refactored code
-   Links in preview will open in a new tab by default
-   TypeScript support

My intention is to continue development on this project, improving it and keeping it alive.

## Contributing

Want to contribute to EasyMDE? Thank you! We have a [contribution guide](./CONTRIBUTING.md) just for you!

## License

This project is released under the [MIT License](./LICENSE).

-   Copyright (c) 2015 Sparksuite, Inc.
-   Copyright (c) 2017 Jeroen Akkerman.
