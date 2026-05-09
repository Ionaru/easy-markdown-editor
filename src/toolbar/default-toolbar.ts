import { ViewUpdate } from "@codemirror/view";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
    faEraser,
    faHeading,
    faImage,
    faLink,
    faListOl,
    faListUl,
    faQuestion,
    faQuoteLeft,
} from "@fortawesome/free-solid-svg-icons";

import { EasyMDE } from "../easymde.js";
import { toggleBoldButton } from "./buttons/toggle-bold.js";
import { toggleCodeButton } from "./buttons/toggle-code.js";
import { toggleItalicButton } from "./buttons/toggle-italic.js";
import { toggleStrikethroughButton } from "./buttons/toggle-strikethrough.js";

export interface IToolbarButtonOptions {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    action?: any;
    active?:
        | boolean
        | ((editor: EasyMDE, update: ViewUpdate) => boolean)
        | ((editor: EasyMDE, update: ViewUpdate) => Promise<boolean>);
    icon: IconDefinition;
    readonly name: string;
    title: string;
}

export const defaultToolbar: IToolbarButtonOptions[][] = [
    [
        toggleBoldButton,
        toggleItalicButton,
        toggleStrikethroughButton,
        {
            // action: toggleHeadingSmaller,
            icon: faHeading,
            name: "heading",
            title: "Heading",
        },
    ],
    [
        toggleCodeButton,
        {
            // action: toggleBlockquote,
            icon: faQuoteLeft,
            name: "quote",
            title: "Quote",
        },
        {
            // action: toggleUnorderedList,
            icon: faListUl,
            name: "unordered-list",
            title: "Generic List",
        },
        {
            // action: toggleOrderedList,
            icon: faListOl,
            name: "ordered-list",
            title: "Numbered List",
        },
        {
            // action: cleanBlock,
            icon: faEraser,
            name: "clean-block",
            title: "Clean block",
        },
    ],
    [
        {
            // action: drawLink,
            icon: faLink,
            name: "link",
            title: "Create Link",
        },
        {
            // action: drawImage,
            icon: faImage,
            name: "image",
            title: "Insert Image",
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
            action: "https://simplemde.com/markdown-guide",
            icon: faQuestion,
            name: "guide",
            // noDisable: true,
            title: "Markdown Guide",
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
