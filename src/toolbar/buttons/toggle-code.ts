import { faCode } from "@fortawesome/free-solid-svg-icons";

import { EasyMDE } from "../../easymde.js";
import { toggleBlock } from "../../utils/toggle-block.js";
import type { IToolbarButtonOptions } from "../default-toolbar.js";

export const toggleCode = (editor: EasyMDE) =>
    toggleBlock(editor.codemirror, editor.options.blockStyles.code);

export const toggleCodeButton: IToolbarButtonOptions = {
    action: toggleCode,
    icon: faCode,
    name: "code",
    title: "Code",
};
