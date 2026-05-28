import { ViewUpdate } from "@codemirror/view";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import { EasyMDE } from "../easymde.js";
import { cleanBlockButton } from "./buttons/clean-block.js";
import { drawImageButton } from "./buttons/draw-image.js";
import { drawLinkButton } from "./buttons/draw-link.js";
import { openGuideButton } from "./buttons/open-guide.js";
import { redoButton } from "./buttons/redo.js";
import { toggleBoldButton } from "./buttons/toggle-bold.js";
import { cycleHeadingButton } from "./buttons/toggle-heading.js";
import { toggleItalicButton } from "./buttons/toggle-italic.js";
import { toggleOrderedListButton } from "./buttons/toggle-ol.js";
import { togglePreviewButton } from "./buttons/toggle-preview.js";
import { toggleQuoteButton } from "./buttons/toggle-quote.js";
import { toggleTaskListButton } from "./buttons/toggle-task.js";
import { toggleUnorderedListButton } from "./buttons/toggle-ul.js";
import { undoButton } from "./buttons/undo.js";

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
    [drawLinkButton, drawImageButton],
    [togglePreviewButton],
    [undoButton, redoButton],
    [openGuideButton],
];
