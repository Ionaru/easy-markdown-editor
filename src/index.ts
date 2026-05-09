export { createEasyMDE, EasyMDE } from "./easymde.js";
export type { IEasyMDEPlugin, IEasyMDEPluginClass } from "./easymde.js";
export * from "./imports.js";
export type { InputOptions, Options } from "./options.js";
import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";

library.add(fas);
dom.watch();

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
