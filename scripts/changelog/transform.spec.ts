// eslint-disable-next-line @typescript-eslint/no-shadow
import { describe, expect, it } from "vite-plus/test";

import {
    blockRange,
    ChangelogError,
    findAnchor,
    insertNumberDefinition,
    insertUserDefinition,
    joinLines,
    missingRefs,
    parseRepository,
    promoteUnreleased,
    splitLines,
    updateVersionLinks,
    validateStructure,
} from "./transform.ts";

const REPOSITORY = {
    owner: "Ionaru",
    name: "easy-markdown-editor",
    url: "https://github.com/Ionaru/easy-markdown-editor",
};

/** A miniature changelog with the same shape as the real one. */
const fixture = (): string[] =>
    splitLines(
        `# EasyMDE Changelog

## [Unreleased]

### Added

- A thing (Thanks to [@someone], [#42]).

## [2.21.0] - 2026-05-03

### Fixed

- A bug ([#7]).

<!-- Linked issues -->

[#7]: https://github.com/Ionaru/easy-markdown-editor/issues/7

<!-- Linked PRs -->

[#631]: https://github.com/Ionaru/easy-markdown-editor/pull/631
[#19]: https://github.com/Ionaru/easy-markdown-editor/pull/19

<!-- Linked users -->

[@dependabot]: https://github.com/dependabot

<!-- Linked versions -->

[Unreleased]: https://github.com/Ionaru/easy-markdown-editor/compare/2.21.0...HEAD
[2.21.0]: https://github.com/Ionaru/easy-markdown-editor/compare/2.20.0...2.21.0
`,
    ).lines;

describe("splitLines / joinLines", () => {
    it("round-trips a trailing newline", () => {
        const { lines, eol } = splitLines("a\nb\n");
        expect(lines).toStrictEqual(["a", "b"]);
        expect(joinLines(lines, eol)).toBe("a\nb\n");
    });

    it("round-trips CRLF without mixing line endings", () => {
        const { lines, eol } = splitLines("a\r\nb\r\n");
        expect(lines).toStrictEqual(["a", "b"]);
        expect(eol).toBe("\r\n");
        expect(joinLines(lines, eol)).toBe("a\r\nb\r\n");
    });

    it("keeps a deliberate blank final line", () => {
        expect(splitLines("a\n\n").lines).toStrictEqual(["a", ""]);
    });
});

describe("parseRepository", () => {
    it.each([
        "git+https://github.com/Ionaru/easy-markdown-editor.git",
        "https://github.com/Ionaru/easy-markdown-editor",
        "git@github.com:Ionaru/easy-markdown-editor.git",
    ])("reads the slug out of %s", (url) => {
        expect(parseRepository(url)).toStrictEqual(REPOSITORY);
    });

    it("rejects a non-GitHub url", () => {
        expect(() => parseRepository("https://gitlab.com/a/b.git")).toThrow(ChangelogError);
    });
});

describe("findAnchor", () => {
    it("throws when the marker is missing", () => {
        expect(() => findAnchor(["a"], "<!-- Linked issues -->")).toThrow(/missing/);
    });

    it("throws when the marker is duplicated", () => {
        expect(() => findAnchor(["x", "x"], "x")).toThrow(/2 "x" markers/);
    });
});

describe("blockRange", () => {
    it("covers the definitions up to the closing blank line", () => {
        const lines = ["<!-- A -->", "", "one", "two", "", "<!-- B -->"];
        expect(blockRange(lines, 0)).toStrictEqual([2, 4]);
    });

    it("stops at the end of the file", () => {
        expect(blockRange(["<!-- A -->", "", "one"], 0)).toStrictEqual([2, 3]);
    });
});

describe("missingRefs", () => {
    it("reports usages that have no definition and ignores defined ones", () => {
        expect(missingRefs(fixture())).toStrictEqual({ numbers: [42], users: ["someone"] });
    });

    it("does not mistake a definition for a usage", () => {
        expect(missingRefs(["[#7]: https://example.com/7"])).toStrictEqual({
            numbers: [],
            users: [],
        });
    });
});

describe("validateStructure", () => {
    it("accepts the fixture", () => {
        expect(() => {
            validateStructure(fixture());
        }).not.toThrow();
    });

    it("rejects a file with no Unreleased heading", () => {
        expect(() => {
            validateStructure(fixture().filter((line) => line !== "## [Unreleased]"));
        }).toThrow(ChangelogError);
    });
});

