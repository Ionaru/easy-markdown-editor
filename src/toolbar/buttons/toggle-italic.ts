import { ViewUpdate } from "@codemirror/view";
import { faItalic } from "@fortawesome/free-solid-svg-icons";

import { EasyMDE } from "../../easymde.js";
import { checkBlock, toggleBlock } from "../../utils/toggle-block.js";
import type { IToolbarButtonOptions } from "../default-toolbar.js";

export const toggleItalic = (editor: EasyMDE) =>
    toggleBlock(editor.codemirror, editor.options.blockStyles.italic);

export const checkItalic = (editor: EasyMDE, _update: ViewUpdate) =>
    Boolean(checkBlock(editor.codemirror, editor.options.blockStyles.italic));

export const toggleItalicButton: IToolbarButtonOptions = {
    action: toggleItalic,
    active: checkItalic,
    icon: faItalic,
    name: "italic",
    title: "Italic",
};
