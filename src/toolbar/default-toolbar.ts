import { ViewUpdate } from "@codemirror/view";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
    faEraser,
    faEye,
    faImage,
    faLink,
    faListOl,
    faListUl,
    faQuestion,
} from "@fortawesome/free-solid-svg-icons";

import { EasyMDE } from "../easymde.js";
import { toggleBoldButton } from "./buttons/toggle-bold.js";
import { cycleHeadingButton } from "./buttons/toggle-heading.js";
import { toggleItalicButton } from "./buttons/toggle-italic.js";
import { toggleQuoteButton } from "./buttons/toggle-quote.js";

/**
 * A toolbar icon composed of a base FontAwesome glyph plus a small `overlay`
 * glyph (a digit or an arrow) drawn at the icon's bottom-right corner via
 * FontAwesome layering — see `Toolbar`.
 */
export interface LayeredIcon {
    base: IconDefinition;
    overlay: IconDefinition;
}

export type ToolbarIcon = IconDefinition | LayeredIcon;

export const isLayeredIcon = (icon: ToolbarIcon): icon is LayeredIcon => "base" in icon;

export interface IToolbarButtonOptions {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    action?: any;
    active?:
        | boolean
        | ((editor: EasyMDE, update: ViewUpdate) => boolean)
        | ((editor: EasyMDE, update: ViewUpdate) => Promise<boolean>);
    icon: ToolbarIcon;
    readonly name: string;
    title: string;
}

export const defaultToolbar: IToolbarButtonOptions[][] = [
    [toggleBoldButton, toggleItalicButton, cycleHeadingButton],
    [
        toggleQuoteButton,
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
