import { EditorState, Line } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

/**
 * Collects every line that intersects the primary selection. Works for a bare
 * cursor too (returns a single line).
 */
const linesInSelection = (state: EditorState): Line[] => {
    const { from, to } = state.selection.main;
    const first = state.doc.lineAt(from).number;
    const last = state.doc.lineAt(to).number;
    const lines: Line[] = [];
    for (let number = first; number <= last; number++) {
        lines.push(state.doc.line(number));
    }
    return lines;
};

const hasPrefix = (text: string, prefix: string): boolean => text.startsWith(`${prefix} `);

/**
 * Returns whether every line intersecting the selection starts with `prefix `.
 */
export const checkLine = (editor: EditorView, prefix: string): boolean =>
    linesInSelection(editor.state).every((line) => hasPrefix(line.text, prefix));

/**
 * Toggles a line-prefix syntax (`# heading`, `> quote`, `- list item`) on every
 * line intersecting the selection. If all such lines already carry `prefix `, it
 * is removed from all; otherwise it is added to the lines that lack it. Applied
 * as a single transaction with one change per affected line.
 */
export const toggleLine = (editor: EditorView, prefix: string): void => {
    const { state } = editor;
    const lines = linesInSelection(state);
    const token = `${prefix} `;
    const allPrefixed = lines.every((line) => hasPrefix(line.text, prefix));

    const changes = allPrefixed
        ? lines.map((line) => ({ from: line.from, to: line.from + token.length, insert: "" }))
        : lines
              .filter((line) => !hasPrefix(line.text, prefix))
              .map((line) => ({ from: line.from, insert: token }));

    editor.dispatch({ changes });
    editor.focus();
};
