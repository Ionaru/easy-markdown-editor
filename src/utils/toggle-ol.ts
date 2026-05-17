import { EditorView } from "@codemirror/view";

import { linesInSelection } from "./lines.js";

const ORDERED_RE = /^(\d{1,9})\. /;

/**
 * Returns whether every line intersecting the selection starts with `N. `
 * (CommonMark §5.2 ordered-list marker).
 */
export const checkOrderedList = (editor: EditorView): boolean =>
    linesInSelection(editor.state).every((line) => ORDERED_RE.test(line.text));

/**
 * Toggles `N. ` prefixes on every line intersecting the selection. When
 * adding, numbering continues from the line above if it is itself ordered,
 * else starts at `1.`.
 */
export const toggleOrderedList = (editor: EditorView): void => {
    const { state } = editor;
    const lines = linesInSelection(state);
    const matches = lines.map((line) => ORDERED_RE.exec(line.text));
    const allNumbered = matches.every(Boolean);

    let start = 1;
    const firstLine = lines[0];
    if (!allNumbered && firstLine && firstLine.number > 1) {
        const prevMatch = ORDERED_RE.exec(state.doc.line(firstLine.number - 1).text);
        if (prevMatch) start = Number(prevMatch[1]) + 1;
    }

    const changeSpec = lines.map((line, i) => {
        const existing = matches[i];
        return {
            from: line.from,
            to: line.from + (existing ? existing[0].length : 0),
            insert: allNumbered ? "" : `${start + i}. `,
        };
    });

    const changes = state.changes(changeSpec);
    editor.dispatch({ changes, selection: state.selection.map(changes, 1) });
    editor.focus();
};
