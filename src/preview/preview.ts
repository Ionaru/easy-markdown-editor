import { Marked } from "marked";

import type { EasyMDE, IEasyMDEPlugin } from "../easymde.js";
import { renderMarkdownToHtmlForPreview } from "./render-markdown-to-html-for-preview.js";

export class Preview implements IEasyMDEPlugin {
    readonly element: HTMLDivElement;
    readonly #editor: EasyMDE;
    readonly #marked: Marked;

    constructor(editor: EasyMDE) {
        this.#editor = editor;
        this.element = document.createElement("div");
        this.element.classList.add("easymde-preview");

        this.#marked = new Marked();
        const markedOptions = editor.options.renderingConfig?.markedOptions;
        if (markedOptions) {
            this.#marked.setOptions(markedOptions);
        }
    }

    mount(): void {
        this.#editor.container.append(this.element);
    }

    unmount(): void {
        this.element.remove();
    }

    render(markdown: string): void {
        this.element.innerHTML = renderMarkdownToHtmlForPreview(
            markdown,
            this.#marked,
            this.#editor.options,
            this.element,
        );
    }
}
