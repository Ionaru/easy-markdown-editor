import { ViewUpdate } from "@codemirror/view";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faEye, faImage, faLink, faQuestion } from "@fortawesome/free-solid-svg-icons";

import { EasyMDE } from "../easymde.js";
import { cleanBlockButton } from "./buttons/clean-block.js";
import { toggleBoldButton } from "./buttons/toggle-bold.js";
import { cycleHeadingButton } from "./buttons/toggle-heading.js";
import { toggleItalicButton } from "./buttons/toggle-italic.js";
import { toggleOrderedListButton } from "./buttons/toggle-ol.js";
import { toggleQuoteButton } from "./buttons/toggle-quote.js";
import { toggleTaskListButton } from "./buttons/toggle-task.js";
import { toggleUnorderedListButton } from "./buttons/toggle-ul.js";

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
        toggleUnorderedListButton,
        toggleOrderedListButton,
        toggleTaskListButton,
        cleanBlockButton,
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
