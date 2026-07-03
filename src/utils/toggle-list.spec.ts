import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
// eslint-disable-next-line @typescript-eslint/no-shadow
import { afterEach, describe, expect, it } from "vite-plus/test";

import {
    checkList,
    toggleList,
    type ListType,
    type MarkerConfig,
    type OlDelimiter,
    type UlStyle,
} from "./toggle-list.js";

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

const STYLE: UlStyle = "*";

const configFor = (
    target: ListType,
    delim: OlDelimiter = ".",
    style: UlStyle = STYLE,
): MarkerConfig => {
    if (target === "ul") return { target: "ul", style };
    if (target === "ol") return { target: "ol", delim };
    return { target: "checklist" };
};

describe("toggleList — adding to a bare line", () => {
    it.each<[ListType, string]>([
        ["ul", "* foo"],
        ["ol", "1. foo"],
        ["checklist", "- [ ] foo"],
    ])("target=%s wraps the line", (target, expected) => {
        expect.assertions(1);

        const editor = getEditor("foo", { anchor: 1 });
        toggleList(editor, configFor(target));
        expect(editor.state.doc.toString()).toBe(expected);
    });
});

describe("toggleList — swap between list types", () => {
    it.each<[string, ListType, string]>([
        ["* foo", "ol", "1. foo"],
        ["* foo", "checklist", "- [ ] foo"],
        ["1. foo", "ul", "* foo"],
        ["1. foo", "checklist", "- [ ] foo"],
        ["- [ ] foo", "ul", "* foo"],
        ["- [ ] foo", "ol", "1. foo"],
        ["- [x] foo", "ul", "* foo"],
        ["- [X] foo", "ol", "1. foo"],
    ])("rewrites %s to target=%s", (initial, target, expected) => {
        expect.assertions(1);

        const editor = getEditor(initial, { anchor: initial.length });
        toggleList(editor, configFor(target));
        expect(editor.state.doc.toString()).toBe(expected);
    });
});

describe("toggleList — toggle off (same target as current)", () => {
    it.each<[string, ListType, string]>([
        ["* foo", "ul", "foo"],
        ["1. foo", "ol", "foo"],
        ["- [ ] foo", "checklist", "- foo"],
        ["- [x] foo", "checklist", "- foo"],
        ["- [X] foo", "checklist", "- foo"],
        ["* [ ] foo", "checklist", "* foo"],
        ["1. [ ] foo", "checklist", "1. foo"],
        ["3) foo", "ol", "foo"],
    ])("strips %s when target=%s", (initial, target, expected) => {
        expect.assertions(1);

        const editor = getEditor(initial, { anchor: 0 });
        toggleList(editor, configFor(target));
        expect(editor.state.doc.toString()).toBe(expected);
    });
});

describe("toggleList — multi-line", () => {
    it("numbers every line of a uniform selection sequentially from 1", () => {
        expect.assertions(1);

        const document = "a\nb\nc";
        const editor = getEditor(document, { anchor: 0, head: document.length });
        toggleList(editor, configFor("ol"));
        expect(editor.state.doc.toString()).toBe("1. a\n2. b\n3. c");
    });

    it("checkboxes every line of a uniform selection", () => {
        expect.assertions(1);

        const document = "a\nb\nc";
        const editor = getEditor(document, { anchor: 0, head: document.length });
        toggleList(editor, configFor("checklist"));
        expect(editor.state.doc.toString()).toBe("- [ ] a\n- [ ] b\n- [ ] c");
    });

    it("rewrites a mixed list selection to a single target type", () => {
        expect.assertions(1);

        const document = "* a\n1. b\nc";
        const editor = getEditor(document, { anchor: 0, head: document.length });
        toggleList(editor, configFor("checklist"));
        expect(editor.state.doc.toString()).toBe("- [ ] a\n- [ ] b\n- [ ] c");
    });

    it("renumbers a mixed selection sequentially when swapping to ol", () => {
        expect.assertions(1);

        const document = "* a\n* b\n* c";
        const editor = getEditor(document, { anchor: 0, head: document.length });
        toggleList(editor, configFor("ol"));
        expect(editor.state.doc.toString()).toBe("1. a\n2. b\n3. c");
    });

    it("strips the checklist marker from every line, preserving the host bullet", () => {
        expect.assertions(1);

        const document = "- [ ] a\n- [x] b\n- [ ] c";
        const editor = getEditor(document, { anchor: 0, head: document.length });
        toggleList(editor, configFor("checklist"));
        expect(editor.state.doc.toString()).toBe("- a\n- b\n- c");
    });
});

