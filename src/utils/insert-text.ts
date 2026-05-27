import { EditorSelection } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

/**
 * Inserts `text` at the cursor — or just after the current selection — in a
 * single transaction, leaving the cursor at the end of the inserted text.
 *
 * Callers are responsible for any block-context padding (e.g. the leading/
 * trailing `\n\n` in the horizontal-rule template); this helper does not add
 * newline guards of its own.
 */
export const insertText = (editor: EditorView, text: string): void => {
    const { to } = editor.state.selection.main;
    editor.dispatch({
        changes: { from: to, insert: text },
        selection: EditorSelection.cursor(to + text.length),
    });
    editor.focus();
};
