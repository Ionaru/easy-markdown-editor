import { EasyMDE } from '../../easymde';
import { toggleBlock } from '../../utils/toggle-block';
import { IToolbarButtonOptions } from '../default-toolbar';

export const toggleStrikethrough = (editor: EasyMDE) =>
    toggleBlock(editor.codemirror, editor.options.blockStyles.strikethrough);

export const toggleStrikethroughButton: IToolbarButtonOptions = {
    action: toggleStrikethrough,
    icon: 'fas fa-strikethrough',
    name: 'strikethrough',
    title: 'Strikethrough',
};