describe("promoteUnreleased", () => {
    it("retitles Unreleased and opens a fresh one", () => {
        const lines = fixture();
        expect(promoteUnreleased(lines, "3.0.0-beta.1", "2026-08-09")).toBe("2.21.0");
        expect(lines.slice(2, 5)).toStrictEqual([
            "## [Unreleased]",
            "",
            "## [3.0.0-beta.1] - 2026-08-09",
        ]);
    });

    it("refuses to release a version that already has a section", () => {
        expect(() => promoteUnreleased(fixture(), "2.21.0", "2026-08-09")).toThrow(
            /already has a "2.21.0" section/,
        );
    });

    it("refuses when there is nothing to compare against", () => {
        const lines = ["# Changelog", "", "## [Unreleased]", ""];
        expect(() => promoteUnreleased(lines, "1.0.0", "2026-08-09")).toThrow(
            /no released version/,
        );
    });
});

describe("updateVersionLinks", () => {
    it("repoints Unreleased and inserts the released compare link", () => {
        const lines = fixture();
        updateVersionLinks(lines, "3.0.0-beta.1", "2.21.0", REPOSITORY.url);

        const [start] = blockRange(lines, findAnchor(lines, "<!-- Linked versions -->"));
        expect(lines.slice(start, start + 2)).toStrictEqual([
            `[Unreleased]: ${REPOSITORY.url}/compare/3.0.0-beta.1...HEAD`,
            `[3.0.0-beta.1]: ${REPOSITORY.url}/compare/2.21.0...3.0.0-beta.1`,
        ]);
    });

    it("refuses when the block does not start with the Unreleased link", () => {
        const lines = fixture().filter((line) => !line.startsWith("[Unreleased]: "));
        expect(() => {
            updateVersionLinks(lines, "3.0.0", "2.21.0", REPOSITORY.url);
        }).toThrow(ChangelogError);
    });
});

describe("insertNumberDefinition", () => {
    const definitionsIn = (lines: readonly string[], anchor: string): string[] => {
        const [start, end] = blockRange(lines, findAnchor(lines, anchor));
        return lines.slice(start, end);
    };

    it("keeps the pull-request block descending", () => {
        const lines = fixture();
        insertNumberDefinition(lines, 100, "pull", REPOSITORY);
        expect(definitionsIn(lines, "<!-- Linked PRs -->")).toStrictEqual([
            `[#631]: ${REPOSITORY.url}/pull/631`,
            `[#100]: ${REPOSITORY.url}/pull/100`,
            `[#19]: ${REPOSITORY.url}/pull/19`,
        ]);
    });

    it("appends the smallest number at the end of the block", () => {
        const lines = fixture();
        insertNumberDefinition(lines, 1, "pull", REPOSITORY);
        expect(definitionsIn(lines, "<!-- Linked PRs -->").at(-1)).toBe(
            `[#1]: ${REPOSITORY.url}/pull/1`,
        );
    });

    it("puts issues in the issue block, not the pull-request block", () => {
        const lines = fixture();
        insertNumberDefinition(lines, 500, "issues", REPOSITORY);
        expect(definitionsIn(lines, "<!-- Linked issues -->")).toStrictEqual([
            `[#500]: ${REPOSITORY.url}/issues/500`,
            `[#7]: ${REPOSITORY.url}/issues/7`,
        ]);
        expect(definitionsIn(lines, "<!-- Linked PRs -->")).toHaveLength(2);
    });
});

describe("insertUserDefinition", () => {
    it("appends rather than sorting, matching the block's insertion order", () => {
        const lines = fixture();
        insertUserDefinition(lines, "aardvark");
        const [start, end] = blockRange(lines, findAnchor(lines, "<!-- Linked users -->"));
        expect(lines.slice(start, end)).toStrictEqual([
            "[@dependabot]: https://github.com/dependabot",
            "[@aardvark]: https://github.com/aardvark",
        ]);
    });
});

describe("a full release pass", () => {
    it("is idempotent for the reference blocks and refuses a second promotion", () => {
        const lines = fixture();
        const previous = promoteUnreleased(lines, "3.0.0-beta.1", "2026-08-09");
        updateVersionLinks(lines, "3.0.0-beta.1", previous, REPOSITORY.url);
        for (const number of missingRefs(lines).numbers) {
            insertNumberDefinition(lines, number, "pull", REPOSITORY);
        }
        for (const user of missingRefs(lines).users) {
            insertUserDefinition(lines, user);
        }

        expect(missingRefs(lines)).toStrictEqual({ numbers: [], users: [] });
        expect(() => promoteUnreleased(lines, "3.0.0-beta.1", "2026-08-09")).toThrow(
            /already has a "3.0.0-beta.1" section/,
        );
    });
});
