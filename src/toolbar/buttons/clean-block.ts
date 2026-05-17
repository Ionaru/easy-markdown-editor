import { faEraser } from "@fortawesome/free-solid-svg-icons";

import { EasyMDE } from "../../easymde.js";
import { cleanBlock as cleanBlockUtil } from "../../utils/clean-block.js";
import type { IToolbarButtonOptions } from "../default-toolbar.js";

export const cleanBlock = (editor: EasyMDE): void => cleanBlockUtil(editor.codemirror);

export const cleanBlockButton: IToolbarButtonOptions = {
    action: cleanBlock,
    icon: faEraser,
    name: "clean-block",
    title: "Clean block",
};
