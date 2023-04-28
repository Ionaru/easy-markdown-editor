/* eslint-disable sort-keys,@typescript-eslint/member-ordering,max-classes-per-file */
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
// import { languages } from "@codemirror/language-data"; // Costs 800KB, probably should be a manual plugin
import {
    HighlightStyle,
    defaultHighlightStyle,
    syntaxHighlighting,
    // HighlightStyle,
    // tags
} from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { drawSelection, EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import { marked } from 'marked';

import { InputOptions, Options } from './options';

import './styles.scss';
import { importDefaultToolbar, importToolbar } from '.';

class NotConstructedError extends Error {
    public constructor() {
        super(
            'EasyMDE is not initialized, run the "construct()" method to do so.',
        );
        this.name = 'NotConstructedError';
    }
}

class AlreadyConstructedError extends Error {
    public constructor() {
        super('EasyMDE is already initialized.');
        this.name = 'AlreadyConstructedError';
    }
}

export class EasyMDE {
    private readonly element: HTMLTextAreaElement;
    private _container?: HTMLDivElement;
    private _codemirror?: EditorView;
    // private rendered = false;
    private readonly _options: Options;

    private readonly plugins: IEasyMDEPlugin[] = [];

    public constructor(options: InputOptions) {
        this._options = {
            ...options,
            blockStyles: {
                bold: '**',
                italic: '*',
                strikethrough: '~~',
                code: '`',
            },
        };
        this.element = EasyMDE.verifyAndReturnElement(options.element);
        marked.parse('# EasyMDE');
        this.construct();
    }

    public get container(): HTMLDivElement {
        if (!this._container) {
            throw new NotConstructedError();
        }
        return this._container;
    }

    public get codemirror(): EditorView {
        if (!this._codemirror) {
            throw new NotConstructedError();
        }
        return this._codemirror;
    }

    public get options(): Readonly<Options> {
        return Object.freeze(this._options);
    }

    private static verifyAndReturnElement(
        element?: HTMLElement,
    ): HTMLTextAreaElement {
        if (!element) {
            throw new Error('EasyMDE: Parameter "element" is null.');
        }

        if (!(element instanceof HTMLTextAreaElement)) {
            throw new TypeError(
                'EasyMDE: Parameter "element" must be a TextArea.',
            );
        }

        return element;
    }

    public get isRendered(): boolean {
        return Boolean(this.container && this.codemirror);
    }

    public async construct(): Promise<void> {
        if (this._container && this._codemirror) {
            throw new AlreadyConstructedError();
        }

        // Customize the markdown highlight style.
        const highlightStyle = HighlightStyle.define([
            {
                tag: tags.heading1,
                fontSize: '200%',
                lineHeight: '200%',
                textDecoration: 'none',
            },
            {
                tag: tags.heading2,
                fontSize: '160%',
                lineHeight: '160%',
                textDecoration: 'none',
            },
            {
                tag: tags.heading3,
                fontSize: '125%',
                lineHeight: '125%',
                textDecoration: 'none',
            },
            {
                tag: tags.heading4,
                fontSize: '110%',
                lineHeight: '110%',
                textDecoration: 'none',
            },
            {
                tag: tags.heading5,
                fontSize: '105%',
                lineHeight: '105%',
                textDecoration: 'none',
            },
            {
                tag: tags.heading6,
                fontSize: '100%',
                lineHeight: '100%',
                textDecoration: 'none',
            },
            {
                tag: tags.monospace,
                fontFamily: 'monospace',
                textDecoration: 'none',
                background: 'rgba(0, 0, 0, 0.05)',
            },
        ]);

        this.element.hidden = true;
        this._codemirror = new EditorView({
            state: EditorState.create({
                doc: this.element.value,
                extensions: [
                    syntaxHighlighting(highlightStyle),
                    syntaxHighlighting(defaultHighlightStyle),
                    markdown({
                        base: markdownLanguage,
                        // codeLanguages: languages,
                    }),
                    drawSelection(),
                ],
                selection: {
                    anchor: this.element.value.length,
                },
            }),
            // parent: this.element.parentElement || document.body,
        });

        const easyMDEContainer = this.createContainer();

        if (this.options.toolbar !== false) {
            easyMDEContainer.append(await this.createToolbar());
        }

        easyMDEContainer.append(this.codemirror.dom);

        if (this.options.statusbar !== false) {
            easyMDEContainer.append(await this.createStatusBar());
        }

        this.element.insertAdjacentElement('afterend', easyMDEContainer);

        this.codemirror.focus();

        this._container = easyMDEContainer;
    }

    public destruct(): void {
        this.element.value = this.codemirror.state.doc.toString();

        for (const plugin of this.plugins) {
            plugin.destroy();
        }

        this.codemirror.destroy();
        this.container.remove();

        this._container = undefined;
        this._codemirror = undefined;

        this.element.hidden = false;
    }

    public async addPlugin(plugin: IEasyMDEPlugin): Promise<IEasyMDEPlugin> {
        this.plugins.push(plugin);
        return plugin;
    }

    private async createToolbar(): Promise<HTMLDivElement> {
        const [{ Toolbar }, { defaultToolbar }] = await Promise.all([
            importToolbar(),
            importDefaultToolbar(),
        ]);
        const toolbar = new Toolbar(this, defaultToolbar);
        await this.addPlugin(toolbar);
        // await toolbar.build(defaultToolbar);
        return toolbar.element;
    }

    private async createStatusBar(): Promise<HTMLDivElement> {
        const { StatusBar } = await import('./status-bar/status-bar');
        const statusBar = new StatusBar(this);
        return statusBar.element;
    }

    private createContainer(): HTMLDivElement {
        const container = document.createElement('div');
        container.classList.add('easymde-container');
        return container;
    }
}

export type IEasyMDEPluginClass = new (easyMDE: EasyMDE) => IEasyMDEPlugin;

export interface IEasyMDEPlugin {
    // new (editor: EasyMDE, ...args: any): IEasyMDEPlugin;
    build(arguments_: any): Promise<void>;

    destroy(): Promise<void>;
}
