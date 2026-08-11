import { execFileSync } from "node:child_process";

import { defineConfig } from "bumpp";

/**
 * Releases are cut from whichever branch carries the line being released, so
 * the base is taken from the checkout rather than pinned. bumpp otherwise
 * derives it from `origin/HEAD` and falls back to a hard-coded `main`, which is
 * wrong for this repository twice over. Leaving it undefined when the branch
 * cannot be read hands the question back to bumpp.
 */
const currentBranch = (): string | undefined => {
    try {
        const branch = execFileSync("git", ["branch", "--show-current"], {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
        }).trim();
        return branch === "" ? undefined : branch;
    } catch {
        return undefined;
    }
};

export default defineConfig({
    commit: "Release {version}",
    // The tag is created by CI once the release pull request is merged, so no
    // local one is made. bumpp would clear the default itself, with a warning on
    // every release; this says the same thing quietly. It also rules out the
    // `{tag}` template token, which hard-codes a `v` prefix whenever no local tag
    // is being made: the templates here use `{version}`.
    tag: false,
    // Runs on the release branch after the version is written and before the
    // commit, so the promoted changelog lands in the release commit.
    execute: "vp run changelog",
    // Without this, bumpp commits `package.json` by an explicit pathspec and the
    // changelog is left behind. Release from a clean working tree.
    all: true,
    // Required by `pr`, and only ever used to push the release branch: the base
    // branch is still only written through a merged pull request.
    push: true,
    pr: {
        base: currentBranch(),
        // `.npmrc` sets `tag-version-prefix=""` and CI derives the tag from this
        // branch name, so the release tags stay bare: 2.21.0, 3.0.0-beta.1.
        // bumpp's own default template carries a `v`.
        branch: "release/{version}",
    },
});
