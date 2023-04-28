import { ViewUpdate } from '@codemirror/view';

import { EasyMDE } from '../easymde';

import { toggleBoldButton } from './buttons/toggle-bold';
import { toggleCodeButton } from './buttons/toggle-code';
import { toggleItalicButton } from './buttons/toggle-italic';
// import { toggleStrikethroughButton } from "./buttons/toggle-strikethrough";

export interface IToolbarButtonOptions {
    action?: any;
    active?:
        | boolean
        | ((editor: EasyMDE, update: ViewUpdate) => boolean)
        | ((editor: EasyMDE, update: ViewUpdate) => Promise<boolean>);
    icon: string;
    readonly name: string;
    title: string;
}

export const defaultToolbar: IToolbarButtonOptions[][] = [
    [
        toggleBoldButton,
        toggleItalicButton,
        // toggleStrikethroughButton,
        {
            // action: toggleHeadingSmaller,
            icon: 'fas fa-header fa-heading',
            name: 'heading',
            title: 'Heading',
        },
    ],
    [
        toggleCodeButton,
        {
            // action: toggleBlockquote,
            icon: 'fas fa-quote-left',
            name: 'quote',
            title: 'Quote',
        },
        {
            // action: toggleUnorderedList,
            icon: 'fas fa-list-ul',
            name: 'unordered-list',
            title: 'Generic List',
        },
        {
            // action: toggleOrderedList,
            icon: 'fas fa-list-ol',
            name: 'ordered-list',
            title: 'Numbered List',
        },
        {
            // action: cleanBlock,
            icon: 'fas fa-eraser',
            name: 'clean-block',
            title: 'Clean block',
        },
    ],
    [
        {
            // action: drawLink,
            icon: 'fas fa-link',
            name: 'link',
            title: 'Create Link',
        },
        {
            // action: drawImage,
            icon: 'fas fa-image',
            name: 'image',
            title: 'Insert Image',
            // }, {
            //     // action: drawHorizontalRule,
            //     icon: 'fas fa-minus',
            //     name: 'horizontal-rule',
            //     title: 'Insert Horizontal Line',
            // }], [{
            //     action: NewMDE.togglePreview,
            //     icon: 'fas fa-eye',
            //     name: 'preview',
            //     // noDisable: true,
            //     // noMobile: true,
            //     title: 'Toggle Preview',
            // }, {
            //     action: NewMDE.toggleSideBySide,
            //     icon: 'fas fa-columns',
            //     name: 'side-by-side',
            //     // noDisable: true,
            //     // noMobile: true,
            //     title: 'Toggle Side by Side',
            // }, {
            //     action: NewMDE.toggleFullScreen,
            //     icon: 'fas fa-arrows-alt',
            //     name: 'fullscreen',
            //     // noDisable: true,
            //     // noMobile: true,
            //     title: 'Toggle Fullscreen',
        },
    ],
    [
        {
            action: 'https://simplemde.com/markdown-guide',
            icon: 'fas fa-question',
            name: 'guide',
            // noDisable: true,
            title: 'Markdown Guide',
            // }], [{
            //     action: NewMDE.undo,
            //     icon: 'fas fa-undo',
            //     name: 'undo',
            //     // noDisable: true,
            //     title: 'Undo',
            // }, {
            //     action: NewMDE.redo,
            //     icon: 'fas fa-repeat',
            //     name: 'redo',
            //     // noDisable: true,
            //     title: 'Redo',
        },
    ],
];
