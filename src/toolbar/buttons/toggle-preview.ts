import { faEye } from "@fortawesome/free-solid-svg-icons";

import type { EasyMDE } from "../../easymde.js";
import type { IToolbarButtonOptions } from "../default-toolbar.js";

export const togglePreviewButton: IToolbarButtonOptions = {
    action: (editor: EasyMDE) => editor.togglePreview(),
    active: (editor: EasyMDE) => editor.isPreviewActive(),
    icon: faEye,
    name: "preview",
    title: "Toggle Preview",
};
