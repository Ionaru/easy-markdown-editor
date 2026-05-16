import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
// eslint-disable-next-line @typescript-eslint/no-shadow
import { afterEach, describe, expect, it } from "vitest";

import { checkHeading, currentLineHasHeading, cycleHeading, setHeading } from "./toggle-heading.js";

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

const wholeDoc = (document: string) => ({ anchor: 0, head: document.length });

afterEach(() => {
    while (views.length > 0) views.pop()?.destroy();
});

describe.each([1, 2, 3, 4, 5, 6])("setHeading to level %i", (level) => {
    it("adds the heading to a single bare line", () => {
        expect.assertions(1);

        const editor = getEditor("foo", { anchor: 1 });
        setHeading(editor, level);
        expect(editor.state.doc.toString()).toBe(`${"#".repeat(level)} foo`);
    });

    it("removes the heading when the line is already at that level", () => {
        expect.assertions(1);

        const document = `${"#".repeat(level)} foo`;
        const editor = getEditor(document, { anchor: 1 });
        setHeading(editor, level);
        expect(editor.state.doc.toString()).toBe("foo");
    });
});

describe("setHeading", () => {
    it("replaces an existing heading of a different level", () => {
        expect.assertions(1);

        const editor = getEditor("## foo", { anchor: 1 });
        setHeading(editor, 1);
        expect(editor.state.doc.toString()).toBe("# foo");
    });

    it("can jump straight from H3 to H6", () => {
        expect.assertions(1);

        const editor = getEditor("### foo", { anchor: 1 });
        setHeading(editor, 6);
        expect(editor.state.doc.toString()).toBe("###### foo");
    });

    it("applies the heading to every line of a multi-line selection", () => {
        expect.assertions(1);

        const document = "a\nb\nc";
        const editor = getEditor(document, wholeDoc(document));
        setHeading(editor, 2);
        expect(editor.state.doc.toString()).toBe("## a\n## b\n## c");
    });

    it("removes the heading from every line when all are already at that level", () => {
        expect.assertions(1);

        const document = "## a\n## b";
        const editor = getEditor(document, wholeDoc(document));
        setHeading(editor, 2);
        expect(editor.state.doc.toString()).toBe("a\nb");
    });

    it("applies the heading to lines that lack it (partially applied)", () => {
        expect.assertions(1);

        const document = "# a\nb";
        const editor = getEditor(document, wholeDoc(document));
        setHeading(editor, 1);
        expect(editor.state.doc.toString()).toBe("# a\n# b");
    });

    it("normalises mixed heading levels to the requested level", () => {
        expect.assertions(1);

        const document = "# a\n### b";
        const editor = getEditor(document, wholeDoc(document));
        setHeading(editor, 2);
        expect(editor.state.doc.toString()).toBe("## a\n## b");
    });

    it("does not treat a `#foo` line (no space) as a heading", () => {
        expect.assertions(1);

        const editor = getEditor("#foo", { anchor: 0 });
        setHeading(editor, 1);
        expect(editor.state.doc.toString()).toBe("# #foo");
    });

    it("adds a heading prefix to an empty line", () => {
        expect.assertions(1);

        const editor = getEditor("", { anchor: 0 });
        setHeading(editor, 1);
        expect(editor.state.doc.toString()).toBe("# ");
    });
});

describe.each([
    ["foo", "# foo"],
    ["# foo", "## foo"],
    ["##### foo", "###### foo"],
    ["###### foo", "foo"],
])("cycleHeading +1 turns %j into %j", (before, after) => {
    it("steps one level smaller and wraps through none", () => {
        expect.assertions(1);

        const editor = getEditor(before, { anchor: before.length });
        cycleHeading(editor, 1);
        expect(editor.state.doc.toString()).toBe(after);
    });
});

describe.each([
    ["foo", "###### foo"],
    ["# foo", "foo"],
    ["## foo", "# foo"],
    ["###### foo", "##### foo"],
])("cycleHeading -1 turns %j into %j", (before, after) => {
    it("steps one level bigger and wraps through none", () => {
        expect.assertions(1);

        const editor = getEditor(before, { anchor: before.length });
        cycleHeading(editor, -1);
        expect(editor.state.doc.toString()).toBe(after);
    });
});

describe("cycleHeading on multi-line selections", () => {
    it("steps a uniform selection smaller", () => {
        expect.assertions(1);

        const document = "# a\n# b";
        const editor = getEditor(document, wholeDoc(document));
        cycleHeading(editor, 1);
        expect(editor.state.doc.toString()).toBe("## a\n## b");
    });

    it("steps each line of a mixed selection independently", () => {
        expect.assertions(1);

        const document = "# a\n### b\nc";
        const editor = getEditor(document, wholeDoc(document));
        cycleHeading(editor, 1);
        expect(editor.state.doc.toString()).toBe("## a\n#### b\n# c");
    });

    it("wraps each line through none when stepping bigger", () => {
        expect.assertions(1);

        const document = "## a\nb";
        const editor = getEditor(document, wholeDoc(document));
        cycleHeading(editor, -1);
        expect(editor.state.doc.toString()).toBe("# a\n###### b");
    });
});

describe("checkHeading", () => {
    it("matches the exact level of a single line", () => {
        expect.assertions(2);

        const editor = getEditor("# h", { anchor: 2 });
        expect(checkHeading(editor, 1)).toBe(true);
        expect(checkHeading(editor, 2)).toBe(false);
    });

    it("treats a bare line as level 0", () => {
        expect.assertions(2);

        const editor = getEditor("h", { anchor: 1 });
        expect(checkHeading(editor, 1)).toBe(false);
        expect(checkHeading(editor, 0)).toBe(true);
    });

    it("returns true only when every selected line is at the level", () => {
        expect.assertions(2);

        const uniform = "## a\n## b\n## c";
        expect(checkHeading(getEditor(uniform, wholeDoc(uniform)), 2)).toBe(true);

        const mixed = "## a\nb";
        expect(checkHeading(getEditor(mixed, wholeDoc(mixed)), 2)).toBe(false);
    });

    it("rejects `#h` (no space) and a seven-hash run as headings", () => {
        expect.assertions(2);

        expect(checkHeading(getEditor("#h", { anchor: 1 }), 1)).toBe(false);
        expect(checkHeading(getEditor("####### h", { anchor: 1 }), 1)).toBe(false);
    });
});

describe("currentLineHasHeading", () => {
    it("reports whether the selection touches any heading line", () => {
        expect.assertions(4);

        expect(currentLineHasHeading(getEditor("# h", { anchor: 2 }))).toBe(true);
        expect(currentLineHasHeading(getEditor("h", { anchor: 1 }))).toBe(false);
        expect(currentLineHasHeading(getEditor("#h", { anchor: 1 }))).toBe(false);

        const document = "# a\nb";
        expect(currentLineHasHeading(getEditor(document, wholeDoc(document)))).toBe(true);
    });
});
