import { Text } from "@codemirror/state";
// eslint-disable-next-line @typescript-eslint/no-shadow
import { describe, expect, it } from "vite-plus/test";

import { countWords } from "./count-words.js";

describe("countWords", () => {
    it.each([
        { name: "empty document", lines: [], expected: 0 },
        { name: "single word", lines: ["foo"], expected: 1 },
        { name: "space-separated words", lines: ["foo bar baz"], expected: 3 },
        { name: "multiple spaces", lines: ["foo  bar"], expected: 2 },
        { name: "tab separator", lines: ["foo\tbar"], expected: 2 },
        { name: "leading and trailing whitespace", lines: ["  foo  "], expected: 1 },
        { name: "whitespace-only line", lines: ["   "], expected: 0 },
        { name: "multiple lines", lines: ["foo", "bar baz"], expected: 3 },
        { name: "blank lines between content", lines: ["foo", "", "bar"], expected: 2 },
        { name: "mixed whitespace and lines", lines: ["foo\tbar baz", "qux"], expected: 4 },
    ])("counts $expected for $name", ({ lines, expected }) => {
        expect(countWords(lines.length === 0 ? Text.empty : Text.of(lines))).toBe(expected);
    });
});
