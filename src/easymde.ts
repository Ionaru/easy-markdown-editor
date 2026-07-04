import { history } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { HighlightStyle, defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorState, type Extension, Prec } from "@codemirror/state";
import { drawSelection, EditorView, keymap, placeholder } from "@codemirror/view";
import { tags } from "@lezer/highlight";

import { AlreadyConstructedError } from "./errors/already-constructed-error.js";
import { NotConstructedError } from "./errors/not-constructed-error.js";
import { createEasyMdeKeymap } from "./keymap.js";
import { resolveOptions, type InputOptions, type Options } from "./options.js";
import { Preview } from "./preview/preview.js";
import { StatusBar } from "./status-bar/status-bar.js";
import { buildToolbar } from "./toolbar/build-toolbar.js";
import { Toolbar } from "./toolbar/toolbar.js";
import { debounce, type Debounced } from "./utils/debounce.js";

import "./styles.scss";

export class EasyMDE {
    readonly #element: HTMLTextAreaElement;
    #container?: HTMLDivElement;
    #codemirror?: EditorView;
    readonly #options: Options;

    readonly #plugins: IEasyMDEPlugin[] = [];

    #preview?: Preview;

    #sideBySideCleanup?: () => void;
    #sideBySideDebouncedRender?: Debounced<[]>;

