import { ViewUpdate } from "@codemirror/view";
import { faBold } from "@fortawesome/free-solid-svg-icons";

import { EasyMDE } from "../../easymde.js";
import { checkBlock, toggleBlock } from "../../utils/toggle-block.js";
import type { IToolbarButtonOptions } from "../default-toolbar.js";

export const toggleBold = (editor: EasyMDE) =>
    toggleBlock(editor.codemirror, editor.options.blockStyles.bold);

export const checkBold = (editor: EasyMDE, _update: ViewUpdate) =>
    Boolean(checkBlock(editor.codemirror, editor.options.blockStyles.bold));

export const toggleBoldButton: IToolbarButtonOptions = {
    action: toggleBold,
    active: checkBold,
    icon: faBold,
    name: "bold",
    title: "Bold",
};
