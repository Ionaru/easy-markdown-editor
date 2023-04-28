import { EditorSelection, EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import escapeStringRegexp from 'escape-string-regexp';

export const checkBlock = (
    editor: EditorView,
    characters: string,
): RegExpExecArray | null => {
    //  Checks whether the selection matches a block of formatted text.

    const { state } = editor;
    const { from, to } = getExpandedSelection(state, characters);
    const text = state.sliceDoc(from, to);
    const escapedCharacters = escapeStringRegexp(characters);
    const regularExpression = new RegExp(
        `^${escapedCharacters}(.*)${escapedCharacters}$`,
        'gs',
    );

    const checkResult = regularExpression.exec(text);

    let doubleCharactersCheckResult = null;
    let tripleCharactersCheckResult = null;
    if (characters.length === 1) {
        doubleCharactersCheckResult = checkBlock(editor, characters.repeat(2));
        tripleCharactersCheckResult = checkBlock(editor, characters.repeat(3));
    }

    if (
        (checkResult &&
            doubleCharactersCheckResult &&
            tripleCharactersCheckResult) ||
        (checkResult &&
            !doubleCharactersCheckResult &&
            tripleCharactersCheckResult) ||
        (checkResult &&
            !doubleCharactersCheckResult &&
            !tripleCharactersCheckResult)
    ) {
        return checkResult;
    }

    return null;
};

export const toggleBlock = (editor: EditorView, characters: string) => {
    const { state } = editor;
    const { from, to } = getExpandedSelection(state, characters);
    const text = state.sliceDoc(from, to);
    const textMatch = checkBlock(editor, characters);

    editor.dispatch(
        state.changeByRange(() =>
            textMatch
                ? {
                      changes: [{ from, insert: textMatch[1], to }],
                      range: EditorSelection.range(
                          from,
                          to - (characters.length + characters.length),
                      ),
                  }
                : {
                      changes: [
                          {
                              from,
                              insert: `${characters}${text}${characters}`,
                              to,
                          },
                      ],
                      range: EditorSelection.range(
                          from,
                          to + (characters.length + characters.length),
                      ),
                  },
        ),
    );

    editor.focus();
};

export const getExpandedSelection = (
    state: EditorState,
    characters: string,
): { from: number; to: number } => {
    let { from, to } = state.selection.main;

    let fromPosition = from;
    while (fromPosition > 0) {
        const newText = state.sliceDoc(fromPosition, to);
        if (
            newText.startsWith('\n') ||
            newText.startsWith('\t') ||
            newText.startsWith(' ')
        ) {
            fromPosition++;
            break;
        }
        if (
            newText.length > characters.length &&
            newText.startsWith(characters)
        ) {
            break;
        }
        fromPosition--;
    }
    from = fromPosition;

    let toPosition = to;
    while (toPosition < state.doc.length) {
        const newText = state.sliceDoc(from, toPosition);
        if (
            newText.endsWith('\n') ||
            newText.endsWith('\t') ||
            newText.endsWith(' ')
        ) {
            toPosition--;
            break;
        }
        if (
            newText.length > characters.length &&
            newText.endsWith(characters)
        ) {
            break;
        }
        toPosition++;
    }
    to = toPosition;

    return { from, to };
};
