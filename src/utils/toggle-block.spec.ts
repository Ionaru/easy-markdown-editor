import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
// eslint-disable-next-line @typescript-eslint/no-shadow
import { describe, expect, it } from "vite-plus/test";

import { type BlockMatch, checkBlock, toggleBlock } from "./toggle-block.js";

const getEditor = (document: string, selection?: { anchor: number; head?: number }) =>
    new EditorView({
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

describe.each(["*", "**", "`", "_", "__", "~~"])("checkBlock simple %s", (character) => {
    const wordSimple = `${character}foo${character}`;
    const wordSimpleWithSpace = `${character} foo ${character}`;
    const wordSquished = `bla${character}foo${character}bla`;
    const wordMultiWords = `${character}foo boo${character}`;
    const wordMultiWord = `${character}foo${character} ${character}boo${character}`;
    const wordMultiLine = `${character}foo${character}\n${character}boo${character}`;
    const wordMultiTab = `${character}foo${character}\t${character}boo${character}`;

    it("must detect an active block with selection point in the middle", () => {
        expect.assertions(1);

        const anchor = Math.floor(wordSimple.length / 2);
        const result = checkBlock(getEditor(wordSimple, { anchor }), character);
        expect(result).toBeTruthy();
    });

    it("must detect an active block with selection point in the middle of a word", () => {
        expect.assertions(1);

        const anchor = Math.floor(wordSquished.length / 2);
        const result = checkBlock(getEditor(wordSquished, { anchor }), character);
        expect(result).toBeTruthy();
    });

    it("must not detect an active block with selection point in the middle of a word surrounded by spaces", () => {
        expect.assertions(1);

        const anchor = Math.floor(wordSimpleWithSpace.length / 2);
        const result = checkBlock(getEditor(wordSimpleWithSpace, { anchor }), character);
        expect(result).toBeFalsy();
    });

    it("must detect an active block with selection point at the start", () => {
        expect.assertions(1);

        const result = checkBlock(getEditor(wordSimple), character);
        expect(result).toBeTruthy();
    });

    it("must detect an active block with selection point at the end", () => {
        expect.assertions(1);

        const anchor = wordSimple.length;
        const result = checkBlock(getEditor(wordSimple, { anchor }), character);
        expect(result).toBeTruthy();
    });

    it("must detect an active block with partial selection range in the middle", () => {
        expect.assertions(1);

        const anchor = Math.floor(wordSimple.length / 2);
        const head = anchor + 1;
        const result = checkBlock(getEditor(wordSimple, { anchor, head }), character);
        expect(result).toBeTruthy();
    });

    it("must detect an active block with selection range of the full word", () => {
        expect.assertions(1);

        const anchor = character.length;
        const head = wordSimple.length - character.length;
        const result = checkBlock(getEditor(wordSimple, { anchor, head }), character);
        expect(result).toBeTruthy();
    });

    it("must detect an active block with selection range of the full text", () => {
        expect.assertions(1);

        const head = wordSimple.length;
        const result = checkBlock(getEditor(wordSimple, { anchor: 0, head }), character);
        expect(result).toBeTruthy();
    });

    it("must detect an active block with selection on the first of multiple lines", () => {
        expect.assertions(2);

        const [firstLine = ""] = wordMultiLine.split("\n");
        const anchor = Math.floor(firstLine.length / 2);
        const result = checkBlock(getEditor(wordMultiLine, { anchor }), character);
        expect(result).toBeTruthy();
        expect(result?.content).toBe("foo");
    });

    it("must detect an active block with selection on the second of multiple lines", () => {
        expect.assertions(2);

        const [firstLine = "", secondLine = ""] = wordMultiLine.split("\n");
        const anchor = Math.floor(secondLine.length / 2) + firstLine.length;
        const result = checkBlock(getEditor(wordMultiLine, { anchor }), character);
        expect(result).toBeTruthy();
        expect(result?.content).toBe("boo");
    });

    it("must detect an active block with selection at the end of multiple lines", () => {
        expect.assertions(2);

        const anchor = wordMultiLine.length;
        const result = checkBlock(getEditor(wordMultiLine, { anchor }), character);
        expect(result).toBeTruthy();
        expect(result?.content).toBe("boo");
    });

    it("must detect an active block with selection on the first of multiple words", () => {
        expect.assertions(2);

        const [firstWord = ""] = wordMultiWord.split(" ");
        const anchor = Math.floor(firstWord.length / 2);
        const result = checkBlock(getEditor(wordMultiWord, { anchor }), character);
        expect(result).toBeTruthy();
        expect(result?.content).toBe("foo");
    });

    it("must detect an active block with selection on the second of multiple words", () => {
        expect.assertions(2);

        const [firstWord = "", secondWord = ""] = wordMultiWord.split(" ");
        const anchor = Math.floor(secondWord.length / 2) + firstWord.length;
        const result = checkBlock(getEditor(wordMultiWord, { anchor }), character);
        expect(result).toBeTruthy();
        expect(result?.content).toBe("boo");
    });

    it("must detect an active block with selection at the end of multiple words", () => {
        expect.assertions(2);

        const anchor = wordMultiWord.length;
        const result = checkBlock(getEditor(wordMultiWord, { anchor }), character);
        expect(result).toBeTruthy();
        expect(result?.content).toBe("boo");
    });

    it("must detect an active block with selection on the first of multiple words separated by tab", () => {
        expect.assertions(2);

        const [firstWord = ""] = wordMultiTab.split("\t");
        const anchor = Math.floor(firstWord.length / 2);
        const result = checkBlock(getEditor(wordMultiTab, { anchor }), character);
        expect(result).toBeTruthy();
        expect(result?.content).toBe("foo");
    });

    it("must detect an active block with selection on the second of multiple words separated by tab", () => {
        expect.assertions(2);

        const [firstWord = "", secondWord = ""] = wordMultiTab.split("\t");
        const anchor = Math.floor(secondWord.length / 2) + firstWord.length;
        const result = checkBlock(getEditor(wordMultiTab, { anchor }), character);
        expect(result).toBeTruthy();
        expect(result?.content).toBe("boo");
    });

    it("must detect an active block with selection at the end of multiple words separated by tab", () => {
        expect.assertions(2);

        const anchor = wordMultiTab.length;
        const result = checkBlock(getEditor(wordMultiTab, { anchor }), character);
        expect(result).toBeTruthy();
        expect(result?.content).toBe("boo");
    });

    it("must detect an active block with selection on the first of a multi-word text", () => {
        expect.assertions(2);

        const [firstWord = ""] = wordMultiWords.split(" ");
        const anchor = Math.floor(firstWord.length / 2);
        const result = checkBlock(getEditor(wordMultiWords, { anchor }), character);
        expect(result).toBeTruthy();
        expect(result?.content).toBe("foo boo");
    });

    it("must detect an active block with selection on the second of a multi-word text", () => {
        expect.assertions(2);

        const [firstWord = "", secondWord = ""] = wordMultiWords.split(" ");
        const anchor = Math.floor(secondWord.length / 2) + firstWord.length;
        const result = checkBlock(getEditor(wordMultiWords, { anchor }), character);
        expect(result).toBeTruthy();
        expect(result?.content).toBe("foo boo");
    });
});

describe("checkBlock special cases", () => {
    it("must not detect an active block when another markdown block is used with more of the same characters", () => {
        expect.assertions(1);

        const result = checkBlock(getEditor("**foo**", { anchor: 4 }), "*");
        expect(result).toBeFalsy();
    });

    it("must not detect an active block when another markdown block is used with more of the same characters in a bigger context", () => {
        expect.assertions(1);

        const result = checkBlock(getEditor("Some text **foo** more text", { anchor: 14 }), "*");
        expect(result).toBeFalsy();
    });

    it("must detect an active block in a bigger context", () => {
        expect.assertions(2);

        const result = checkBlock(getEditor("Some text **foo** more text", { anchor: 14 }), "**");
        expect(result).toBeTruthy();
        expect(result?.content).toBe("foo");
    });

    it("must detect an active block when another markdown block is used with different characters", () => {
        expect.assertions(1);

        const result = checkBlock(getEditor("__*foo*__", { anchor: 6 }), "*");
        expect(result).toBeTruthy();
    });

    it("must not detect an active block when another markdown block is used with less of the same characters", () => {
        expect.assertions(1);

        const result = checkBlock(getEditor("*foo*", { anchor: 3 }), "**");
        expect(result).toBeFalsy();
    });

    it.each(["*", "**"])(
        "must detect an active block when the characters are part of another styling block",
        (c) => {
            expect.assertions(1);

            const result = checkBlock(getEditor("***foo***", { anchor: 5 }), c);
            expect(result).toBeTruthy();
        },
    );
});

describe("toggleBlock", () => {
    it("must toggle a single word on with the selection at the start", () => {
        expect.assertions(1);

        const editor = getEditor("Word", { anchor: 0 });
        toggleBlock(editor, "*");
        expect(editor.state.doc.toString()).toBe("*Word*");
    });

    it("must toggle a single word on with the selection in the middle", () => {
        expect.assertions(1);

        const editor = getEditor("Word", { anchor: 2 });
        toggleBlock(editor, "*");
        expect(editor.state.doc.toString()).toBe("*Word*");
    });

    it("must toggle a single word on with the selection at the end", () => {
        expect.assertions(1);

        const editor = getEditor("Word", { anchor: 4 });
        toggleBlock(editor, "*");
        expect(editor.state.doc.toString()).toBe("*Word*");
    });

    it("must toggle a single word on in between other words", () => {
        expect.assertions(1);

        const editor = getEditor("Many words are typed here", { anchor: 7 });
        toggleBlock(editor, "*");
        expect(editor.state.doc.toString()).toBe("Many *words* are typed here");
    });

    it("must toggle a single word on in between other words big selection", () => {
        expect.assertions(1);

        const editor = getEditor("Many words are typed here", {
            anchor: 5,
            head: 10,
        });
        toggleBlock(editor, "*");
        expect(editor.state.doc.toString()).toBe("Many *words* are typed here");
    });

    it("must toggle a single word off with the selection at the start", () => {
        expect.assertions(1);

        const editor = getEditor("*Word*", { anchor: 0 });
        toggleBlock(editor, "*");
        expect(editor.state.doc.toString()).toBe("Word");
    });

    it("must toggle a single word off with the selection in the middle", () => {
        expect.assertions(1);

        const editor = getEditor("*Word*", { anchor: 3 });
        toggleBlock(editor, "*");
        expect(editor.state.doc.toString()).toBe("Word");
    });

    it("must toggle a single word off with the selection at the end", () => {
        expect.assertions(1);

        const editor = getEditor("*Word*", { anchor: 6 });
        toggleBlock(editor, "*");
        expect(editor.state.doc.toString()).toBe("Word");
    });

    it("must toggle a single word off in between other words", () => {
        expect.assertions(1);

        const editor = getEditor("Many *words* are typed here", { anchor: 8 });
        toggleBlock(editor, "*");
        expect(editor.state.doc.toString()).toBe("Many words are typed here");
    });

    it("must toggle a single word off in between other words big selection", () => {
        expect.assertions(1);

        const editor = getEditor("Many *words* are typed here", {
            anchor: 6,
            head: 11,
        });
        toggleBlock(editor, "*");
        expect(editor.state.doc.toString()).toBe("Many words are typed here");
    });

    it("must toggle a formatted sentence off", () => {
        expect.assertions(1);

        const editor = getEditor("*Many words are typed here*", { anchor: 8 });
        toggleBlock(editor, "*");
        expect(editor.state.doc.toString()).toBe("Many words are typed here");
    });

    it("must toggle a formatted sentence off in a big selection", () => {
        expect.assertions(1);

        const editor = getEditor("*Many words are typed here*", {
            anchor: 6,
            head: 11,
        });
        toggleBlock(editor, "*");
        expect(editor.state.doc.toString()).toBe("Many words are typed here");
    });

    it.each([
        { character: "*", expectedDoc: "**", expectedCursor: 1 },
        { character: "**", expectedDoc: "****", expectedCursor: 2 },
        { character: "`", expectedDoc: "``", expectedCursor: 1 },
        { character: "~~", expectedDoc: "~~~~", expectedCursor: 2 },
    ])(
        "must place the cursor between markers in an empty document for $character",
        ({ character, expectedDoc, expectedCursor }) => {
            expect.assertions(3);

            const editor = getEditor("", { anchor: 0 });
            toggleBlock(editor, character);
            expect(editor.state.doc.toString()).toBe(expectedDoc);
            expect(editor.state.selection.main.from).toBe(expectedCursor);
            expect(editor.state.selection.main.to).toBe(expectedCursor);
        },
    );

    it("must place the cursor between markers when cursor follows trailing whitespace", () => {
        expect.assertions(3);

        const editor = getEditor("hello ", { anchor: 6 });
        toggleBlock(editor, "*");
        expect(editor.state.doc.toString()).toBe("hello **");
        expect(editor.state.selection.main.from).toBe(7);
        expect(editor.state.selection.main.to).toBe(7);
    });

    it("must keep the wrapped word selected when cursor is inside a word", () => {
        expect.assertions(3);

        const editor = getEditor("Word", { anchor: 2 });
        toggleBlock(editor, "*");
        expect(editor.state.doc.toString()).toBe("*Word*");
        expect(editor.state.selection.main.from).toBe(0);
        expect(editor.state.selection.main.to).toBe(6);
    });
});

describe("empty delimiter pairs", () => {
    it.each<[string, string, number, string, BlockMatch | null]>([
        ["bold pair", "****", 2, "**", { from: 0, to: 4, content: "" }],
        ["bold pair is not italic", "****", 2, "*", null],
        ["strikethrough pair", "~~~~", 2, "~~", { from: 0, to: 4, content: "" }],
        ["underscore bold pair", "____", 2, "__", { from: 0, to: 4, content: "" }],
        ["underscore bold pair is not italic", "____", 2, "_", null],
        ["bold pair in text", "a **** b", 4, "**", { from: 2, to: 6, content: "" }],
        ["bold pair in text is not italic", "a **** b", 4, "*", null],
        ["strikethrough pair in text", "a ~~~~ b", 4, "~~", { from: 2, to: 6, content: "" }],
        ["italic pair after trailing space", "hello **", 7, "*", { from: 6, to: 8, content: "" }],
        ["code pair in text", "a `` b", 3, "`", { from: 2, to: 4, content: "" }],
        ["bold pair on its own line", "foo\n****\nbar", 6, "**", { from: 4, to: 8, content: "" }],
        ["bold pair in parentheses", "(****)", 3, "**", { from: 1, to: 5, content: "" }],
        ["bold pair in parentheses is not italic", "(****)", 3, "*", null],
        ["stacked italic pair", "******", 3, "*", { from: 2, to: 4, content: "" }],
        ["stacked bold pair", "******", 3, "**", { from: 1, to: 5, content: "" }],
        ["strikethrough nested in bold", "**~~~~**", 4, "~~", { from: 2, to: 6, content: "" }],
    ])("must detect the empty pair (%s)", (_name, document, anchor, characters, expected) => {
        expect.assertions(1);

        const result = checkBlock(getEditor(document, { anchor }), characters);
        expect(result).toEqual(expected);
    });

    it.each<[string, string, number, string]>([
        ["letter before and after", "a****b", 3, "**"],
        ["accented letters before and after", "é****é", 3, "**"],
        ["digits before and after", "1~~~~2", 3, "~~"],
        ["cursor between the opening stars of bold text", "Some text **foo** more text", 11, "*"],
        ["cursor between the stars of a closing bold marker", "foo**", 4, "*"],
    ])("must not detect an empty pair with %s", (_name, document, anchor, characters) => {
        expect.assertions(1);

        const result = checkBlock(getEditor(document, { anchor }), characters);
        expect(result).toBeNull();
    });

    it.each<[string, string, number, string, BlockMatch]>([
        ["italic", "*foo**bar*", 5, "*", { from: 0, to: 5, content: "foo" }],
        ["bold", "**foo****bar**", 7, "**", { from: 0, to: 7, content: "foo" }],
    ])(
        "must prefer a non-empty %s match over an empty pair at the cursor",
        (_name, document, anchor, characters, expected) => {
            expect.assertions(1);

            const result = checkBlock(getEditor(document, { anchor }), characters);
            expect(result).toEqual(expected);
        },
    );

    it.each<[string, string, string]>([
        ["strikethrough", "~~~~", "~~"],
        ["bold", "****", "**"],
    ])(
        "must not use the empty-pair rule for a non-empty %s selection",
        (_name, document, characters) => {
            expect.assertions(1);

            const result = checkBlock(getEditor(document, { anchor: 1, head: 3 }), characters);
            expect(result).toBeNull();
        },
    );

    it.each(["**", "~~"])("must remove an empty %s pair when toggled twice", (characters) => {
        expect.assertions(5);

        const editor = getEditor("", { anchor: 0 });
        toggleBlock(editor, characters);
        expect(editor.state.doc.toString()).toBe(characters.repeat(2));
        expect(editor.state.selection.main.from).toBe(characters.length);
        toggleBlock(editor, characters);
        expect(editor.state.doc.toString()).toBe("");
        expect(editor.state.selection.main.from).toBe(0);
        expect(editor.state.selection.main.to).toBe(0);
    });

    it.each([
        ["**", "a **** b"],
        ["~~", "a ~~~~ b"],
    ])("must remove an empty %s pair in the middle of text", (characters, document) => {
        expect.assertions(3);

        const editor = getEditor(document, { anchor: 4 });
        toggleBlock(editor, characters);
        expect(editor.state.doc.toString()).toBe("a  b");
        expect(editor.state.selection.main.from).toBe(2);
        expect(editor.state.selection.main.to).toBe(2);
    });

    it.each<[string, string, number, string, string, number]>([
        ["italic pair from stacked stars", "******", 3, "*", "****", 2],
        ["bold pair from stacked stars", "******", 3, "**", "**", 1],
        ["strikethrough pair nested in bold", "**~~~~**", 4, "~~", "****", 2],
    ])("must remove the %s", (_name, document, anchor, characters, expectedDoc, expectedCursor) => {
        expect.assertions(3);

        const editor = getEditor(document, { anchor });
        toggleBlock(editor, characters);
        expect(editor.state.doc.toString()).toBe(expectedDoc);
        expect(editor.state.selection.main.from).toBe(expectedCursor);
        expect(editor.state.selection.main.to).toBe(expectedCursor);
    });
});

describe("nesting inside an empty pair of another style", () => {
    it.each<[string, string, number, string, string, number]>([
        ["italic in bold pair", "****", 2, "*", "******", 3],
        ["strikethrough in bold pair", "****", 2, "~~", "**~~~~**", 4],
        ["bold in strikethrough pair", "~~~~", 2, "**", "~~****~~", 4],
        ["italic in strikethrough pair", "~~~~", 2, "*", "~~**~~", 3],
        ["bold in italic pair", "**", 1, "**", "******", 3],
        ["italic in bold pair in text", "a **** b", 4, "*", "a ****** b", 5],
        ["italic in bold pair on its own line", "foo\n****\nbar", 6, "*", "foo\n******\nbar", 7],
        ["italic in underscore pair", "____", 2, "*", "__**__", 3],
        ["bold in code pair", "``", 1, "**", "`****`", 3],
        ["strikethrough in bold pair in parentheses", "(****)", 3, "~~", "(**~~~~**)", 5],
        ["italic in strikethrough pair nested in bold", "**~~~~**", 4, "*", "**~~**~~**", 5],
    ])(
        "must insert the new pair at the cursor (%s)",
        (_name, document, anchor, characters, expectedDoc, expectedCursor) => {
            expect.assertions(3);

            const editor = getEditor(document, { anchor });
            toggleBlock(editor, characters);
            expect(editor.state.doc.toString()).toBe(expectedDoc);
            expect(editor.state.selection.main.from).toBe(expectedCursor);
            expect(editor.state.selection.main.to).toBe(expectedCursor);
        },
    );

    it("must put typed text between the new markers", () => {
        expect.assertions(1);

        const editor = getEditor("****", { anchor: 2 });
        toggleBlock(editor, "*");
        editor.dispatch(editor.state.replaceSelection("x"));
        expect(editor.state.doc.toString()).toBe("***x***");
    });

    it.each<[string, number, string, string, BlockMatch | null]>([
        ["****", 2, "*", "*", { from: 2, to: 4, content: "" }],
        ["****", 2, "*", "**", { from: 1, to: 5, content: "" }],
        ["****", 2, "~~", "~~", { from: 2, to: 6, content: "" }],
        ["****", 2, "~~", "**", { from: 0, to: 8, content: "~~~~" }],
        ["****", 2, "~~", "*", null],
        ["~~~~", 2, "**", "**", { from: 2, to: 6, content: "" }],
        ["~~~~", 2, "**", "~~", { from: 0, to: 8, content: "****" }],
        ["~~~~", 2, "**", "*", null],
        ["~~~~", 2, "*", "*", { from: 2, to: 4, content: "" }],
        ["a **** b", 4, "*", "*", { from: 4, to: 6, content: "" }],
        ["____", 2, "*", "*", { from: 2, to: 4, content: "" }],
        ["(****)", 3, "~~", "~~", { from: 3, to: 7, content: "" }],
    ])(
        "must read the new style as active afterwards (%s, cursor %i, toggled %s, checked %s)",
        (document, anchor, toggled, checked, expected) => {
            expect.assertions(1);

            const editor = getEditor(document, { anchor });
            toggleBlock(editor, toggled);
            expect(checkBlock(editor, checked)).toEqual(expected);
        },
    );

    it.each<[string, number, string]>([
        ["****", 2, "*"],
        ["****", 2, "~~"],
        ["~~~~", 2, "**"],
        ["**", 1, "**"],
    ])(
        "must remove only the new pair when toggled twice (%s, cursor %i, %s)",
        (document, anchor, characters) => {
            expect.assertions(3);

            const editor = getEditor(document, { anchor });
            toggleBlock(editor, characters);
            toggleBlock(editor, characters);
            expect(editor.state.doc.toString()).toBe(document);
            expect(editor.state.selection.main.from).toBe(anchor);
            expect(editor.state.selection.main.to).toBe(anchor);
        },
    );

    it("must nest inside an empty pair of punctuation that is not a style", () => {
        expect.assertions(3);

        const editor = getEditor('""', { anchor: 1 });
        toggleBlock(editor, "**");
        expect(editor.state.doc.toString()).toBe('"****"');
        expect(editor.state.selection.main.from).toBe(3);
        expect(editor.state.selection.main.to).toBe(3);
    });

    it.each<[string, string, number, number | undefined, string, string, number, number]>([
        ["letters touch the run", "a****b", 3, undefined, "~~", "~~a****b~~", 0, 10],
        [
            "letters touch the run in bold text",
            "**foo****bar**",
            7,
            undefined,
            "~~",
            "~~**foo****bar**~~",
            0,
            18,
        ],
        [
            "letter right of the run",
            "Some text **foo** more text",
            11,
            undefined,
            "~~",
            "Some text ~~**foo**~~ more text",
            10,
            21,
        ],
        ["different brackets", "()", 1, undefined, "**", "**()**", 0, 6],
        ["selection not collapsed", "****", 1, 3, "~~", "~~****~~", 0, 8],
        ["nothing after the cursor", "\u{1F600}", 2, undefined, "**", "**\u{1F600}**", 0, 6],
        ["letters at the cursor", "Word", 2, undefined, "*", "*Word*", 0, 6],
    ])(
        "must keep wrapping when the rule does not apply (%s)",
        (_name, document, anchor, head, characters, expectedDoc, expectedFrom, expectedTo) => {
            expect.assertions(3);

            const editor = getEditor(document, { anchor, head });
            toggleBlock(editor, characters);
            expect(editor.state.doc.toString()).toBe(expectedDoc);
            expect(editor.state.selection.main.from).toBe(expectedFrom);
            expect(editor.state.selection.main.to).toBe(expectedTo);
        },
    );
});
