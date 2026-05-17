import { EditorState } from "@codemirror/state";
// eslint-disable-next-line @typescript-eslint/no-shadow
import { describe, expect, it } from "vitest";

import { blockContaining, findFenceBlocks } from "./fences.js";

const stateFor = (doc: string) => EditorState.create({ doc });

describe("findFenceBlocks", () => {
    it("returns an empty array when no fences are present", () => {
        expect.assertions(1);
        const state = stateFor("plain text\nanother line\n");
        expect(findFenceBlocks(state)).toEqual([]);
    });

    it("returns one block for a single backtick fence", () => {
        expect.assertions(3);
        const state = stateFor("```\ninner\n```\n");
        const blocks = findFenceBlocks(state);
        expect(blocks).toHaveLength(1);
        expect(blocks[0]?.open.number).toBe(1);
        expect(blocks[0]?.close?.number).toBe(3);
    });

    it("returns one block for a single tilde fence", () => {
        expect.assertions(3);
        const state = stateFor("~~~\ninner\n~~~\n");
        const blocks = findFenceBlocks(state);
        expect(blocks).toHaveLength(1);
        expect(blocks[0]?.open.number).toBe(1);
        expect(blocks[0]?.close?.number).toBe(3);
    });

    it("returns a block with null close when fence is unterminated", () => {
        expect.assertions(3);
        const state = stateFor("```\ninner\nstill inside\n");
        const blocks = findFenceBlocks(state);
        expect(blocks).toHaveLength(1);
        expect(blocks[0]?.open.number).toBe(1);
        expect(blocks[0]?.close).toBeNull();
    });

    it("requires the closing fence to be at least as long as the opener", () => {
        expect.assertions(3);
        const state = stateFor("````\ninner\n```\nstill inside\n````\n");
        const blocks = findFenceBlocks(state);
        expect(blocks).toHaveLength(1);
        expect(blocks[0]?.open.number).toBe(1);
        expect(blocks[0]?.close?.number).toBe(5);
    });

    it("requires the closing fence to use the same character as the opener", () => {
        expect.assertions(3);
        const state = stateFor("```\ninner\n~~~\nstill inside\n```\n");
        const blocks = findFenceBlocks(state);
        expect(blocks).toHaveLength(1);
        expect(blocks[0]?.open.number).toBe(1);
        expect(blocks[0]?.close?.number).toBe(5);
    });

    it("accepts fences indented up to three spaces", () => {
        expect.assertions(3);
        const state = stateFor("   ```\ninner\n   ```\n");
        const blocks = findFenceBlocks(state);
        expect(blocks).toHaveLength(1);
        expect(blocks[0]?.open.number).toBe(1);
        expect(blocks[0]?.close?.number).toBe(3);
    });

    it("rejects fences indented four or more spaces", () => {
        expect.assertions(1);
        const state = stateFor("    ```\ninner\n    ```\n");
        expect(findFenceBlocks(state)).toEqual([]);
    });

    it("returns multiple blocks in document order", () => {
        expect.assertions(5);
        const state = stateFor("```\na\n```\nbetween\n```\nb\n```\n");
        const blocks = findFenceBlocks(state);
        expect(blocks).toHaveLength(2);
        expect(blocks[0]?.open.number).toBe(1);
        expect(blocks[0]?.close?.number).toBe(3);
        expect(blocks[1]?.open.number).toBe(5);
        expect(blocks[1]?.close?.number).toBe(7);
    });

    it("returns an empty array for an empty document", () => {
        expect.assertions(1);
        const state = stateFor("");
        expect(findFenceBlocks(state)).toEqual([]);
    });
});

describe("blockContaining", () => {
    it("returns null when the line falls outside every block", () => {
        expect.assertions(1);
        const state = stateFor("```\na\n```\nbetween\n```\nb\n```\n");
        const blocks = findFenceBlocks(state);
        expect(blockContaining(blocks, 4)).toBeNull();
    });

    it("treats the opening fence line itself as inside the block", () => {
        expect.assertions(1);
        const state = stateFor("```\ninner\n```\n");
        const blocks = findFenceBlocks(state);
        expect(blockContaining(blocks, 1)?.open.number).toBe(1);
    });

    it("treats the closing fence line itself as inside the block", () => {
        expect.assertions(1);
        const state = stateFor("```\ninner\n```\n");
        const blocks = findFenceBlocks(state);
        expect(blockContaining(blocks, 3)?.close?.number).toBe(3);
    });

    it("treats every line past an unterminated opener as inside the block", () => {
        expect.assertions(1);
        const state = stateFor("```\ninner\nstill inside\n");
        const blocks = findFenceBlocks(state);
        expect(blockContaining(blocks, 3)?.open.number).toBe(1);
    });
});