describe("toggleList — ol continuation numbering", () => {
    it("continues numbering from the preceding ordered-list line", () => {
        expect.assertions(1);

        const document = "4. existing\na\nb";
        const editor = getEditor(document, { anchor: 13, head: document.length });
        toggleList(editor, configFor("ol"));
        expect(editor.state.doc.toString()).toBe("4. existing\n5. a\n6. b");
    });
});

describe("toggleList — cursor placement on blank line", () => {
    it.each<[ListType, string, number]>([
        ["ul", "* ", 2],
        ["ol", "1. ", 3],
        ["checklist", "- [ ] ", 6],
    ])("target=%s places cursor after the marker", (target, expectedDoc, expectedCursor) => {
        expect.assertions(2);

        const editor = getEditor("", { anchor: 0 });
        toggleList(editor, configFor(target));
        expect(editor.state.doc.toString()).toBe(expectedDoc);
        expect(editor.state.selection.main.from).toBe(expectedCursor);
    });
});

describe("toggleList — cursor placement on swap", () => {
    it("maps cursor correctly when swapping ol to checklist", () => {
        expect.assertions(2);

        const editor = getEditor("1. foo", { anchor: 4 });
        toggleList(editor, configFor("checklist"));
        expect(editor.state.doc.toString()).toBe("- [ ] foo");
        expect(editor.state.selection.main.from).toBe(7);
    });

    it("maps cursor correctly when toggling off a checklist", () => {
        expect.assertions(2);

        const editor = getEditor("- [ ] foo", { anchor: 6 });
        toggleList(editor, configFor("checklist"));
        expect(editor.state.doc.toString()).toBe("- foo");
        expect(editor.state.selection.main.from).toBe(2);
    });
});

describe("toggleList — idempotent round-trip", () => {
    it.each<[ListType, string]>([
        ["ul", "a\nb"],
        ["ol", "a\nb"],
        ["checklist", "- a\n- b"],
    ])("toggles off in one round-trip for %s", (target, expected) => {
        expect.assertions(1);

        const editor = getEditor("a\nb", { anchor: 0, head: 3 });
        toggleList(editor, configFor(target));
        toggleList(editor, configFor(target));
        expect(editor.state.doc.toString()).toBe(expected);
    });
});

describe("toggleList — respects unorderedListStyle option", () => {
    it.each<UlStyle>(["*", "-", "+"])("inserts the configured ul bullet %s", (style) => {
        expect.assertions(1);

        const editor = getEditor("foo", { anchor: 0 });
        toggleList(editor, { target: "ul", style });
        expect(editor.state.doc.toString()).toBe(`${style} foo`);
    });
});

