import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { wrapText } from "./wrap-text.js";

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

describe("wrapText", () => {
    it("wraps an empty cursor and leaves the cursor after the suffix by default", () => {
        expect.assertions(2);
        const editor = getEditor("", { anchor: 0 });
        wrapText(editor, "[", "](https://)");
        expect(editor.state.doc.toString()).toBe("[](https://)");
        expect(editor.state.selection.main.head).toBe(12);
    });

    it("wraps a single-line selection and leaves the cursor after the suffix by default", () => {
        expect.assertions(2);
        const editor = getEditor("foobar", { anchor: 0, head: 6 });
        wrapText(editor, "[", "](https://)");
        expect(editor.state.doc.toString()).toBe("[foobar](https://)");
        expect(editor.state.selection.main.head).toBe(18);
    });

    it("honours cursorFromEnd to land the cursor inside the suffix", () => {
        expect.assertions(2);
        const editor = getEditor("foobar", { anchor: 0, head: 6 });
        wrapText(editor, "[", "](https://)", -1);
        expect(editor.state.doc.toString()).toBe("[foobar](https://)");
        // one char before the end → just before the closing ")"
        expect(editor.state.selection.main.head).toBe(17);
    });

    it("wraps a mid-document selection at the correct offsets", () => {
        expect.assertions(2);
        const editor = getEditor("foobar", { anchor: 1, head: 4 });
        wrapText(editor, "[", "](https://)");
        expect(editor.state.doc.toString()).toBe("f[oob](https://)ar");
        expect(editor.state.selection.main.head).toBe(16);
    });
});
