import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
// eslint-disable-next-line @typescript-eslint/no-shadow
import { describe, expect, it } from 'vitest';

import { checkBlock } from './toggle-block';

const getEditor = (
    document: string,
    selection?: { anchor: number; head?: number },
) =>
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

describe.each(['*', '**', '`', '_', '__', '~~'])(
    'checkBlock simple %s',
    (character) => {
        const wordSimple = `${character}foo${character}`;
        const wordSimpleWithSpace = `${character} foo ${character}`;
        const wordSquished = `bla${character}foo${character}bla`;
        const wordMultiWord = `${character}foo${character} ${character}boo${character}`;
        const wordMultiLine = `${character}foo${character}\n${character}boo${character}`;
        const wordMultiTab = `${character}foo${character}\t${character}boo${character}`;

        it('must detect an active block with selection point in the middle', () => {
            expect.assertions(1);

            const anchor = Math.floor(wordSimple.length / 2);
            const result = checkBlock(
                getEditor(wordSimple, { anchor }),
                character,
            );
            expect(result).toBeTruthy();
        });

        it('must detect an active block with selection point in the middle of a word', () => {
            expect.assertions(1);

            const anchor = Math.floor(wordSquished.length / 2);
            const result = checkBlock(
                getEditor(wordSquished, { anchor }),
                character,
            );
            expect(result).toBeTruthy();
        });

        it('must not detect an active block with selection point in the middle of a word surrounded by spaces', () => {
            expect.assertions(1);

            const anchor = Math.floor(wordSimpleWithSpace.length / 2);
            const result = checkBlock(
                getEditor(wordSimpleWithSpace, { anchor }),
                character,
            );
            expect(result).toBeFalsy();
        });

        it('must detect an active block with selection point at the start', () => {
            expect.assertions(1);

            const result = checkBlock(getEditor(wordSimple), character);
            expect(result).toBeTruthy();
        });

        it('must detect an active block with selection point at the end', () => {
            expect.assertions(1);

            const anchor = wordSimple.length;
            const result = checkBlock(
                getEditor(wordSimple, { anchor }),
                character,
            );
            expect(result).toBeTruthy();
        });

        it('must detect an active block with partial selection range in the middle', () => {
            expect.assertions(1);

            const anchor = Math.floor(wordSimple.length / 2);
            const head = anchor + 1;
            const result = checkBlock(
                getEditor(wordSimple, { anchor, head }),
                character,
            );
            expect(result).toBeTruthy();
        });

        it('must detect an active block with selection range of the full word', () => {
            expect.assertions(1);

            const anchor = character.length;
            const head = wordSimple.length - character.length;
            const result = checkBlock(
                getEditor(wordSimple, { anchor, head }),
                character,
            );
            expect(result).toBeTruthy();
        });

        it('must detect an active block with selection range of the full text', () => {
            expect.assertions(1);

            const head = wordSimple.length;
            const result = checkBlock(
                getEditor(wordSimple, { anchor: 0, head }),
                character,
            );
            expect(result).toBeTruthy();
        });

        it('must detect an active block with selection on the first of multiple lines', () => {
            expect.assertions(2);

            const anchor = Math.floor(wordMultiLine.split('\n')[0].length / 2);
            const result = checkBlock(
                getEditor(wordMultiLine, { anchor }),
                character,
            );
            expect(result).toBeTruthy();
            expect(result[1]).toBe('foo');
        });

        it('must detect an active block with selection on the second of multiple lines', () => {
            expect.assertions(2);

            const multiLineSplit = wordMultiLine.split('\n');
            const anchor =
                Math.floor(multiLineSplit[1].length / 2) +
                multiLineSplit[0].length;
            const result = checkBlock(
                getEditor(wordMultiLine, { anchor }),
                character,
            );
            expect(result).toBeTruthy();
            expect(result[1]).toBe('boo');
        });

        it('must detect an active block with selection at the end of multiple lines', () => {
            expect.assertions(2);

            const anchor = wordMultiLine.length;
            const result = checkBlock(
                getEditor(wordMultiLine, { anchor }),
                character,
            );
            expect(result).toBeTruthy();
            expect(result[1]).toBe('boo');
        });

        it('must detect an active block with selection on the first of multiple words', () => {
            expect.assertions(2);

            const anchor = Math.floor(wordMultiWord.split(' ')[0].length / 2);
            const result = checkBlock(
                getEditor(wordMultiWord, { anchor }),
                character,
            );
            expect(result).toBeTruthy();
            expect(result[1]).toBe('foo');
        });

        it('must detect an active block with selection on the second of multiple words', () => {
            expect.assertions(2);

            const multiWordSplit = wordMultiWord.split(' ');
            const anchor =
                Math.floor(multiWordSplit[1].length / 2) +
                multiWordSplit[0].length;
            const result = checkBlock(
                getEditor(wordMultiWord, { anchor }),
                character,
            );
            expect(result).toBeTruthy();
            expect(result[1]).toBe('boo');
        });

        it('must detect an active block with selection at the end of multiple words', () => {
            expect.assertions(2);

            const anchor = wordMultiWord.length;
            const result = checkBlock(
                getEditor(wordMultiWord, { anchor }),
                character,
            );
            expect(result).toBeTruthy();
            expect(result[1]).toBe('boo');
        });

        it('must detect an active block with selection on the first of multiple words separated by tab', () => {
            expect.assertions(2);

            const anchor = Math.floor(wordMultiTab.split('\t')[0].length / 2);
            const result = checkBlock(
                getEditor(wordMultiTab, { anchor }),
                character,
            );
            expect(result).toBeTruthy();
            expect(result[1]).toBe('foo');
        });

        it('must detect an active block with selection on the second of multiple words separated by tab', () => {
            expect.assertions(2);

            const multiWordSplit = wordMultiTab.split('\t');
            const anchor =
                Math.floor(multiWordSplit[1].length / 2) +
                multiWordSplit[0].length;
            const result = checkBlock(
                getEditor(wordMultiTab, { anchor }),
                character,
            );
            expect(result).toBeTruthy();
            expect(result[1]).toBe('boo');
        });

        it('must detect an active block with selection at the end of multiple words separated by tab', () => {
            expect.assertions(2);

            const anchor = wordMultiTab.length;
            const result = checkBlock(
                getEditor(wordMultiTab, { anchor }),
                character,
            );
            expect(result).toBeTruthy();
            expect(result[1]).toBe('boo');
        });
    },
);

