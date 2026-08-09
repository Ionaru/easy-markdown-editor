# Contributing

Thank you so much for your interest in contributing to EasyMDE!

## Asking questions, suggesting ideas or reporting bugs

You can [submit an issue](https://github.com/Ionaru/easy-markdown-editor/issues) on this GitHub repository.

## Coding

### Prerequisites

This project uses [Vite+](https://viteplus.dev), a unified toolchain driven by the `vp` CLI, and [pnpm](https://pnpm.io) as its package manager. You will need an up-to-date LTS or current version of Node.js. See [AGENTS.md](./AGENTS.md) for an overview of the toolchain.

Please find information about installing Node.js on [the official Node.js website](https://nodejs.org/en/download/).

### Workflow

Please make sure any code you submit is compliant and compatible with this repository's [license](./LICENSE).

#### Your first pull request

1. [Create a fork of this project](https://github.com/Ionaru/easy-markdown-editor/fork).
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/easy-markdown-editor.git`.
3. Add the original repository as a remote to keep it up-to-date: `git remote add upstream https://github.com/Ionaru/easy-markdown-editor.git`.
4. Fetch the latest changes from upstream: `git fetch upstream`.
5. Run `vp install` to install the required dependencies.
6. Create a new branch to work on: `git switch -c MyNewFeatureName`.
7. Write your awesome improvement and commit your work.
8. Make sure your changes comply with the established code and that tests succeed: `vp check` (format, lint, type-check) and `vp test`.
9. Push your changes to GitHub: `git push origin`.
10. On GitHub, go to your forked branch, and click **New pull request**.
11. Choose the correct branches, add a description and submit your pull request!

To preview your changes in a live demo, run `pnpm dev:app` (which runs `vp dev --port 5173 --strictPort`) and open <http://localhost:5173/tests/index.html>. Source is served from `src/` with hot-module reload, so there is no build step while developing.

#### Continuing development

To create more pull requests, please follow the steps below:

1. Go back to the main branch: `git switch master`.
2. Fetch the upstream changes: `git fetch upstream`.
3. Update your branch with upstream changes: `git merge upstream/master`.
4. Repeat ["Your first pull request"](#your-first-pull-request) from step 5.

Thank you! 💜
