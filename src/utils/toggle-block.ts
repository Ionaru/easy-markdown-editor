import { EditorSelection, EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import escapeStringRegexp from "escape-string-regexp";

export interface BlockMatch {
    from: number;
    to: number;
    content: string;
}

/**
 * Checks whether the selection matches a formatted block of text.
 */
export const checkBlock = (editor: EditorView, characters: string): BlockMatch | null =>
    findBlock(editor.state, characters, false);

/**
 * Toggles a block of text to be formatted.
 */
export const toggleBlock = (editor: EditorView, characters: string) => {
    const { state } = editor;
    const match = findBlock(state, characters, false);
    const offset = characters.length * 2;

    editor.dispatch(
        state.changeByRange(() => {
            if (match) {
                return {
                    changes: [{ from: match.from, insert: match.content, to: match.to }],
                    range: EditorSelection.range(match.from, match.to - offset),
                };
            }
            if (isInsideEmptyPair(state)) {
                const cursor = state.selection.main.from;
                return {
                    changes: [{ from: cursor, insert: characters + characters }],
                    range: EditorSelection.cursor(cursor + characters.length),
                };
            }
            const { from, to } = expandSelection(state, characters, true);
            const text = state.sliceDoc(from, to);
            const range =
                from === to
                    ? EditorSelection.cursor(from + characters.length)
                    : EditorSelection.range(from, to + offset);
            return {
                changes: [{ from, insert: `${characters}${text}${characters}`, to }],
                range,
            };
        }),
    );

    editor.focus();
};

const matchWindow = (
    state: EditorState,
    characters: string,
    minimal: boolean,
): BlockMatch | null => {
    const { from, to } = expandSelection(state, characters, minimal);
    const escaped = escapeStringRegexp(characters);
    const match = new RegExp(`^${escaped}(.*)${escaped}$`, "s").exec(state.sliceDoc(from, to));
    if (!match) return null;
    return { from, to, content: match[1] ?? "" };
};

const isWordCharacter = (char: string): boolean => /[\p{L}\p{N}]/u.test(char);

/**
 * Detects an empty pair of delimiters with the cursor exactly in the middle. The expansion in
 * `expandSelection` needs content between the delimiters, so it can't settle on an empty pair.
 */
const findEmptyPair = (state: EditorState, characters: string): BlockMatch | null => {
    const { from: cursor, to } = state.selection.main;
    if (cursor !== to) return null;

    const start = cursor - characters.length;
    const end = cursor + characters.length;
    if (start < 0 || end > state.doc.length) return null;
    if (state.sliceDoc(start, cursor) !== characters || state.sliceDoc(cursor, end) !== characters)
        return null;
    if (isWordCharacter(state.sliceDoc(Math.max(0, start - 1), start))) return null;
    if (isWordCharacter(state.sliceDoc(end, end + 1))) return null;

    return { from: start, to: end, content: "" };
};

/**
 * Detects a collapsed cursor in the middle of a mirrored run of punctuation (`**|**`, `"|"`) that no
 * letter or digit touches. There is no word to wrap there, so a new pair belongs at the cursor.
 */
const isInsideEmptyPair = (state: EditorState): boolean => {
    const { from: cursor, to } = state.selection.main;
    if (cursor !== to) return false;

    const length = state.doc.length;
    let depth = 0;
    while (cursor - depth - 1 >= 0 && cursor + depth + 1 <= length) {
        const before = state.sliceDoc(cursor - depth - 1, cursor - depth);
        const after = state.sliceDoc(cursor + depth, cursor + depth + 1);
        if (before !== after || /\s/.test(before) || isWordCharacter(before)) break;
        depth++;
    }
    if (depth === 0) return false;

    const left = cursor - depth - 1;
    const right = cursor + depth;
    if (left >= 0 && isWordCharacter(state.sliceDoc(left, left + 1))) return false;
    if (right < length && isWordCharacter(state.sliceDoc(right, right + 1))) return false;
    return true;
};

const findBlock = (state: EditorState, characters: string, minimal: boolean): BlockMatch | null => {
    const expanded = matchWindow(state, characters, minimal);
    const candidate =
        expanded && expanded.content !== ""
            ? expanded
            : (findEmptyPair(state, characters) ?? expanded);
    if (!candidate) return null;

    if (characters.length === 1) {
        const double = findBlock(state, characters.repeat(2), minimal);
        const triple = findBlock(state, characters.repeat(3), minimal);
        if (double && !triple) return null;
    }

    return candidate;
};

const isBoundary = (char: string, minimal: boolean): boolean =>
    char === "\n" || char === "\t" || (minimal && char === " ");

const expandSelection = (
    state: EditorState,
    characters: string,
    minimal: boolean,
): { from: number; to: number } => {
    let { from, to } = state.selection.main;

    while (from >= 0) {
        const newText = state.sliceDoc(from, to);
        if (isBoundary(newText[0] ?? "", minimal)) {
            from++;
            break;
        }
        if (newText.startsWith(characters + " ")) {
            from += characters.length + 1;
            break;
        }
        if (newText.length > characters.length && newText.startsWith(characters)) {
            break;
        }
        from--;
    }
    if (from < 0) from = 0;

    while (to < state.doc.length) {
        const newText = state.sliceDoc(from, to);
        if (isBoundary(newText.at(-1) ?? "", minimal)) {
            to--;
            break;
        }
        if (newText.length > characters.length && newText.endsWith(characters)) {
            break;
        }
        to++;
    }

    return { from, to };
};
