import { EasyMDE } from '../../easymde';
import { toggleBlock } from '../../utils/toggle-block';
import { IToolbarButtonOptions } from '../default-toolbar';

export const toggleCode = (editor: EasyMDE) =>
    toggleBlock(editor.codemirror, editor.options.blockStyles.code);

export const toggleCodeButton: IToolbarButtonOptions = {
    action: toggleCode,
    icon: 'fas fa-code',
    name: 'code',
    title: 'Code',
};
