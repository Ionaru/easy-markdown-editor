import type { ToolbarButton } from "../options.js";
import { cleanBlockButton } from "./buttons/clean-block.js";
import { drawImageButton } from "./buttons/draw-image.js";
import { drawLinkButton } from "./buttons/draw-link.js";
import { horizontalRuleButton } from "./buttons/horizontal-rule.js";
import { openGuideButton } from "./buttons/open-guide.js";
import { redoButton } from "./buttons/redo.js";
import { tableButton } from "./buttons/table.js";
import { toggleBoldButton } from "./buttons/toggle-bold.js";
import { toggleCodeBlockButton } from "./buttons/toggle-code-block.js";
import { toggleCodeButton } from "./buttons/toggle-code.js";
import {
    cycleHeadingButton,
    headingBiggerButton,
    headingSmallerButton,
    toggleHeading1Button,
    toggleHeading2Button,
    toggleHeading3Button,
    toggleHeading4Button,
    toggleHeading5Button,
    toggleHeading6Button,
} from "./buttons/toggle-heading.js";
import { toggleItalicButton } from "./buttons/toggle-italic.js";
import { toggleOrderedListButton } from "./buttons/toggle-ol.js";
import { togglePreviewButton } from "./buttons/toggle-preview.js";
import { toggleQuoteButton } from "./buttons/toggle-quote.js";
import { toggleStrikethroughButton } from "./buttons/toggle-strikethrough.js";
import { toggleTaskListButton } from "./buttons/toggle-task.js";
import { toggleUnorderedListButton } from "./buttons/toggle-ul.js";
import { undoButton } from "./buttons/undo.js";
import type { IToolbarButtonOptions } from "./default-toolbar.js";

/**
 * Sentinel for `ToolbarButton` names whose button action ships in a later
 * milestone. `buildToolbar` filters these out of the resolved layout silently;
 * Milestone C will replace the sentinel with a real button.
 */
export const DEFERRED_BUTTON = Symbol("deferred-button");

export type RegistryEntry = IToolbarButtonOptions | typeof DEFERRED_BUTTON;

/**
 * Closed map of every `ToolbarButton` string to its button object (or the
 * `DEFERRED_BUTTON` sentinel). Exhaustive over `ToolbarButton` — TypeScript
 * verifies every name has an entry.
 */
export const buttonRegistry: Readonly<Record<ToolbarButton, RegistryEntry>> = {
    bold: toggleBoldButton,
    italic: toggleItalicButton,
    strikethrough: toggleStrikethroughButton,
    "cycle-heading": cycleHeadingButton,
    "heading-1": toggleHeading1Button,
    "heading-2": toggleHeading2Button,
    "heading-3": toggleHeading3Button,
    "heading-4": toggleHeading4Button,
    "heading-5": toggleHeading5Button,
    "heading-6": toggleHeading6Button,
    "heading-smaller": headingSmallerButton,
    "heading-bigger": headingBiggerButton,
    quote: toggleQuoteButton,
    "unordered-list": toggleUnorderedListButton,
    "ordered-list": toggleOrderedListButton,
    "task-list": toggleTaskListButton,
    "clean-block": cleanBlockButton,
    link: drawLinkButton,
    image: drawImageButton,
    code: toggleCodeButton,
    "code-block": toggleCodeBlockButton,
    table: tableButton,
    "horizontal-rule": horizontalRuleButton,
    undo: undoButton,
    redo: redoButton,
    preview: togglePreviewButton,
    guide: openGuideButton,
    "side-by-side": DEFERRED_BUTTON,
    fullscreen: DEFERRED_BUTTON,
};

/**
 * Resolve a `ToolbarButton` string to its button entry. Throws on an unknown
 * name so consumer typos surface immediately rather than silently dropping
 * buttons from the toolbar.
 */
export const resolveButton = (name: string): RegistryEntry => {
    if (!Object.hasOwn(buttonRegistry, name)) {
        throw new Error(`Unknown toolbar button: "${name}"`);
    }
    return buttonRegistry[name as ToolbarButton];
};
