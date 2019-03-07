# Contributing

Hey, welcome to the party! 🎉

Thank you so much for contributing to EasyMDE. 😘


## Asking questions, suggesting wonderful ideas or reporting bugs

You can [submit an issue️](https://github.com/Ionaru/easy-markdown-editor/issues/new) on this GitHub repository.


## Coding

### 📦 Prerequisites

You need Node.js and npm.

To install them on Debian-based systems:

```bash
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
echo -e "nodejs version:\t$(nodejs -v) \nnpm version:\t$(npm -v)"
# check that you have node.js and npm.
```

For other systems, please [read the official page](https://nodejs.org/en/download/).


### 🏗️ Installation

Here we go! 🤠 First, clone this repository:

```bash
git clone https://github.com/Ionaru/easy-markdown-editor.git
cd easy-markdown-editor
```

Then install the required dependencies:

```bash
npm install
```

Yay! You are ready! 🍾


### ⤴️ Creating a pull request

1. First, [create a fork of this project](https://github.com/Ionaru/easy-markdown-editor/fork), and copy the https URL (*clone or download* button) of your project (something like https://github.com/YOUR_USERNAME/easy-markdown-editor.git );
2. a) If you already cloned and worked on the project: `git remote add source https://github.com/Ionaru/easy-markdown-editor.git`;
b) Otherwise, clone your fork: `git clone https://github.com/YOUR_USERNAME/easy-markdown-editor.git`;
3. Create a new dedicated branch `git checkout -b myMergeRequest`;
4. Write some nice code and commit your work. (Don't forget to add your changes to the changelog!);
5. Check files against the ESLint syntax and build minified versions: `gulp`;
6. Test your changes;
7. Push it to a dedicated branch `git push origin myMergeRequest`;
8. Go to the [main project page](https://github.com/Ionaru/easy-markdown-editor) and click on the button *Compare and pull request*, then fill the description.

If you want to make other pull requests, go back to the master branch (`git checkout master`), update it (`git pull --rebase source master`), then follow the instructions above from step 3.

Thank you! 💜
