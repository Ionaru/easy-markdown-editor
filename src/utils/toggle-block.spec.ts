import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
// eslint-disable-next-line @typescript-eslint/no-shadow
import { describe, expect, it } from "vitest";

import { checkBlock, toggleBlock } from "./toggle-block.js";

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
