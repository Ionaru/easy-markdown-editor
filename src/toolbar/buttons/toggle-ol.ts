import { ViewUpdate } from "@codemirror/view";
import { faListOl } from "@fortawesome/free-solid-svg-icons";

import { EasyMDE } from "../../easymde.js";
import { checkOrderedList, toggleOrderedList } from "../../utils/toggle-ol.js";
import type { IToolbarButtonOptions } from "../default-toolbar.js";

export const toggleOrderedListAction = (editor: EasyMDE): void =>
    toggleOrderedList(editor.codemirror);

export const checkOrderedListActive = (editor: EasyMDE, _update: ViewUpdate): boolean =>
    checkOrderedList(editor.codemirror);

export const toggleOrderedListButton: IToolbarButtonOptions = {
    action: toggleOrderedListAction,
    active: checkOrderedListActive,
    icon: faListOl,
    name: "ordered-list",
    title: "Numbered List",
};
