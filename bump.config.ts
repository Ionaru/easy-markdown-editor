import { defineConfig } from "bumpp";

export default defineConfig({
    // `.npmrc` sets `tag-version-prefix=""`, so release tags are bare: 2.21.0, 3.0.0-beta.1.
    tag: "{version}",
    commit: "Release {version}",
    // Runs after the version is written and before the commit, so the promoted
    // changelog lands in the release commit.
    execute: "vp run changelog",
    // Without this, bumpp commits `package.json` by an explicit pathspec and the
    // changelog is left behind. Release from a clean working tree.
    all: true,
    // Pushing the tag is what triggers publishing, so it stays a deliberate step.
    push: false,
});
