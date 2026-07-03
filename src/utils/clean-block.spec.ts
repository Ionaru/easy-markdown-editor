import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
// eslint-disable-next-line @typescript-eslint/no-shadow
import { afterEach, describe, expect, it } from "vite-plus/test";

import { cleanBlock } from "./clean-block.js";

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

describe("cleanBlock — single-line strip", () => {
    it("leaves a bare paragraph untouched", () => {
        expect.assertions(1);
        const editor = getEditor("foo", { anchor: 1 });
        cleanBlock(editor);
        expect(editor.state.doc.toString()).toBe("foo");
    });

    it.each<[string, string, string]>([
        ["heading", "## foo", "foo"],
        ["blockquote", "> foo", "foo"],
        ["ul *", "* foo", "foo"],
        ["ul -", "- foo", "foo"],
        ["ul +", "+ foo", "foo"],
        ["ol period", "1. foo", "foo"],
        ["ol paren", "1) foo", "foo"],
        ["checklist with bullet host", "- [ ] foo", "foo"],
        ["checklist with ordered host", "1. [x] foo", "foo"],
    ])("strips %s prefix", (_label, input, expected) => {
        expect.assertions(1);
        const editor = getEditor(input, { anchor: input.length });
        cleanBlock(editor);
        expect(editor.state.doc.toString()).toBe(expected);
    });
});

describe("cleanBlock — multi-line", () => {
    it("strips prefixes across mixed selection in a single transaction", () => {
        expect.assertions(1);
        const editor = getEditor("# title\n> quoted\n* item\n1. ord\n", {
            anchor: 0,
            head: 28,
        });
        cleanBlock(editor);
        expect(editor.state.doc.toString()).toBe("title\nquoted\nitem\nord\n");
    });

    it("is a no-op when no block formatting is present", () => {
        expect.assertions(1);
        const editor = getEditor("foo\nbar\nbaz\n", { anchor: 0, head: 11 });
        cleanBlock(editor);
        expect(editor.state.doc.toString()).toBe("foo\nbar\nbaz\n");
    });
});

describe("cleanBlock — fenced code", () => {
    it("strips open and close backtick fences when cursor is inside", () => {
        expect.assertions(1);
        const editor = getEditor("```\ninner\n```\n", { anchor: 6 });
        cleanBlock(editor);
        expect(editor.state.doc.toString()).toBe("inner\n");
    });

    it("strips open and close tilde fences when cursor is inside", () => {
        expect.assertions(1);
        const editor = getEditor("~~~\ninner\n~~~\n", { anchor: 6 });
        cleanBlock(editor);
        expect(editor.state.doc.toString()).toBe("inner\n");
    });

    it("strips fence when cursor is on the opening fence line", () => {
        expect.assertions(1);
        const editor = getEditor("```\ninner\n```\n", { anchor: 0 });
        cleanBlock(editor);
        expect(editor.state.doc.toString()).toBe("inner\n");
    });

    it("strips only the open fence when the block is unterminated", () => {
        expect.assertions(1);
        const editor = getEditor("```\ninner\n", { anchor: 6 });
        cleanBlock(editor);
        expect(editor.state.doc.toString()).toBe("inner\n");
    });

    it("leaves block-prefix characters inside a fence untouched", () => {
        expect.assertions(1);
        const editor = getEditor("```\n> not a quote\n```\n", { anchor: 8 });
        cleanBlock(editor);
        expect(editor.state.doc.toString()).toBe("> not a quote\n");
    });

    it("strips both fences when the selection spans the whole block", () => {
        expect.assertions(1);
        const editor = getEditor("```\na\nb\n```\n", { anchor: 0, head: 11 });
        cleanBlock(editor);
        expect(editor.state.doc.toString()).toBe("a\nb\n");
    });
});

describe("cleanBlock — idempotence", () => {
    it("running twice yields the same result as running once", () => {
        expect.assertions(1);
        const editor = getEditor("## foo\n> bar\n* baz\n", { anchor: 0, head: 18 });
        cleanBlock(editor);
        const once = editor.state.doc.toString();
        cleanBlock(editor);
        expect(editor.state.doc.toString()).toBe(once);
    });
});
