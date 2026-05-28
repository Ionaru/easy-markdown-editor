import { faColumns } from "@fortawesome/free-solid-svg-icons";

import type { EasyMDE } from "../../easymde.js";
import type { IToolbarButtonOptions } from "../default-toolbar.js";

export const toggleSideBySideButton: IToolbarButtonOptions = {
    action: (editor: EasyMDE) => editor.toggleSideBySide(),
    active: (editor: EasyMDE) => editor.isSideBySideActive(),
    icon: faColumns,
    name: "side-by-side",
    title: "Toggle Side by Side",
};
