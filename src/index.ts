export { EasyMDE } from "./easymde.js";
export type { IEasyMDEPlugin, IEasyMDEPluginClass } from "./easymde.js";
export type { InputOptions, Options } from "./options.js";
import { dom } from "@fortawesome/fontawesome-svg-core";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import { registerIcons } from "./register-icons.js";
import { defaultToolbar } from "./toolbar/default-toolbar.js";

const defaultToolbarIcons = new Set<IconDefinition>();
for (const section of defaultToolbar) {
    for (const button of section) {
        defaultToolbarIcons.add(button.icon);
    }
}
registerIcons(...defaultToolbarIcons);
dom.watch();

export { registerIcons };

export class EasyMarkdownEditor extends HTMLElement {
    name = "World";

    constructor() {
        super();
        this.name = "World";
    }

    connectedCallback() {
        const shadow = this.attachShadow({ mode: "closed" });
        shadow.innerHTML = "Hello World!" + this.name;
    }

    static get observedAttributes() {
        return ["name"];
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === "name") {
            this.name = newValue;
        }
        console.log("Attribute Changed", name, oldValue, newValue);
    }
}

customElements.define("easy-markdown-editor", EasyMarkdownEditor);
