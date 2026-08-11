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
        // Splitting these keeps the release tooling's unit tests, which touch no
        // DOM at all, out of the browser matrix instead of running them once per
        // browser. Only `projects` is consulted once it is set, so the browser
        // configuration has to live inside its project rather than out here.
        projects: [
            {
                extends: true,
                test: {
                    name: "node",
                    environment: "node",
                    include: ["scripts/**/*.spec.ts"],
                },
            },
            {
                extends: true,
                test: {
                    name: "browser",
                    include: ["src/**/*.spec.ts"],
                    browser: {
                        enabled: true,
                        provider: playwright(),
                        headless: true,
                        // Named explicitly: an instance of a project that has a
                        // name of its own would otherwise be "browser (chromium)",
                        // and CI selects these by the bare browser name.
                        instances: [
                            { browser: "chromium", name: "chromium" },
                            { browser: "firefox", name: "firefox" },
                            { browser: "webkit", name: "webkit" },
                        ],
                    },
                },
            },
        ],
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
