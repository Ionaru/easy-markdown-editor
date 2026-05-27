import { EditorSelection } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

/**
 * Inserts `text` at the cursor — or just after the current selection — in a
 * single transaction. The cursor is left at `cursorOffset` characters into the
 * inserted text; the default leaves it at the end (`text.length`).
 *
 * Callers are responsible for any block-context padding (e.g. the leading/
 * trailing `\n\n` in the horizontal-rule template); this helper does not add
 * newline guards of its own.
 */
export const insertText = (editor: EditorView, text: string, cursorOffset = text.length): void => {
    const { to } = editor.state.selection.main;
    editor.dispatch({
        changes: { from: to, insert: text },
        selection: EditorSelection.cursor(to + cursorOffset),
    });
    editor.focus();
};
