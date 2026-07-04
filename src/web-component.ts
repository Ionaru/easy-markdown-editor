import { EasyMDE } from "./easymde.js";
import type { InputOptions } from "./options.js";

export class EasyMarkdownEditor extends HTMLElement {
    static readonly observedAttributes = [
        "value",
        "placeholder",
        "toolbar",
        "statusbar",
        "theme",
        "name",
    ];

    #editor?: EasyMDE;
    #textarea?: HTMLTextAreaElement;
    #autoCreatedTextarea = false;

    connectedCallback(): void {
        if (this.#editor) return;

        const existing = this.querySelector("textarea");
        if (existing) {
            this.#textarea = existing;
            this.#autoCreatedTextarea = false;
        } else {
            const captured = this.textContent ?? "";
            const hasContent = captured.trim().length > 0;
            if (hasContent) {
                for (const node of Array.from(this.childNodes)) {
                    if (node.nodeType === Node.TEXT_NODE) node.remove();
                }
            }
            this.#textarea = document.createElement("textarea");
            if (hasContent) this.#textarea.value = captured;
            this.append(this.#textarea);
            this.#autoCreatedTextarea = true;
        }

        const initialValue = this.getAttribute("value");
        if (initialValue !== null) this.#textarea.value = initialValue;

        const name = this.getAttribute("name");
        if (name !== null) this.#textarea.name = name;

        const options: InputOptions = { element: this.#textarea };
        const placeholder = this.getAttribute("placeholder");
        if (placeholder !== null) options.placeholder = placeholder;
        if (this.getAttribute("toolbar") === "false") options.toolbar = false;
        if (this.getAttribute("statusbar") === "false") options.statusbar = false;
        if (this.getAttribute("trim") === "false") options.trimInitialValue = false;
        const theme = this.getAttribute("theme");
        if (theme !== null) options.theme = theme;

        this.#editor = new EasyMDE(options);
    }

    disconnectedCallback(): void {
        this.#editor?.destruct();
        this.#editor = undefined;
        if (this.#autoCreatedTextarea) this.#textarea?.remove();
        this.#textarea = undefined;
        this.#autoCreatedTextarea = false;
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
        if (oldValue === newValue) return;
        if (!this.#editor) return;
        if (name === "value" && newValue !== null && this.#editor.value !== newValue) {
            this.#editor.value = newValue;
        } else if (name === "theme") {
            if (newValue === null) delete this.#editor.container.dataset.easymdeTheme;
            else this.#editor.container.dataset.easymdeTheme = newValue;
        } else if (name === "name" && this.#textarea) {
            this.#textarea.name = newValue ?? "";
        }
    }

    get value(): string {
        return this.#editor?.value ?? this.getAttribute("value") ?? "";
    }

    set value(text: string) {
        if (this.#editor) this.#editor.value = text;
        else this.setAttribute("value", text);
    }
}

customElements.define("easy-markdown-editor", EasyMarkdownEditor);
