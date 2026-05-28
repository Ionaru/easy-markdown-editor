import { dom } from "@fortawesome/fontawesome-svg-core";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import { registerIcons } from "./register-icons.js";
import { buttonRegistry, DEFERRED_BUTTON } from "./toolbar/button-registry.js";
import { defaultToolbar, isLayeredIcon } from "./toolbar/default-toolbar.js";

export { EasyMDE } from "./easymde.js";
export type { IEasyMDEPlugin, IEasyMDEPluginClass } from "./easymde.js";
export type { InputOptions, Options, ToolbarButton, ToolbarConfig } from "./options.js";
export { Preview } from "./preview/preview.js";
export { StatusBar } from "./status-bar/status-bar.js";
export { Toolbar } from "./toolbar/toolbar.js";
export { buildToolbar } from "./toolbar/build-toolbar.js";
export { defaultToolbar };
export type { IToolbarButtonOptions } from "./toolbar/default-toolbar.js";

const knownToolbarIcons = new Set<IconDefinition>();
for (const entry of Object.values(buttonRegistry)) {
    if (entry === DEFERRED_BUTTON) continue;
    if (isLayeredIcon(entry.icon)) {
        knownToolbarIcons.add(entry.icon.base);
        knownToolbarIcons.add(entry.icon.overlay);
    } else {
        knownToolbarIcons.add(entry.icon);
    }
}
registerIcons(...knownToolbarIcons);
dom.watch();

export { registerIcons };

import "./web-component.js";
export { EasyMarkdownEditor } from "./web-component.js";
