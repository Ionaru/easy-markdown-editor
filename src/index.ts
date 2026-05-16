import { dom } from "@fortawesome/fontawesome-svg-core";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import { registerIcons } from "./register-icons.js";
import { defaultToolbar, isLayeredIcon } from "./toolbar/default-toolbar.js";

export { EasyMDE } from "./easymde.js";
export type { IEasyMDEPlugin, IEasyMDEPluginClass } from "./easymde.js";
export type { InputOptions, Options } from "./options.js";
export { Preview } from "./preview/preview.js";
export { StatusBar } from "./status-bar/status-bar.js";
export { Toolbar } from "./toolbar/toolbar.js";
export { defaultToolbar };
export type { IToolbarButtonOptions } from "./toolbar/default-toolbar.js";

const defaultToolbarIcons = new Set<IconDefinition>();
for (const section of defaultToolbar) {
    for (const button of section) {
        if (isLayeredIcon(button.icon)) {
            defaultToolbarIcons.add(button.icon.base);
            defaultToolbarIcons.add(button.icon.overlay);
        } else {
            defaultToolbarIcons.add(button.icon);
        }
    }
}
registerIcons(...defaultToolbarIcons);
dom.watch();

export { registerIcons };

import "./web-component.js";
export { EasyMarkdownEditor } from "./web-component.js";
