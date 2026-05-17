import { ViewUpdate } from "@codemirror/view";
import { faListCheck } from "@fortawesome/free-solid-svg-icons";

import { EasyMDE } from "../../easymde.js";
import { checkList, toggleList } from "../../utils/toggle-list.js";
import type { IToolbarButtonOptions } from "../default-toolbar.js";

export const toggleTaskList = (editor: EasyMDE): void => toggleList(editor.codemirror, "checklist");

export const checkTaskList = (editor: EasyMDE, _update: ViewUpdate): boolean =>
    checkList(editor.codemirror, "checklist");

export const toggleTaskListButton: IToolbarButtonOptions = {
    action: toggleTaskList,
    active: checkTaskList,
    icon: faListCheck,
    name: "task-list",
    title: "Task List",
};
