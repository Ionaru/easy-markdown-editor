// eslint-disable-next-line @typescript-eslint/no-shadow
import { describe, expect, it } from "vite-plus/test";

import { firstCellOffset } from "./table.js";

describe("firstCellOffset", () => {
    it("points just after the first '| ' marker of the default template", () => {
        expect.assertions(1);
        const template =
            "\n\n| Column 1 | Column 2 | Column 3 |\n" +
            "| -------- | -------- | -------- |\n" +
            "| Text     | Text     | Text     |\n\n";
        expect(firstCellOffset(template)).toBe(4);
    });

    it("skips any number of spaces after the pipe", () => {
        expect.assertions(1);
        expect(firstCellOffset("|    Text |")).toBe(5);
    });

    it("falls back to the end when there is no pipe", () => {
        expect.assertions(1);
        expect(firstCellOffset("no table here")).toBe(13);
    });
});
