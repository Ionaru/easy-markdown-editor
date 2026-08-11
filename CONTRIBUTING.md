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

## Releasing

A release goes out through a pull request, so the version bump gets the same review as any other change. Changelog entries are always written by hand; only the mechanical parts are automated.

1. Write the entries for the release under `## [Unreleased]` in [CHANGELOG.md](./CHANGELOG.md). Reference issues, pull requests and contributors with the shorthand link syntax the file already uses: `(Thanks to [@someone], [#123])`. You do not need to add the matching `[#123]: …` definitions, they are generated for you.
2. Merge that as a normal pull request.
3. From a clean checkout of the branch you are releasing (`master` for 2.x, `v3` for 3.x), run `pnpm release` and pick the new version. This creates a `release/<version>` branch, bumps the version, promotes `## [Unreleased]` to it, refreshes the compare links, generates the missing reference definitions (asking GitHub whether each number is an issue or a pull request), commits, pushes the branch, and offers to open the pull request for you. It never writes to the branch you released from. No tag is created locally.
4. Review the release pull request and merge it. The `release` job in [`cd.yaml`](./.github/workflows/cd.yaml) then tags the merge commit and starts the publish run for that tag, which builds, packs and publishes to npm using trusted publishing. The dist-tag follows the version: `3.0.0-beta.1` publishes to `beta`, `3.0.0-rc.1` to `rc`, and `3.0.0` to `latest`.

If a merge somehow produces no release run, the tag is all that is needed: pushing `<version>` by hand enters exactly the same publish path.

Every push and pull request also runs the audit, check, test and build jobs in that workflow. `vp run changelog:check` is one of them: it fails on a reference link that no release will ever define, while reporting the ones still waiting under `## [Unreleased]`, which is where the definitions you left out get generated.

> **3.0.0-beta.1 is the exception.** Its section and compare links were promoted by hand, and `package.json` already carries the version, so there is no release pull request to merge. Pushing the `3.0.0-beta.1` tag publishes it. Releases after it follow the steps above.

Thank you! 💜
