import { ViewUpdate } from "@codemirror/view";
import { faFileCode } from "@fortawesome/free-solid-svg-icons";

import { EasyMDE } from "../../easymde.js";
import {
    checkCodeBlock as checkCodeBlockUtil,
    toggleCodeBlock as toggleCodeBlockUtil,
} from "../../utils/toggle-code-block.js";
import type { IToolbarButtonOptions } from "../default-toolbar.js";

export const toggleCodeBlock = (editor: EasyMDE): void => toggleCodeBlockUtil(editor.codemirror);

export const checkCodeBlock = (editor: EasyMDE, _update: ViewUpdate) =>
    checkCodeBlockUtil(editor.codemirror);

export const toggleCodeBlockButton: IToolbarButtonOptions = {
    action: toggleCodeBlock,
    active: checkCodeBlock,
    icon: faFileCode,
    name: "code-block",
    title: "Code block",
};
