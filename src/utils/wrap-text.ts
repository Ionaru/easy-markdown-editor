import { EditorSelection } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

/**
 * Wraps the main selection in `prefix` … `suffix` in a single transaction.
 *
 * The cursor is left at `cursorFromEnd` characters from the end of the inserted
 * text; the default `0` leaves it just after `suffix`. Pass a negative value to
 * land the cursor inside the suffix (e.g. before a closing `)`), or
 * `-suffix.length` to sit between `prefix` and `suffix`. Callers bake any
 * URL/value into the `suffix` themselves — this helper is purely the surgery.
 */
export const wrapText = (
    editor: EditorView,
    prefix: string,
    suffix: string,
    cursorFromEnd = 0,
): void => {
    const { from, to } = editor.state.selection.main;
    const insert = prefix + editor.state.sliceDoc(from, to) + suffix;
    editor.dispatch({
        changes: { from, to, insert },
        selection: EditorSelection.cursor(from + insert.length + cursorFromEnd),
    });
    editor.focus();
};
