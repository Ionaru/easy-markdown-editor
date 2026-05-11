import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
// eslint-disable-next-line @typescript-eslint/no-shadow
import { afterEach, describe, expect, it } from "vitest";

import { checkLine, toggleLine } from "./toggle-line.js";

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

describe.each(["#", ">", "-", "*", "+"])("toggleLine round-trip with %s", (prefix) => {
    it("adds the prefix to a single line under the cursor", () => {
        expect.assertions(1);

        const editor = getEditor("foo", { anchor: 1 });
        toggleLine(editor, prefix);
        expect(editor.state.doc.toString()).toBe(`${prefix} foo`);
    });

    it("removes the prefix when toggled again (idempotent)", () => {
        expect.assertions(1);

        const editor = getEditor(`${prefix} foo`, { anchor: 1 });
        toggleLine(editor, prefix);
        expect(editor.state.doc.toString()).toBe("foo");
    });

    it("adds the prefix to every line of a multi-line selection", () => {
        expect.assertions(1);

        const document = "a\nb\nc";
        const editor = getEditor(document, { anchor: 0, head: document.length });
        toggleLine(editor, prefix);
        expect(editor.state.doc.toString()).toBe(`${prefix} a\n${prefix} b\n${prefix} c`);
    });

    it("removes the prefix from every line when all lines carry it", () => {
        expect.assertions(1);

        const document = `${prefix} a\n${prefix} b`;
        const editor = getEditor(document, { anchor: 0, head: document.length });
        toggleLine(editor, prefix);
        expect(editor.state.doc.toString()).toBe("a\nb");
    });

    it("only adds the prefix to lines that lack it (partially applied)", () => {
        expect.assertions(1);

        const document = `${prefix} a\nb`;
        const editor = getEditor(document, { anchor: 0, head: document.length });
        toggleLine(editor, prefix);
        expect(editor.state.doc.toString()).toBe(`${prefix} a\n${prefix} b`);
    });
});

describe("toggleLine prefix collision", () => {
    it("does not treat a `## h` line as carrying the `#` prefix", () => {
        expect.assertions(1);

        const editor = getEditor("## h", { anchor: 1 });
        toggleLine(editor, "#");
        expect(editor.state.doc.toString()).toBe("# ## h");
    });

    it("removes only the leading `#` token, leaving deeper headings intact", () => {
        expect.assertions(1);

        const editor = getEditor("# ## h", { anchor: 1 });
        toggleLine(editor, "#");
        expect(editor.state.doc.toString()).toBe("## h");
    });
});

describe("checkLine", () => {
    it("returns true for a single prefixed line", () => {
        expect.assertions(1);

        expect(checkLine(getEditor("> foo", { anchor: 2 }), ">")).toBe(true);
    });

    it("returns false for a single bare line", () => {
        expect.assertions(1);

        expect(checkLine(getEditor("foo", { anchor: 1 }), ">")).toBe(false);
    });

    it("returns true when every selected line carries the prefix", () => {
        expect.assertions(1);

        const document = "> a\n> b\n> c";
        expect(checkLine(getEditor(document, { anchor: 0, head: document.length }), ">")).toBe(
            true,
        );
    });

    it("returns false when only some selected lines carry the prefix", () => {
        expect.assertions(1);

        const document = "> a\nb";
        expect(checkLine(getEditor(document, { anchor: 0, head: document.length }), ">")).toBe(
            false,
        );
    });

    it("distinguishes `#` from `##` on the same line", () => {
        expect.assertions(2);

        const editor = getEditor("## h", { anchor: 1 });
        expect(checkLine(editor, "#")).toBe(false);
        expect(checkLine(editor, "##")).toBe(true);
    });
});
