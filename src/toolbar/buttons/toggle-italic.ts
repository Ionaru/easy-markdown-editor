import { ViewUpdate } from '@codemirror/view';

import { EasyMDE } from '../../easymde';
import { checkBlock, toggleBlock } from '../../utils/toggle-block';
import { IToolbarButtonOptions } from '../default-toolbar';

export const toggleItalic = (editor: EasyMDE) =>
    toggleBlock(editor.codemirror, editor.options.blockStyles.italic);

export const checkItalic = (editor: EasyMDE, _update: ViewUpdate) =>
    Boolean(checkBlock(editor.codemirror, editor.options.blockStyles.italic));

export const toggleItalicButton: IToolbarButtonOptions = {
    action: toggleItalic,
    active: checkItalic,
    icon: 'fas fa-italic',
    name: 'italic',
    title: 'Italic',
};
