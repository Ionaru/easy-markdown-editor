import { defineConfig } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";

export default defineConfig({
    pack: [
        {
            target: ["chrome147", "firefox150", "safari26"],
            dts: {
                tsgo: true,
            },
            sourcemap: true,
            exports: true,
            minify: false,
            deps: {
                onlyBundle: false,
                alwaysBundle: [
                    "@codemirror/*",
                    "@fortawesome/*",
                    "@lezer/*",
                    "dompurify",
                    "escape-string-regexp",
                    "marked",
                ],
            },
        },
        // TODO: Build for package managers
    ],
    run: {
        tasks: {
            // Release-time changelog maintenance, invoked by bumpp's `execute` hook.
            changelog: {
                command: "node scripts/update-changelog.ts && vp fmt CHANGELOG.md --write",
                cache: false,
            },
            // Read-only validation, safe to run on every CI job.
            "changelog:check": {
                command: "node scripts/update-changelog.ts --check",
                cache: false,
            },
        },
    },
    test: {
        browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: "chromium" }, { browser: "firefox" }, { browser: "webkit" }],
        },
    },
    lint: {
        options: {
            typeAware: true,
            typeCheck: true,
        },
        rules: {
            "typescript/no-non-null-assertion": "error",
        },
    },
    fmt: {
        sortImports: true,
        sortPackageJson: true,
    },
});