describe('checkBlock special cases', () => {
    it('must not detect an active block when another markdown block is used with more of the same characters', () => {
        expect.assertions(1);

        const result = checkBlock(getEditor('**foo**', { anchor: 4 }), '*');
        expect(result).toBeFalsy();
    });

    it('must not detect an active block when another markdown block is used with more of the same characters in a bigger context', () => {
        expect.assertions(1);

        const result = checkBlock(
            getEditor('Some text **foo** more text', { anchor: 14 }),
            '*',
        );
        expect(result).toBeFalsy();
    });

    it('must detect an active block in a bigger context', () => {
        expect.assertions(2);

        const result = checkBlock(
            getEditor('Some text **foo** more text', { anchor: 14 }),
            '**',
        );
        expect(result).toBeTruthy();
        expect(result[1]).toBe('foo');
    });

    it('must detect an active block when another markdown block is used with different characters', () => {
        expect.assertions(1);

        const result = checkBlock(getEditor('__*foo*__', { anchor: 6 }), '*');
        expect(result).toBeTruthy();
    });

    it('must not detect an active block when another markdown block is used with less of the same characters', () => {
        expect.assertions(1);

        const result = checkBlock(getEditor('*foo*', { anchor: 3 }), '**');
        expect(result).toBeFalsy();
    });

    it.each(['*', '**'])(
        'must detect an active block when the characters are part of another styling block',
        (c) => {
            expect.assertions(1);

            const result = checkBlock(getEditor('***foo***', { anchor: 5 }), c);
            expect(result).toBeTruthy();
        },
    );
});
