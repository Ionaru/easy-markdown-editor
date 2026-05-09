import { ViewUpdate } from "@codemirror/view";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
    faEraser,
    faEye,
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
        },
    ],
    [
        {
            action: (editor: EasyMDE) => editor.togglePreview(),
            active: (editor: EasyMDE) => editor.isPreviewActive(),
            icon: faEye,
            name: "preview",
            title: "Toggle Preview",
        },
    ],
    [
        {
            action: "https://simplemde.com/markdown-guide",
            icon: faQuestion,
            name: "guide",
            title: "Markdown Guide",
        },
    ],
];
