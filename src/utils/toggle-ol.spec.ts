import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
// eslint-disable-next-line @typescript-eslint/no-shadow
import { afterEach, describe, expect, it } from "vitest";

import { checkOrderedList, toggleOrderedList } from "./toggle-ol.js";

const views: EditorView[] = [];

const getEditor = (document: string, selection?: { anchor: number; head?: number }) => {
    const view = new EditorView({
        state: EditorState.create({
            doc: document,
            extensions: [
                markdown({
                    base: markdownLanguage,
                }),
            ],
            selection,
        }),
    });
    views.push(view);
    return view;
};

afterEach(() => {
    while (views.length > 0) views.pop()?.destroy();
});

describe("toggleOrderedList", () => {
    it("adds `1. ` to a single line under the cursor", () => {
        expect.assertions(1);

        const editor = getEditor("foo", { anchor: 1 });
        toggleOrderedList(editor);
        expect(editor.state.doc.toString()).toBe("1. foo");
    });

    it("numbers every line of a multi-line selection sequentially from 1", () => {
        expect.assertions(1);

        const document = "a\nb\nc";
        const editor = getEditor(document, { anchor: 0, head: document.length });
        toggleOrderedList(editor);
        expect(editor.state.doc.toString()).toBe("1. a\n2. b\n3. c");
    });

    it("continues numbering from the preceding ordered-list line", () => {
        expect.assertions(1);

        const document = "4. existing\na\nb";
        const editor = getEditor(document, { anchor: 13, head: document.length });
        toggleOrderedList(editor);
        expect(editor.state.doc.toString()).toBe("4. existing\n5. a\n6. b");
    });

    it("strips the prefix when every selected line is already numbered", () => {
        expect.assertions(1);

        const document = "1. a\n2. b\n3. c";
        const editor = getEditor(document, { anchor: 0, head: document.length });
        toggleOrderedList(editor);
        expect(editor.state.doc.toString()).toBe("a\nb\nc");
    });

    it("renumbers a mixed selection sequentially, replacing existing prefixes", () => {
        expect.assertions(1);

        const document = "1. a\nb\n2. c";
        const editor = getEditor(document, { anchor: 0, head: document.length });
        toggleOrderedList(editor);
        expect(editor.state.doc.toString()).toBe("1. a\n2. b\n3. c");
    });

    it("places the cursor after `1. ` when toggling on a blank line", () => {
        expect.assertions(2);

        const editor = getEditor("", { anchor: 0 });
        toggleOrderedList(editor);
        expect(editor.state.doc.toString()).toBe("1. ");
        expect(editor.state.selection.main.from).toBe(3);
    });

    it("toggles off in one round-trip", () => {
        expect.assertions(1);

        const document = "a\nb";
        const editor = getEditor(document, { anchor: 0, head: document.length });
        toggleOrderedList(editor);
        toggleOrderedList(editor);
        expect(editor.state.doc.toString()).toBe("a\nb");
    });
});

describe("checkOrderedList", () => {
    it("returns true for a single numbered line", () => {
        expect.assertions(1);

        expect(checkOrderedList(getEditor("1. foo", { anchor: 3 }))).toBe(true);
    });

    it("returns false for a bare line", () => {
        expect.assertions(1);

        expect(checkOrderedList(getEditor("foo", { anchor: 1 }))).toBe(false);
    });

    it("returns true when every selected line carries a numbered prefix", () => {
        expect.assertions(1);

        const document = "1. a\n2. b\n9. c";
        expect(checkOrderedList(getEditor(document, { anchor: 0, head: document.length }))).toBe(
            true,
        );
    });

    it("returns false when only some selected lines are numbered", () => {
        expect.assertions(1);

        const document = "1. a\nb";
        expect(checkOrderedList(getEditor(document, { anchor: 0, head: document.length }))).toBe(
            false,
        );
    });

    it("accepts up to nine digits per CommonMark §5.2", () => {
        expect.assertions(2);

        expect(checkOrderedList(getEditor("123456789. foo", { anchor: 0 }))).toBe(true);
        expect(checkOrderedList(getEditor("1234567890. foo", { anchor: 0 }))).toBe(false);
    });
});
