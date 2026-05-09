import { defineConfig } from "vite-plus";

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
                    "@lezer/*",
                    "@fortawesome/*",
                    "marked",
                    "escape-string-regexp",
                ],
            },
        },
        // TODO: Build for package managers
    ],
    test: {
        environment: "jsdom",
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
