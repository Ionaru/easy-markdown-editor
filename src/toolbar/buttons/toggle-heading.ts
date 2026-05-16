import { ViewUpdate } from "@codemirror/view";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
    fa1,
    fa2,
    fa3,
    fa4,
    fa5,
    fa6,
    faArrowDown,
    faArrowUp,
    faHeading,
} from "@fortawesome/free-solid-svg-icons";

import { EasyMDE } from "../../easymde.js";
import {
    checkHeading,
    currentLineHasHeading,
    cycleHeading,
    setHeading,
} from "../../utils/toggle-heading.js";
import type { IToolbarButtonOptions } from "../default-toolbar.js";

const setHeadingAction = (level: number) => (editor: EasyMDE) =>
    setHeading(editor.codemirror, level);

export const toggleHeading1 = setHeadingAction(1);
export const toggleHeading2 = setHeadingAction(2);
export const toggleHeading3 = setHeadingAction(3);
export const toggleHeading4 = setHeadingAction(4);
export const toggleHeading5 = setHeadingAction(5);
export const toggleHeading6 = setHeadingAction(6);

export const toggleHeadingSmaller = (editor: EasyMDE) => cycleHeading(editor.codemirror, 1);
export const toggleHeadingBigger = (editor: EasyMDE) => cycleHeading(editor.codemirror, -1);

const headingCycleActive = (editor: EasyMDE, _update: ViewUpdate): boolean =>
    currentLineHasHeading(editor.codemirror);

const headingButton = (
    level: number,
    digit: IconDefinition,
    title: string,
): IToolbarButtonOptions => ({
    action: setHeadingAction(level),
    active: (editor: EasyMDE, _update: ViewUpdate): boolean =>
        checkHeading(editor.codemirror, level),
    icon: { base: faHeading, overlay: digit },
    name: `heading-${level}`,
    title,
});

export const toggleHeading1Button = headingButton(1, fa1, "Big Heading");
export const toggleHeading2Button = headingButton(2, fa2, "Medium Heading");
export const toggleHeading3Button = headingButton(3, fa3, "Small Heading");
export const toggleHeading4Button = headingButton(4, fa4, "Heading 4");
export const toggleHeading5Button = headingButton(5, fa5, "Heading 5");
export const toggleHeading6Button = headingButton(6, fa6, "Heading 6");

export const headingSmallerButton: IToolbarButtonOptions = {
    action: toggleHeadingSmaller,
    active: headingCycleActive,
    icon: { base: faHeading, overlay: faArrowDown },
    name: "heading-smaller",
    title: "Smaller Heading",
};

export const headingBiggerButton: IToolbarButtonOptions = {
    action: toggleHeadingBigger,
    active: headingCycleActive,
    icon: { base: faHeading, overlay: faArrowUp },
    name: "heading-bigger",
    title: "Bigger Heading",
};

export const cycleHeadingButton: IToolbarButtonOptions = {
    action: toggleHeadingSmaller,
    active: headingCycleActive,
    icon: faHeading,
    name: "cycle-heading",
    title: "Heading",
};
