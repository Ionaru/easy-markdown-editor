import { EasyMDE } from '../easymde';
import { toggleBlock } from '../utils/toggle-block';

export const toggleItalic = (editor: EasyMDE) =>
    toggleBlock(editor.codemirror, '*');
