import { EditorState, Line } from "@codemirror/state";

/**
 * Collects every line that intersects the primary selection. Works for a bare
 * cursor too (returns a single line).
 */
export const linesInSelection = (state: EditorState): Line[] => {
    const { from, to } = state.selection.main;
    const first = state.doc.lineAt(from).number;
    const last = state.doc.lineAt(to).number;
    const lines: Line[] = [];
    for (let number = first; number <= last; number++) {
        lines.push(state.doc.line(number));
    }
    return lines;
};
