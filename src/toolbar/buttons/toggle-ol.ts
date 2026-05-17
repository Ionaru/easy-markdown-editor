import { ViewUpdate } from "@codemirror/view";
import { faListOl } from "@fortawesome/free-solid-svg-icons";

import { EasyMDE } from "../../easymde.js";
import { checkList, toggleList } from "../../utils/toggle-list.js";
import type { IToolbarButtonOptions } from "../default-toolbar.js";

export const toggleOrderedList = (editor: EasyMDE): void =>
    toggleList(editor.codemirror, { target: "ol", delim: editor.options.orderedListDelimiter });

export const checkOrderedList = (editor: EasyMDE, _update: ViewUpdate): boolean =>
    checkList(editor.codemirror, "ol");

export const toggleOrderedListButton: IToolbarButtonOptions = {
    action: toggleOrderedList,
    active: checkOrderedList,
    icon: faListOl,
    name: "ordered-list",
    title: "Numbered List",
};
