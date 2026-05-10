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

const findBlock = (state: EditorState, characters: string, minimal: boolean): BlockMatch | null => {
    const { from, to } = expandSelection(state, characters, minimal);
    const escaped = escapeStringRegexp(characters);
    const match = new RegExp(`^${escaped}(.*)${escaped}$`, "s").exec(state.sliceDoc(from, to));
    if (!match) return null;

    if (characters.length === 1) {
        const double = findBlock(state, characters.repeat(2), minimal);
        const triple = findBlock(state, characters.repeat(3), minimal);
        if (double && !triple) return null;
    }

    return { from, to, content: match[1] ?? "" };
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
