import { EditorView } from "@codemirror/view";

import { linesInSelection } from "./lines.js";

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

    const changeSpec = allPrefixed
        ? lines.map((line) => ({ from: line.from, to: line.from + token.length, insert: "" }))
        : lines
              .filter((line) => !hasPrefix(line.text, prefix))
              .map((line) => ({ from: line.from, insert: token }));

    const changes = state.changes(changeSpec);
    editor.dispatch({ changes, selection: state.selection.map(changes, 1) });
    editor.focus();
};
