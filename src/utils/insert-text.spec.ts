import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
// eslint-disable-next-line @typescript-eslint/no-shadow
import { afterEach, describe, expect, it } from "vite-plus/test";

import { insertText } from "./insert-text.js";

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

describe("insertText", () => {
    it("inserts at the cursor in an empty document and places the cursor after it", () => {
        expect.assertions(2);
        const editor = getEditor("", { anchor: 0 });
        insertText(editor, "\n\n---\n\n");
        expect(editor.state.doc.toString()).toBe("\n\n---\n\n");
        expect(editor.state.selection.main.head).toBe(7);
    });

    it("inserts at a mid-document cursor and lands the cursor after the inserted text", () => {
        expect.assertions(2);
        const editor = getEditor("foobar", { anchor: 3 });
        insertText(editor, "XYZ");
        expect(editor.state.doc.toString()).toBe("fooXYZbar");
        expect(editor.state.selection.main.head).toBe(6);
    });

    it("inserts at the selection end without replacing the selection", () => {
        expect.assertions(2);
        const editor = getEditor("foobar", { anchor: 1, head: 4 });
        insertText(editor, "XYZ");
        expect(editor.state.doc.toString()).toBe("foobXYZar");
        expect(editor.state.selection.main.head).toBe(7);
    });

    it("places the cursor at the given offset within the inserted text", () => {
        expect.assertions(2);
        const editor = getEditor("foobar", { anchor: 3 });
        insertText(editor, "XYZ", 1);
        expect(editor.state.doc.toString()).toBe("fooXYZbar");
        expect(editor.state.selection.main.head).toBe(4);
    });
});