describe("checkList", () => {
    it("returns true for a single line matching the target", () => {
        expect.assertions(3);

        expect(checkList(getEditor("* foo", { anchor: 0 }), "ul")).toBe(true);
        expect(checkList(getEditor("1. foo", { anchor: 0 }), "ol")).toBe(true);
        expect(checkList(getEditor("- [ ] foo", { anchor: 0 }), "checklist")).toBe(true);
    });

    it("returns false when the line is a different list type", () => {
        expect.assertions(3);

        expect(checkList(getEditor("1. foo", { anchor: 0 }), "ul")).toBe(false);
        expect(checkList(getEditor("- [ ] foo", { anchor: 0 }), "ul")).toBe(false);
        expect(checkList(getEditor("* foo", { anchor: 0 }), "checklist")).toBe(false);
    });

    it("returns false for a bare line", () => {
        expect.assertions(1);

        expect(checkList(getEditor("foo", { anchor: 0 }), "ul")).toBe(false);
    });

    it("treats any of *, -, + as ul", () => {
        expect.assertions(3);

        expect(checkList(getEditor("* foo", { anchor: 0 }), "ul")).toBe(true);
        expect(checkList(getEditor("- foo", { anchor: 0 }), "ul")).toBe(true);
        expect(checkList(getEditor("+ foo", { anchor: 0 }), "ul")).toBe(true);
    });

    it("distinguishes a checklist from a plain ul item with dash bullet", () => {
        expect.assertions(2);

        expect(checkList(getEditor("- [ ] foo", { anchor: 0 }), "ul")).toBe(false);
        expect(checkList(getEditor("- [ ] foo", { anchor: 0 }), "checklist")).toBe(true);
    });

    it("returns true only when every selected line matches the target", () => {
        expect.assertions(2);

        const allTask = "- [ ] a\n- [x] b\n- [ ] c";
        expect(
            checkList(getEditor(allTask, { anchor: 0, head: allTask.length }), "checklist"),
        ).toBe(true);

        const mixed = "- [ ] a\n* b";
        expect(checkList(getEditor(mixed, { anchor: 0, head: mixed.length }), "checklist")).toBe(
            false,
        );
    });

    it("accepts up to nine ordered-list digits per CommonMark §5.2", () => {
        expect.assertions(2);

        expect(checkList(getEditor("123456789. foo", { anchor: 0 }), "ol")).toBe(true);
        expect(checkList(getEditor("1234567890. foo", { anchor: 0 }), "ol")).toBe(false);
    });

    it("accepts both `.` and `)` ordered-list delimiters per CommonMark §5.2", () => {
        expect.assertions(2);

        expect(checkList(getEditor("1. foo", { anchor: 0 }), "ol")).toBe(true);
        expect(checkList(getEditor("3) foo", { anchor: 0 }), "ol")).toBe(true);
    });

    it("detects task markers hosted on any list-item kind per GFM §5.3", () => {
        expect.assertions(5);

        expect(checkList(getEditor("- [ ] task", { anchor: 0 }), "checklist")).toBe(true);
        expect(checkList(getEditor("* [x] task", { anchor: 0 }), "checklist")).toBe(true);
        expect(checkList(getEditor("+ [X] task", { anchor: 0 }), "checklist")).toBe(true);
        expect(checkList(getEditor("1. [ ] task", { anchor: 0 }), "checklist")).toBe(true);
        expect(checkList(getEditor("3) [x] task", { anchor: 0 }), "checklist")).toBe(true);
    });

    it("accepts tab inside `[ ]` per GFM §5.3 ('a whitespace character')", () => {
        expect.assertions(1);

        expect(checkList(getEditor("- [\t] task", { anchor: 0 }), "checklist")).toBe(true);
    });
});

describe("toggleList — orderedListDelimiter option", () => {
    it.each<OlDelimiter>([".", ")"])(
        "emits ordered lists with the configured delimiter %s",
        (delim) => {
            expect.assertions(1);

            const document = "a\nb\nc";
            const editor = getEditor(document, { anchor: 0, head: document.length });
            toggleList(editor, { target: "ol", delim });
            expect(editor.state.doc.toString()).toBe(`1${delim} a\n2${delim} b\n3${delim} c`);
        },
    );

    it("continues numbering across either preceding delimiter", () => {
        expect.assertions(1);

        const document = "3) existing\na\nb";
        const editor = getEditor(document, { anchor: 13, head: document.length });
        toggleList(editor, { target: "ol", delim: ")" });
        expect(editor.state.doc.toString()).toBe("3) existing\n4) a\n5) b");
    });

    it("swaps `)` lines onto ul, then back to ol with `.`", () => {
        expect.assertions(2);

        const editor = getEditor("3) foo", { anchor: 0 });
        toggleList(editor, configFor("ul"));
        expect(editor.state.doc.toString()).toBe("* foo");
        toggleList(editor, { target: "ol", delim: "." });
        expect(editor.state.doc.toString()).toBe("1. foo");
    });
});
