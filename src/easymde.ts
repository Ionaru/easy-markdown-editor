import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { HighlightStyle, defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorState, type Extension, Prec } from "@codemirror/state";
import { drawSelection, EditorView, keymap } from "@codemirror/view";
import { tags } from "@lezer/highlight";

import { AlreadyConstructedError } from "./errors/already-constructed-error.js";
import { NotConstructedError } from "./errors/not-constructed-error.js";
import { resolveOptions, type InputOptions, type Options } from "./options.js";
import { Preview } from "./preview/preview.js";
import { StatusBar } from "./status-bar/status-bar.js";
import { defaultToolbar } from "./toolbar/default-toolbar.js";
import { Toolbar } from "./toolbar/toolbar.js";

import "./styles.scss";

export class EasyMDE {
    readonly #element: HTMLTextAreaElement;
    #container?: HTMLDivElement;
    #codemirror?: EditorView;
    readonly #options: Options;

    readonly #plugins: IEasyMDEPlugin[] = [];

    #preview?: Preview;

    #form?: HTMLFormElement;
    #handleFormSubmit?: () => void;

    constructor(options: InputOptions) {
        this.#options = resolveOptions(options);
        this.#element = EasyMDE.#verifyAndReturnElement(this.#options.element);
        this.construct();
    }

    get container(): HTMLDivElement {
        if (!this.#container) {
            throw new NotConstructedError();
        }
        return this.#container;
    }

    get codemirror(): EditorView {
        if (!this.#codemirror) {
            throw new NotConstructedError();
        }
        return this.#codemirror;
    }

    get options(): Readonly<Options> {
        return Object.freeze(this.#options);
    }

    get element(): HTMLTextAreaElement {
        return this.#element;
    }

    static #verifyAndReturnElement(element?: HTMLElement): HTMLTextAreaElement {
        if (!(element instanceof HTMLTextAreaElement)) {
            throw new TypeError('EasyMDE: Parameter "element" must be a TextArea.');
        }

        return element;
    }

    get isRendered(): boolean {
        return Boolean(this.#container && this.#codemirror);
    }

    focus(): void {
        this.codemirror.focus();
    }

    get value(): string {
        return this.codemirror.state.doc.toString();
    }

    set value(value: string) {
        this.codemirror.dispatch({
            changes: {
                from: 0,
                to: this.codemirror.state.doc.length,
                insert: value,
            },
        });
    }

    construct(): void {
        if (this.#container && this.#codemirror) {
            throw new AlreadyConstructedError();
        }

        // Customize the markdown highlight style.
        const highlightStyle = HighlightStyle.define([
            {
                tag: tags.heading1,
                fontSize: "200%",
                lineHeight: "200%",
                textDecoration: "none",
            },
            {
                tag: tags.heading2,
                fontSize: "160%",
                lineHeight: "160%",
                textDecoration: "none",
            },
            {
                tag: tags.heading3,
                fontSize: "125%",
                lineHeight: "125%",
                textDecoration: "none",
            },
            {
                tag: tags.heading4,
                fontSize: "110%",
                lineHeight: "110%",
                textDecoration: "none",
            },
            {
                tag: tags.heading5,
                fontSize: "105%",
                lineHeight: "105%",
                textDecoration: "none",
            },
            {
                tag: tags.heading6,
                fontSize: "100%",
                lineHeight: "100%",
                textDecoration: "none",
            },
            {
                tag: tags.monospace,
                fontFamily: "monospace",
                textDecoration: "none",
                background: "rgba(0, 0, 0, 0.05)",
            },
        ]);

        const extensions: Extension[] = [
            EditorView.lineWrapping,
            syntaxHighlighting(highlightStyle),
            syntaxHighlighting(defaultHighlightStyle),
            markdown({
                base: markdownLanguage,
                // codeLanguages: languages,
            }),
            drawSelection(),
            Prec.low(
                keymap.of([
                    {
                        key: "Enter",
                        run: (view) => {
                            view.dispatch(view.state.replaceSelection(view.state.lineBreak));
                            return true;
                        },
                    },
                ]),
            ),
        ];

        if (this.#options.forceSync) {
            extensions.push(
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        this.#element.value = update.state.doc.toString();
                    }
                }),
            );
        }

        this.#element.hidden = true;
        const initialDoc = this.#options.trimInitialValue
            ? this.#element.value.trim()
            : this.#element.value;
        this.#codemirror = new EditorView({
            state: EditorState.create({
                doc: initialDoc,
                extensions,
                selection: {
                    anchor: initialDoc.length,
                },
            }),
            // parent: this.element.parentElement || document.body,
        });

        const easyMDEContainer = this.#createContainer();
        this.#element.insertAdjacentElement("afterend", easyMDEContainer);
        this.#container = easyMDEContainer;

        if (this.options.toolbar !== false) {
            this.addPlugin(new Toolbar(this, defaultToolbar));
        }

        easyMDEContainer.append(this.codemirror.dom);

        const preview = new Preview(this);
        this.addPlugin(preview);
        this.#preview = preview;

        if (this.options.statusbar !== false) {
            this.addPlugin(new StatusBar(this));
        }

        const form = this.#element.closest("form");
        if (form) {
            const handler = (): void => {
                this.#element.value = this.value;
            };
            form.addEventListener("submit", handler);
            this.#form = form;
            this.#handleFormSubmit = handler;
        }

        this.codemirror.focus();
    }

    togglePreview(): void {
        const next = !this.isPreviewActive();
        if (next && this.#preview) {
            // Lock preview to editor's current height so toggling does not resize the container.
            this.#preview.element.style.minHeight = `${this.codemirror.dom.offsetHeight}px`;
        }
        this.container.classList.toggle("preview-active", next);
        if (next) {
            this.#preview?.render(this.value);
        }
        if (this.options.toolbar !== false) {
            // Empty transaction wakes toolbar buttons whose `active` callback
            // is registered as a CodeMirror ViewPlugin update listener.
            this.codemirror.dispatch({});
        }
    }

    isPreviewActive(): boolean {
        return this.#container?.classList.contains("preview-active") ?? false;
    }

    destruct(): void {
        if (this.#codemirror) {
            this.#element.value = this.value;
        }
        if (this.#form && this.#handleFormSubmit) {
            this.#form.removeEventListener("submit", this.#handleFormSubmit);
            this.#form = undefined;
            this.#handleFormSubmit = undefined;
        }
        let plugin: IEasyMDEPlugin | undefined;
        while ((plugin = this.#plugins.pop())) {
            plugin.unmount();
        }
        this.#codemirror?.destroy();
        this.#codemirror = undefined;
        this.#preview = undefined;
        this.#container?.remove();
        this.#container = undefined;
        this.#element.hidden = false;
    }

    addPlugin(plugin: IEasyMDEPlugin): IEasyMDEPlugin {
        this.#plugins.push(plugin);
        plugin.mount();
        return plugin;
    }

    #createContainer(): HTMLDivElement {
        const container = document.createElement("div");
        container.classList.add("easymde-container");
        return container;
    }
}

export type IEasyMDEPluginClass<TArgs extends unknown[] = []> = new (
    easyMDE: EasyMDE,
    ...args: TArgs
) => IEasyMDEPlugin;

export interface IEasyMDEPlugin {
    readonly element: HTMLElement;
    mount(): void;
    unmount(): void;
}
