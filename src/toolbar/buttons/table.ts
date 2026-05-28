import { faTable } from "@fortawesome/free-solid-svg-icons";

import type { EasyMDE } from "../../easymde.js";
import { insertText } from "../../utils/insert-text.js";
import type { IToolbarButtonOptions } from "../default-toolbar.js";

/** Offset of the first cell's content within a pipe-table template. */
export const firstCellOffset = (template: string): number => {
    const pipe = template.indexOf("|");
    if (pipe === -1) return template.length;
    let i = pipe + 1;
    while (template[i] === " ") i++;
    return i;
};

export const drawTable = (editor: EasyMDE): void => {
    const template = editor.options.insertTexts.table;
    insertText(editor.codemirror, template, firstCellOffset(template));
};

export const tableButton: IToolbarButtonOptions = {
    action: drawTable,
    icon: faTable,
    name: "table",
    title: "Insert Table",
};
