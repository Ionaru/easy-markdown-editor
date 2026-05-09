import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { HighlightStyle, defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { drawSelection, EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { marked } from "marked";

import { AlreadyConstructedError } from "./errors/already-constructed-error.js";
import { NotConstructedError } from "./errors/not-constructed-error.js";
import { importDefaultToolbar, importToolbar } from "./imports.js";
import type { InputOptions, Options } from "./options.js";

import "./styles.scss";

export class EasyMDE {
    static readonly #constructionToken = Symbol("EasyMDE construction");

    readonly #element: HTMLTextAreaElement;
    #container?: HTMLDivElement;
    #codemirror?: EditorView;
    readonly #options: Options;

    readonly #plugins: IEasyMDEPlugin[] = [];

    private constructor(options: InputOptions, constructionToken: symbol) {
        if (constructionToken !== EasyMDE.#constructionToken) {
            throw new TypeError("EasyMDE: Use EasyMDE.create(options) to create an editor.");
        }

        this.#options = {
            ...options,
            blockStyles: {
                bold: "**",
                italic: "*",
                strikethrough: "~~",
                code: "`",
            },
        };
        this.#element = EasyMDE.#verifyAndReturnElement(options.element);
        marked.parse("# EasyMDE", { async: false });
    }

    static async create(options: InputOptions): Promise<EasyMDE> {
        const editor = new EasyMDE(options, EasyMDE.#constructionToken);
        await editor.#construct();
        return editor;
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
        return this.getValue();
    }

    set value(value: string) {
        this.setValue(value);
    }

    getValue(): string {
        return this.codemirror.state.doc.toString();
    }

    setValue(value: string): void {
        this.codemirror.dispatch({
            changes: {
                from: 0,
                to: this.codemirror.state.doc.length,
                insert: value,
            },
        });
    }

    async #construct(): Promise<void> {
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

        this.#element.hidden = true;
        this.#codemirror = new EditorView({
            state: EditorState.create({
                doc: this.#element.value,
                extensions: [
                    EditorView.lineWrapping,
                    syntaxHighlighting(highlightStyle),
                    syntaxHighlighting(defaultHighlightStyle),
                    markdown({
                        base: markdownLanguage,
                        // codeLanguages: languages,
                    }),
                    drawSelection(),
                ],
                selection: {
                    anchor: this.#element.value.length,
                },
            }),
            // parent: this.element.parentElement || document.body,
        });

        const easyMDEContainer = this.#createContainer();

        if (this.options.toolbar !== false) {
            easyMDEContainer.append(await this.#createToolbar());
        }

        easyMDEContainer.append(this.codemirror.dom);

        if (this.options.statusbar !== false) {
            easyMDEContainer.append(await this.#createStatusBar());
        }

        this.#element.insertAdjacentElement("afterend", easyMDEContainer);

        this.codemirror.focus();

        this.#container = easyMDEContainer;
    }

    destroy(): void {
        this.#element.value = this.getValue();

        for (const plugin of this.#plugins) {
            void plugin.destroy();
        }

        this.codemirror.destroy();
        this.container.remove();

        this.#container = undefined;
        this.#codemirror = undefined;

        this.#element.hidden = false;
    }

    addPlugin(plugin: IEasyMDEPlugin): IEasyMDEPlugin {
        this.#plugins.push(plugin);
        return plugin;
    }

    async #createToolbar(): Promise<HTMLDivElement> {
        const [{ Toolbar }, { defaultToolbar }] = await Promise.all([
            importToolbar(),
            importDefaultToolbar(),
        ]);
        const toolbar = new Toolbar(this, defaultToolbar);
        this.addPlugin(toolbar);
        return toolbar.element;
    }

    async #createStatusBar(): Promise<HTMLDivElement> {
        const { StatusBar } = await import("./status-bar/status-bar.js");
        const statusBar = new StatusBar(this);
        return statusBar.element;
    }

    #createContainer(): HTMLDivElement {
        const container = document.createElement("div");
        container.classList.add("easymde-container");
        return container;
    }
}

export const createEasyMDE = (options: InputOptions): Promise<EasyMDE> => EasyMDE.create(options);

export type IEasyMDEPluginClass = new (easyMDE: EasyMDE) => IEasyMDEPlugin;

export interface IEasyMDEPlugin {
    build(arguments_: unknown): Promise<void>;

    destroy(): Promise<void>;
}
