import { ViewUpdate } from "@codemirror/view";
import { faListUl } from "@fortawesome/free-solid-svg-icons";

import { EasyMDE } from "../../easymde.js";
import { checkLine, toggleLine } from "../../utils/toggle-line.js";
import type { IToolbarButtonOptions } from "../default-toolbar.js";

export const toggleUnorderedList = (editor: EasyMDE): void =>
    toggleLine(editor.codemirror, editor.options.unorderedListStyle);

export const checkUnorderedList = (editor: EasyMDE, _update: ViewUpdate): boolean =>
    checkLine(editor.codemirror, editor.options.unorderedListStyle);

export const toggleUnorderedListButton: IToolbarButtonOptions = {
    action: toggleUnorderedList,
    active: checkUnorderedList,
    icon: faListUl,
    name: "unordered-list",
    title: "Generic List",
};
