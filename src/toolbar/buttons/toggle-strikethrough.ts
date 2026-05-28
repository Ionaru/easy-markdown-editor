import { ViewUpdate } from "@codemirror/view";
import { faStrikethrough } from "@fortawesome/free-solid-svg-icons";

import type { EasyMDE } from "../../easymde.js";
import { checkBlock, toggleBlock } from "../../utils/toggle-block.js";
import type { IToolbarButtonOptions } from "../default-toolbar.js";

export const toggleStrikethrough = (editor: EasyMDE) =>
    toggleBlock(editor.codemirror, editor.options.blockStyles.strikethrough);

export const checkStrikethrough = (editor: EasyMDE, _update: ViewUpdate) =>
    Boolean(checkBlock(editor.codemirror, editor.options.blockStyles.strikethrough));

export const toggleStrikethroughButton: IToolbarButtonOptions = {
    action: toggleStrikethrough,
    active: checkStrikethrough,
    icon: faStrikethrough,
    name: "strikethrough",
    title: "Strikethrough",
};
