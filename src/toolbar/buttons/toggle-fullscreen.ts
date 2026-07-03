import { faExpand } from "@fortawesome/free-solid-svg-icons";

import type { EasyMDE } from "../../easymde.js";
import type { IToolbarButtonOptions } from "../default-toolbar.js";

export const toggleFullscreenButton: IToolbarButtonOptions = {
    action: (editor: EasyMDE) => editor.toggleFullscreen(),
    active: (editor: EasyMDE) => editor.isFullscreenActive(),
    icon: faExpand,
    name: "fullscreen",
    title: "Toggle Fullscreen",
};
