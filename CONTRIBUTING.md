# Contributing

Thank you so much for your interest in contributing to EasyMDE!

## Asking questions, suggesting ideas or reporting bugs

You can [submit an issue](https://github.com/Ionaru/easy-markdown-editor/issues) on this GitHub repository.

## Coding

### Prerequisites

To contribute code to this project you'll need an up-to-date LTS or current version of Node.js and npm.

Please find information about the installation on [the official Node.js website](https://nodejs.org/en/download/).

### Workflow

Please make sure any code you submit is compliant and compatible with this repository's [license](./LICENSE).

#### Your first pull request

1. [Create a fork of this project](https://github.com/Ionaru/easy-markdown-editor/fork).
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/easy-markdown-editor.git`.
3. Add the original repository as remote to keep it up-to-date: `git remote add upstream https://github.com/Ionaru/easy-markdown-editor.git`.
4. Fetch the latest changes from upstream: `git fetch upstream`.
5. Run `npm ci` to install the required dependencies.
6. Create a new branch to work on: `git switch -c MyNewFeatureName`.
7. Write your awesome improvement and commit your work.
8. Make sure your changes comply with the established code and tests succeed: `npm test`.
9. Push your changes to GitHub: `git push origin`.
10. On GitHub, go to your forked branch, and click **New pull request**.
11. Choose the correct branches, add a description and submit your pull request!

#### Continuing development

To create more pull requests, please follow the steps below:

1. Go back to the master branch: `git switch master`.
2. Fetch the upstream changes: `git fetch upstream`.
3. Update the master branch with upstream changes: `git merge upstream/master`.
4. Repeat ["Your first pull request"](#your-first-pull-request) from step 5.

Thank you! 💜
