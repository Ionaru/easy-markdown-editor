import { redo } from "@codemirror/commands";
import { faRedo } from "@fortawesome/free-solid-svg-icons";

import type { EasyMDE } from "../../easymde.js";
import type { IToolbarButtonOptions } from "../default-toolbar.js";

export const redoButton: IToolbarButtonOptions = {
    action: (editor: EasyMDE) => {
        redo(editor.codemirror);
    },
    icon: faRedo,
    name: "redo",
    title: "Redo",
};
