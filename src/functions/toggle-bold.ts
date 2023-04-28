import { EasyMDE } from '../easymde';
import { toggleBlock } from '../utils/toggle-block';

export const toggleBold = (editor: EasyMDE) =>
    toggleBlock(editor.codemirror, '**');
