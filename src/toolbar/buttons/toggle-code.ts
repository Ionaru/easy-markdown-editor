import { ViewUpdate } from "@codemirror/view";
import { faCode } from "@fortawesome/free-solid-svg-icons";

import type { EasyMDE } from "../../easymde.js";
import { checkBlock, toggleBlock } from "../../utils/toggle-block.js";
import type { IToolbarButtonOptions } from "../default-toolbar.js";

export const toggleInlineCode = (editor: EasyMDE) =>
    toggleBlock(editor.codemirror, editor.options.blockStyles.code);

export const checkInlineCode = (editor: EasyMDE, _update: ViewUpdate) =>
    Boolean(checkBlock(editor.codemirror, editor.options.blockStyles.code));

export const toggleCodeButton: IToolbarButtonOptions = {
    action: toggleInlineCode,
    active: checkInlineCode,
    icon: faCode,
    name: "code",
    title: "Code",
};