    #fullscreenCleanup?: () => void;

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
                background: "var(--easymde-code-bg)",
            },
            // Theme-aware colours for every group CodeMirror's defaultHighlightStyle tints.
            // This style is registered before defaultHighlightStyle, so it wins for these
            // tags; the CSS variables flip in dark mode to keep WCAG AAA (>=7:1) contrast in
            // both schemes (the light values mirror the original hues, dark values are
            // lightened to pass on the dark editor background). defaultHighlightStyle is kept
            // for its non-colour styling (emphasis/strong/strikethrough/heading decoration).
            {
                tag: [tags.atom, tags.bool, tags.url, tags.contentSeparator, tags.labelName],
                color: "var(--easymde-syntax-url)",
            },
            {
                tag: tags.meta,
                color: "var(--easymde-syntax-mark)",
            },
            {
                tag: tags.keyword,
                color: "var(--easymde-syntax-keyword)",
            },
            {
                tag: [tags.string, tags.deleted],
                color: "var(--easymde-syntax-string)",
            },
            {
                tag: [tags.literal, tags.inserted],
                color: "var(--easymde-syntax-literal)",
            },
            {
                tag: [tags.regexp, tags.escape, tags.special(tags.string)],
                color: "var(--easymde-syntax-escape)",
            },
            {
                tag: [
                    tags.definition(tags.variableName),
                    tags.definition(tags.propertyName),
                    tags.local(tags.variableName),
                    tags.special(tags.variableName),
                    tags.macroName,
                ],
                color: "var(--easymde-syntax-variable)",
            },
            {
                tag: [tags.typeName, tags.namespace, tags.className],
                color: "var(--easymde-syntax-type)",
            },
            {
                tag: tags.comment,
                color: "var(--easymde-syntax-comment)",
            },
            {
                tag: tags.invalid,
                color: "var(--easymde-syntax-invalid)",
            },
        ]);

        const extensions: Extension[] = [
            EditorView.lineWrapping,
            // Theme-aware caret and selection. CodeMirror's base theme hardcodes a black
            // caret and a light selection background, both of which disappear in dark mode;
            // routing them through CSS variables keeps them visible in either scheme.
            EditorView.theme({
                ".cm-cursor, .cm-dropCursor": {
                    borderLeftColor: "var(--easymde-text)",
                },
                // `!important` beats CodeMirror's base-theme selection rule regardless of its
                // internal DOM structure, so this stays robust across @codemirror/view versions
                // rather than depending on matching its high-specificity selector.
                ".cm-selectionBackground, .cm-content ::selection": {
                    backgroundColor: "var(--easymde-selection-bg) !important",
                },
            }),
            syntaxHighlighting(highlightStyle),
            syntaxHighlighting(defaultHighlightStyle),
            markdown({
                base: markdownLanguage,
                // codeLanguages: languages,
            }),
            drawSelection(),
            history(),
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
            createEasyMdeKeymap(this),
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

        if (this.#options.placeholder) {
            extensions.push(placeholder(this.#options.placeholder));
        }

        this.#sideBySideDebouncedRender = debounce(() => {
            if (this.isSideBySideActive()) {
                this.#preview?.render(this.value);
            }
        }, 300);
        extensions.push(
            EditorView.updateListener.of((update) => {
                if (!update.docChanged) return;
                if (!this.isSideBySideActive()) return;
                this.#sideBySideDebouncedRender?.();
            }),
        );

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
        if (this.#options.theme) {
            easyMDEContainer.dataset.easymdeTheme = this.#options.theme;
        }
        this.#element.insertAdjacentElement("afterend", easyMDEContainer);
        this.#container = easyMDEContainer;

        const toolbarLayout = buildToolbar(this.options);
        if (toolbarLayout.length > 0) {
            this.addPlugin(new Toolbar(this, toolbarLayout));
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
            // Measure BEFORE clearing side-by-side, otherwise the editor pane collapses to full
            // width first and offsetHeight reflects the post-reflow height, not what the user saw.
            this.#preview.element.style.minHeight = `${this.codemirror.dom.offsetHeight}px`;
        }
        if (next && this.isSideBySideActive()) {
            // Mutex: preview-only mode and side-by-side cannot coexist.
            this.toggleSideBySide();
        }
        this.container.classList.toggle("preview-active", next);
        if (next) {
            this.#preview?.render(this.value);
        }
        // Empty transaction wakes toolbar buttons whose `active` callback is
        // registered as a CodeMirror ViewPlugin update listener. No-op when
        // no toolbar plugin is installed, so the dispatch needs no guard.
        this.codemirror.dispatch({});
    }

    isPreviewActive(): boolean {
        return this.#container?.classList.contains("preview-active") ?? false;
    }

    toggleSideBySide(): void {
        const next = !this.isSideBySideActive();
        if (next) {
            if (this.isPreviewActive()) {
                this.togglePreview();
            }
            this.container.classList.add("easymde-side-by-side");
            this.#preview?.render(this.value);
            if (this.#options.syncSideBySidePreviewScroll && this.#preview) {
                this.#sideBySideCleanup = this.#installScrollSync(this.#preview.element);
            }
        } else {
            this.#sideBySideCleanup?.();
            this.#sideBySideCleanup = undefined;
            this.container.classList.remove("easymde-side-by-side");
        }
        // Optional V2-parity coupling: keep fullscreen in lockstep with side-by-side.
        if (this.#options.sideBySideFullscreen && next !== this.isFullscreenActive()) {
            this.toggleFullscreen();
        }
        this.codemirror.dispatch({});
    }

    isSideBySideActive(): boolean {
        return this.#container?.classList.contains("easymde-side-by-side") ?? false;
    }

    toggleFullscreen(): void {
        const next = !this.isFullscreenActive();
        if (next) {
            this.container.classList.add("easymde-fullscreen");
            const previousOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            const onKeyDown = (event: KeyboardEvent): void => {
                if (event.key === "Escape") {
                    this.toggleFullscreen();
                }
            };
            document.addEventListener("keydown", onKeyDown);
            this.#fullscreenCleanup = (): void => {
                document.removeEventListener("keydown", onKeyDown);
                document.body.style.overflow = previousOverflow;
            };
            this.#options.onToggleFullScreen?.(true);
        } else {
            this.#fullscreenCleanup?.();
            this.#fullscreenCleanup = undefined;
            this.container.classList.remove("easymde-fullscreen");
            this.#options.onToggleFullScreen?.(false);
        }
        this.codemirror.dispatch({});
    }

    isFullscreenActive(): boolean {
        return this.#container?.classList.contains("easymde-fullscreen") ?? false;
    }

    #installScrollSync(previewElement: HTMLElement): () => void {
        const editorScroll = this.codemirror.scrollDOM;
        let suppress = false;
        const sync = (source: HTMLElement, target: HTMLElement) => (): void => {
            if (suppress) return;
            const sourceMax = source.scrollHeight - source.clientHeight;
            const targetMax = target.scrollHeight - target.clientHeight;
            if (sourceMax <= 0 || targetMax <= 0) return;
            suppress = true;
            target.scrollTop = targetMax * (source.scrollTop / sourceMax);
            requestAnimationFrame(() => {
                suppress = false;
            });
        };
        const onEditorScroll = sync(editorScroll, previewElement);
        const onPreviewScroll = sync(previewElement, editorScroll);
        editorScroll.addEventListener("scroll", onEditorScroll, { passive: true });
        previewElement.addEventListener("scroll", onPreviewScroll, { passive: true });
        return (): void => {
            editorScroll.removeEventListener("scroll", onEditorScroll);
            previewElement.removeEventListener("scroll", onPreviewScroll);
        };
    }

    destruct(): void {
        if (this.#codemirror) {
            this.#element.value = this.value;
        }
        this.#sideBySideCleanup?.();
        this.#sideBySideCleanup = undefined;
        this.#sideBySideDebouncedRender?.cancel();
        this.#sideBySideDebouncedRender = undefined;
        this.#fullscreenCleanup?.();
        this.#fullscreenCleanup = undefined;
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
