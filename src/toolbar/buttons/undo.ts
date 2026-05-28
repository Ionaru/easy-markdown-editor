import { undo } from "@codemirror/commands";
import { faUndo } from "@fortawesome/free-solid-svg-icons";

import type { EasyMDE } from "../../easymde.js";
import type { IToolbarButtonOptions } from "../default-toolbar.js";

export const undoButton: IToolbarButtonOptions = {
    action: (editor: EasyMDE) => {
        undo(editor.codemirror);
    },
    icon: faUndo,
    name: "undo",
    title: "Undo",
};
