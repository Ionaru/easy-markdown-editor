import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
// eslint-disable-next-line @typescript-eslint/no-shadow
import { afterEach, describe, expect, it } from "vite-plus/test";

import { checkCodeBlock, toggleCodeBlock } from "./toggle-code-block.js";

const views: EditorView[] = [];

const getEditor = (document: string, selection?: { anchor: number; head?: number }) => {
    const view = new EditorView({
        state: EditorState.create({
            doc: document,
            extensions: [markdown({ base: markdownLanguage })],
            selection,
        }),
    });
    views.push(view);
    return view;
};

afterEach(() => {
    while (views.length > 0) views.pop()?.destroy();
});

describe("toggleCodeBlock — insert (empty selection)", () => {
    it("inserts a fenced template with the cursor on the blank middle line", () => {
        expect.assertions(2);
        const editor = getEditor("", { anchor: 0 });
        toggleCodeBlock(editor);
        expect(editor.state.doc.toString()).toBe("```\n\n```");
        expect(editor.state.selection.main.head).toBe(4);
    });

    it("keeps the fences on their own lines when the cursor is mid-line", () => {
        expect.assertions(2);
        const editor = getEditor("abc", { anchor: 2 });
        toggleCodeBlock(editor);
        expect(editor.state.doc.toString()).toBe("ab\n```\n\n```\nc");
        expect(editor.state.selection.main.head).toBe(7);
    });
});

describe("toggleCodeBlock — wrap (non-empty selection)", () => {
    it("wraps a multi-line selection in fences on their own lines", () => {
        expect.assertions(1);
        const editor = getEditor("a\nb\n", { anchor: 0, head: 3 });
        toggleCodeBlock(editor);
        expect(editor.state.doc.toString()).toBe("```\na\nb\n```\n");
    });

    it("wraps a single-line selection in fences", () => {
        expect.assertions(1);
        const editor = getEditor("foo", { anchor: 0, head: 3 });
        toggleCodeBlock(editor);
        expect(editor.state.doc.toString()).toBe("```\nfoo\n```");
    });
});

describe("toggleCodeBlock — unwrap (selection inside a fence)", () => {
    it("removes backtick fences when the cursor is inside", () => {
        expect.assertions(1);
        const editor = getEditor("```\na\nb\n```\n", { anchor: 5 });
        toggleCodeBlock(editor);
        expect(editor.state.doc.toString()).toBe("a\nb\n");
    });

    it("removes tilde fences when the cursor is inside", () => {
        expect.assertions(1);
        const editor = getEditor("~~~\ninner\n~~~\n", { anchor: 6 });
        toggleCodeBlock(editor);
        expect(editor.state.doc.toString()).toBe("inner\n");
    });

    it("removes the opening fence only when the block is unterminated", () => {
        expect.assertions(1);
        const editor = getEditor("```\ninner\n", { anchor: 6 });
        toggleCodeBlock(editor);
        expect(editor.state.doc.toString()).toBe("inner\n");
    });

    it("round-trips: wrap then unwrap restores the original", () => {
        expect.assertions(2);
        const editor = getEditor("a\nb\n", { anchor: 0, head: 3 });
        toggleCodeBlock(editor);
        expect(editor.state.doc.toString()).toBe("```\na\nb\n```\n");
        toggleCodeBlock(editor);
        expect(editor.state.doc.toString()).toBe("a\nb\n");
    });
});

describe("checkCodeBlock", () => {
    it("is true when the cursor is inside a fence", () => {
        expect.assertions(1);
        const editor = getEditor("```\ninner\n```\n", { anchor: 6 });
        expect(checkCodeBlock(editor)).toBe(true);
    });

    it("is false when the cursor is outside any fence", () => {
        expect.assertions(1);
        const editor = getEditor("plain text\n", { anchor: 2 });
        expect(checkCodeBlock(editor)).toBe(false);
    });
});
