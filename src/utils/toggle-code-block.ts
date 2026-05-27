import { type ChangeSet, EditorSelection, type SelectionRange } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

import { blockContaining, type FenceBlock, findFenceBlocks } from "./fences.js";
import { deleteLine, linesInSelection } from "./lines.js";

const FENCE = "```";

/**
 * Returns the fenced-code block the primary selection starts inside, or `null`
 * if the selection is not inside any fence. Reuses the B5 fence scan.
 */
const containingFence = (editor: EditorView): FenceBlock | null => {
    const { state } = editor;
    const startLine = state.doc.lineAt(state.selection.main.from).number;
    return blockContaining(findFenceBlocks(state), startLine);
};

/** `true` when the primary selection starts inside a fenced code block. */
export const checkCodeBlock = (editor: EditorView): boolean => containingFence(editor) !== null;

/**
 * Toggles a fenced code block (CommonMark §4.5) around the selection in a
 * single transaction:
 *
 * - Selection already inside a fence → strip the opening (and closing) fence
 *   lines, leaving the content. An unterminated opener strips only the opener.
 * - Empty selection → insert a ```` ```\n\n``` ```` template, cursor on the
 *   blank middle line. Leading/trailing newlines are added when the cursor is
 *   not already at the start/end of its line, so the fences always sit on their
 *   own lines.
 * - Non-empty selection → wrap the selected line range, each fence on its own
 *   line.
 */
export const toggleCodeBlock = (editor: EditorView): void => {
    const { state } = editor;

    let changes: ChangeSet;
    let selection: SelectionRange;

    const fence = containingFence(editor);
    const { from, to } = state.selection.main;

    if (fence) {
        const spec = [deleteLine(fence.open, state.doc.length)];
        if (fence.close) spec.push(deleteLine(fence.close, state.doc.length));
        changes = state.changes(spec);
        selection = state.selection.main.map(changes, 1);
    } else if (from === to) {
        const line = state.doc.lineAt(from);
        const prefix = from === line.from ? "" : "\n";
        const suffix = from === line.to ? "" : "\n";
        changes = state.changes({ from, insert: `${prefix}${FENCE}\n\n${FENCE}${suffix}` });
        selection = EditorSelection.cursor(from + prefix.length + FENCE.length + 1);
    } else {
        const lines = linesInSelection(state);
        const first = lines[0];
        const last = lines[lines.length - 1];
        if (!first || !last) return;
        changes = state.changes([
            { from: first.from, insert: `${FENCE}\n` },
            { from: last.to, insert: `\n${FENCE}` },
        ]);
        selection = state.selection.main.map(changes, 1);
    }

    editor.dispatch({ changes, selection });
    editor.focus();
};
