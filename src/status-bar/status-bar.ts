import { SelectionRange, StateEffect, Line } from "@codemirror/state";
import { ViewPlugin, ViewUpdate } from "@codemirror/view";

import { EasyMDE, type IEasyMDEPlugin, type IEasyMDEPluginClass } from "../easymde.js";
import { countWords } from "../utils/count-words.js";

export class StatusBar implements IEasyMDEPlugin {
    readonly element: HTMLDivElement;

    #characterCount = 0;
    #wordCount = 0;
    #lineCount = 1;
    #cursorLine = 1;
    #cursorColumn = 1;

    #selectionStart = 0;
    #selectionEnd = 0;

    constructor(private editor: EasyMDE) {
        this.element = document.createElement("div");
        this.element.className = "easymde-statusbar";
        // Announce counter updates to assistive tech. `polite` waits for a pause,
        // so the per-keystroke render() below never interrupts active typing.
        this.element.setAttribute("role", "status");
        this.element.setAttribute("aria-live", "polite");

        // Initial values
        this.#characterCount = this.editor.codemirror.state.doc.length;
        this.#wordCount = countWords(this.editor.codemirror.state.doc);
        this.#lineCount = this.editor.codemirror.state.doc.lines;

        const line = this.editor.codemirror.state.doc.lineAt(
            this.editor.codemirror.state.selection.main.to,
        );
        this.#cursorLine = line.number;
        this.#cursorColumn = this.editor.codemirror.state.selection.main.to - line.from + 1;
        this.#selectionStart = this.editor.codemirror.state.selection.main.from;
        this.#selectionEnd = this.editor.codemirror.state.selection.main.to;

        this.editor.codemirror.dispatch({
            effects: StateEffect.appendConfig.of(
                ViewPlugin.define(() => ({
                    update: (update: ViewUpdate) => {
                        const document = update.state.doc;
                        const selection = update.state.selection.main;

                        this.#characterCount = document.length;
                        this.#wordCount = countWords(document);
                        this.#lineCount = document.lines;

                        const direction = this.#getSelectionDirection(selection);
                        const toLine = document.lineAt(selection.to);
                        const fromLine = document.lineAt(selection.from);

                        let cursorLine: Line;

                        if (direction === "left") {
                            // Cursor is at the start of the selection.
                            cursorLine = fromLine;
                            this.#cursorColumn = selection.from - cursorLine.from;
                        } else {
                            // Cursor is at the end of the selection, or there is no selection.
                            cursorLine = toLine;
                            this.#cursorColumn = selection.to - cursorLine.from;

                            if (this.#cursorColumn > toLine.length) {
                                // Column is incorrect, can happen when Ctrl+A is used. We need to manually adjust it.
                                this.#cursorColumn = toLine.length;
                            }
                        }

                        this.#cursorLine = cursorLine.number;
                        this.#selectionStart = selection.from;
                        this.#selectionEnd = selection.to;

                        // We start counting columns at 1.
                        this.#cursorColumn++;

                        this.render();
                    },
                })),
            ),
        });

        this.render();
    }

    render() {
        this.element.innerHTML = `
        <span class="status-bar-element">Lines: ${this.#lineCount}</span>
        <span class="status-bar-element">Words: ${this.#wordCount}</span>
        <span class="status-bar-element">Characters: ${this.#characterCount}</span>
        <span class="status-bar-element">Pos: ${this.#cursorLine}:${this.#cursorColumn}</span>
        `;
    }

    mount(): void {
        this.editor.container.append(this.element);
    }

    unmount(): void {
        this.element.remove();
    }

    #getSelectionDirection(selection: SelectionRange): "right" | "left" | undefined {
        return selection.from === this.#selectionStart
            ? "right"
            : // eslint-disable-next-line sonarjs/no-nested-conditional
              selection.to === this.#selectionEnd
              ? "left"
              : undefined;
    }
}

StatusBar satisfies IEasyMDEPluginClass;
