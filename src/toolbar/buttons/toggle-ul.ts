import { ViewUpdate } from "@codemirror/view";
import { faListUl } from "@fortawesome/free-solid-svg-icons";

import { EasyMDE } from "../../easymde.js";
import { checkList, toggleList } from "../../utils/toggle-list.js";
import type { IToolbarButtonOptions } from "../default-toolbar.js";

export const toggleUnorderedList = (editor: EasyMDE): void =>
    toggleList(editor.codemirror, "ul", editor.options.unorderedListStyle);

export const checkUnorderedList = (editor: EasyMDE, _update: ViewUpdate): boolean =>
    checkList(editor.codemirror, "ul");

export const toggleUnorderedListButton: IToolbarButtonOptions = {
    action: toggleUnorderedList,
    active: checkUnorderedList,
    icon: faListUl,
    name: "unordered-list",
    title: "Generic List",
};
