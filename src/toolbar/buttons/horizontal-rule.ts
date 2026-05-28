import { faMinus } from "@fortawesome/free-solid-svg-icons";

import type { EasyMDE } from "../../easymde.js";
import { insertText } from "../../utils/insert-text.js";
import type { IToolbarButtonOptions } from "../default-toolbar.js";

export const drawHorizontalRule = (editor: EasyMDE): void =>
    insertText(editor.codemirror, editor.options.insertTexts.horizontalRule);

export const horizontalRuleButton: IToolbarButtonOptions = {
    action: drawHorizontalRule,
    icon: faMinus,
    name: "horizontal-rule",
    title: "Horizontal Rule",
};
