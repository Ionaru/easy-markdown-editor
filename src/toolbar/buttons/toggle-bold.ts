import { ViewUpdate } from '@codemirror/view';

import { EasyMDE } from '../../easymde';
import { checkBlock, toggleBlock } from '../../utils/toggle-block';
import { IToolbarButtonOptions } from '../default-toolbar';

export const toggleBold = (editor: EasyMDE) =>
    toggleBlock(editor.codemirror, editor.options.blockStyles.bold);

export const checkBold = (editor: EasyMDE, _update: ViewUpdate) =>
    Boolean(checkBlock(editor.codemirror, editor.options.blockStyles.bold));

export const toggleBoldButton: IToolbarButtonOptions = {
    action: toggleBold,
    active: checkBold,
    icon: 'fas fa-bold',
    name: 'bold',
    title: 'Bold',
};
