import { faStrikethrough } from "@fortawesome/free-solid-svg-icons";

import { EasyMDE } from "../../easymde.js";
import { toggleBlock } from "../../utils/toggle-block.js";
import type { IToolbarButtonOptions } from "../default-toolbar.js";

export const toggleStrikethrough = (editor: EasyMDE) =>
    toggleBlock(editor.codemirror, editor.options.blockStyles.strikethrough);

export const toggleStrikethroughButton: IToolbarButtonOptions = {
    action: toggleStrikethrough,
    icon: faStrikethrough,
    name: "strikethrough",
    title: "Strikethrough",
};
