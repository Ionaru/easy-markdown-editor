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
    test: {
        browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: "chromium" }],
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
