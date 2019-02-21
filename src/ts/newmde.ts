import * as cm from 'codemirror';
import 'codemirror/addon/display/fullscreen';
import * as hljs from 'highlight.js';
import * as marked from 'marked';

interface IRenderingConfig {
    markedOptions?: any;
    singleLineBreaks?: any;
    codeSyntaxHighlighting?: any;
    hljs?: hljs.HLJSStatic;
}

interface IOptions {
    autoDownloadFontAwesome?: boolean | undefined;
    renderingConfig?: IRenderingConfig | undefined;
}

interface IToolBarButtonOptions {
    action?: any;
    icon: string;
    name: string;
    title: string;
}

module.exports = class NewMDE {

    private static verifyAndReturnElement(element?: HTMLElement): HTMLTextAreaElement {
        if (!element) {
            throw new Error('SimpleMDE: Parameter "element" is null.');
        }

        if (!(element instanceof HTMLTextAreaElement)) {
            throw new Error('SimpleMDE: Parameter "element" must be a TextArea.');
        }

        return element;
    }

    private element: HTMLTextAreaElement;
    private options: IOptions;
    private codemirror: cm.EditorFromTextArea;
    private toolBar: HTMLDivElement;
    private rendered: boolean;

    private fullScreenActive = false;
    private sideBySideActive = false;

    constructor(element?: HTMLElement, options: IOptions = {}) {
        this.element = NewMDE.verifyAndReturnElement(element);
        this.rendered = !!this.element.getAttribute('rendered');
        this.options = options;
        this.codemirror = this.render();
        this.toolBar = this.createToolBar();
    }

    private markdown(text: string): string {

        console.log('Markdown!');

        // Initialize with default options
        let markedOptions: marked.MarkedOptions = {
            breaks: true,
        };

        if (this.options.renderingConfig) {
            if (this.options.renderingConfig.markedOptions !== undefined) {
                markedOptions = this.options.renderingConfig.markedOptions;
            }

            if (this.options.renderingConfig.singleLineBreaks !== undefined) {
                markedOptions.breaks = this.options.renderingConfig.singleLineBreaks;
            }

            if (this.options.renderingConfig.codeSyntaxHighlighting !== undefined) {
                markedOptions.highlight = ((code: string) => hljs.highlightAuto(code).value);
            }
        }

        marked.setOptions(markedOptions);

        console.log(marked(text));

        return marked(text);
    }

    private render(): cm.EditorFromTextArea {
        if (this.rendered) {
            throw new Error(`SimpleMDE: Element with ID "${this.element.id}" is already a SimpleMDE instance.`);
            // Already rendered.
            // return;
        }

        // var keyMaps = {};
        //
        // for (var key in options.shortcuts) {
        //     // null stands for "do not bind this command"
        //     if (options.shortcuts[key] !== null && bindings[key] !== null) {
        //         (function (key) {
        //             keyMaps[fixShortcut(options.shortcuts[key])] = function () {
        //                 bindings[key](self);
        //             };
        //         })(key);
        //     }
        // }
        //
        // keyMaps['Enter'] = 'newlineAndIndentContinueMarkdownList';
        // keyMaps['Tab'] = 'tabAndIndentMarkdownList';
        // keyMaps['Shift-Tab'] = 'shiftTabAndUnindentMarkdownList';
        // keyMaps['Esc'] = function (cm) {
        //     if (cm.getOption('fullScreen')) toggleFullScreen(self);
        // };

        const codemirror = cm.fromTextArea(this.element, {
            // lineWrapping: (options.lineWrapping === false) ? false : true,
            // allowDropFileTypes: ['text/plain'],
            // indentWithTabs: (options.indentWithTabs === false) ? false : true,
            lineNumbers: false,
            // tabSize: (options.tabSize != undefined) ? options.tabSize : 2,
            // indentUnit: (options.tabSize != undefined) ? options.tabSize : 2,
            mode: {
                gitHubSpice: false,
                name: 'gfm',
            },
            // autofocus: (options.autofocus === true) ? true : false,
            // extraKeys: keyMaps,
            placeholder: 'This is a thing!',
            // backdrop: null,
            theme: 'paper',
            // styleSelectedText: (options.styleSelectedText != undefined) ? options.styleSelectedText : !isMobile(),
        });
        codemirror.getScrollerElement().style.minHeight = '300px';

        this.createSideBySide(codemirror);

        this.element.setAttribute('rendered', 'true');

        return codemirror;
    }

    private createSideBySide(codemirror: cm.EditorFromTextArea) {
        const wrapper = codemirror.getWrapperElement();
        let preview = wrapper.nextElementSibling;

        if (!preview || !preview.classList.contains('editor-preview-side')) {
            preview = document.createElement('div');
            preview.classList.add('editor-preview-side');
            if (wrapper.parentNode) {
                wrapper.parentNode.insertBefore(preview, wrapper.nextSibling);
            } else {
                throw new Error('Wrapper has no parent node!');
            }
        }

        if (!preview) {
            throw new Error('Cannot find preview element!');
        }

        let cScroll = false;
        let pScroll = false;

        // Syncs scroll  editor -> preview
        cm.on(codemirror, 'scroll', (v: cm.EditorFromTextArea) => {
            preview = preview as HTMLDivElement;
            if (cScroll) {
                cScroll = false;
                return;
            }
            pScroll = true;
            const height = v.getScrollInfo().height - v.getScrollInfo().clientHeight;
            const ratio = parseFloat(v.getScrollInfo().top) / height;
            const move = (preview.scrollHeight - preview.clientHeight) * ratio;
            preview.scrollTop = move;
        });

        (preview as HTMLDivElement).onscroll = () => {
            preview = preview as HTMLDivElement;
            if (pScroll) {
                pScroll = false;
                return;
            }
            cScroll = true;
            const height = preview.scrollHeight - preview.clientHeight;
            const ratio = preview.scrollTop / height;
            const move = (this.codemirror.getScrollInfo().height - this.codemirror.getScrollInfo().clientHeight) * ratio;
            this.codemirror.scrollTo(0, move);
        };
        return preview;
    }

    // SimpleMDE.prototype.createSideBySide = function () {
    //     var cm = this.codemirror;
    //     var wrapper = cm.getWrapperElement();
    //     var preview = wrapper.nextSibling;
    //
    //     if (!preview || !/editor-preview-side/.test(preview.className)) {
    //         preview = document.createElement('div');
    //         preview.className = 'editor-preview-side';
    //         wrapper.parentNode.insertBefore(preview, wrapper.nextSibling);
    //     }
    //
    //     if (this.options.syncSideBySidePreviewScroll === false) return preview;
    //     // Syncs scroll  editor -> preview
    //     var cScroll = false;
    //     var pScroll = false;
    //     cm.on('scroll', function (v) {
    //         if (cScroll) {
    //             cScroll = false;
    //             return;
    //         }
    //         pScroll = true;
    //         var height = v.getScrollInfo().height - v.getScrollInfo().clientHeight;
    //         var ratio = parseFloat(v.getScrollInfo().top) / height;
    //         var move = (preview.scrollHeight - preview.clientHeight) * ratio;
    //         preview.scrollTop = move;
    //     });
    //
    //     // Syncs scroll  preview -> editor
    //     preview.onscroll = function () {
    //         if (pScroll) {
    //             pScroll = false;
    //             return;
    //         }
    //         cScroll = true;
    //         var height = preview.scrollHeight - preview.clientHeight;
    //         var ratio = parseFloat(preview.scrollTop) / height;
    //         var move = (cm.getScrollInfo().height - cm.getScrollInfo().clientHeight) * ratio;
    //         cm.scrollTo(0, move);
    //     };
    //     return preview;
    // };

    private static toggleSideBySide(editor: NewMDE) {
        console.log('s-by-s');
        const codeMirrorInstance = editor.codemirror;
        const wrapper = codeMirrorInstance.getWrapperElement();
        const preview = wrapper.nextElementSibling;
        if (!preview) {
            throw new Error('Could not find element to render preview to!');
        }
        preview.classList.toggle('editor-preview-active-side');
        editor.toggleToolBarButtonActive(editor.toolBar.getElementsByClassName('side-by-side')[0]);

        wrapper.classList.toggle('CodeMirror-sided');

        const func = () => preview.innerHTML = editor.markdown(codeMirrorInstance.getValue());
        cm.on(codeMirrorInstance, 'update', func);
        // preview.innerHTML = editor.

        if (!editor.fullScreenActive) {
            // Side-by-side can only be shown in fullscreen.
            NewMDE.toggleFullScreen(editor);
        }

        editor.sideBySideActive = !editor.sideBySideActive;
    }

    // function toggleSideBySide(editor) {
    //     var cm = editor.codemirror;
    //     var wrapper = cm.getWrapperElement();
    //     var preview = wrapper.nextSibling;
    //     var toolbarButton = editor.toolbarElements['side-by-side'];
    //     var useSideBySideListener = false;
    //     if (/editor-preview-active-side/.test(preview.className)) {
    //         preview.className = preview.className.replace(
    //             /\s*editor-preview-active-side\s*/g, ''
    //         );
    //         toolbarButton.className = toolbarButton.className.replace(/\s*active\s*/g, '');
    //         wrapper.className = wrapper.className.replace(/\s*CodeMirror-sided\s*/g, ' ');
    //     } else {
    //         // When the preview button is clicked for the first time,
    //         // give some time for the transition from editor.css to fire and the view to slide from right to left,
    //         // instead of just appearing.
    //         setTimeout(function () {
    //             if (!cm.getOption('fullScreen'))
    //                 toggleFullScreen(editor);
    //             preview.className += ' editor-preview-active-side';
    //         }, 1);
    //         toolbarButton.className += ' active';
    //         wrapper.className += ' CodeMirror-sided';
    //         useSideBySideListener = true;
    //     }
    //
    //     // Hide normal preview if active
    //     var previewNormal = wrapper.lastChild;
    //     if (/editor-preview-active/.test(previewNormal.className)) {
    //         previewNormal.className = previewNormal.className.replace(
    //             /\s*editor-preview-active\s*/g, ''
    //         );
    //         var toolbar = editor.toolbarElements.preview;
    //         var toolbar_div = wrapper.previousSibling;
    //         toolbar.className = toolbar.className.replace(/\s*active\s*/g, '');
    //         toolbar_div.className = toolbar_div.className.replace(/\s*disabled-for-preview*/g, '');
    //     }
    //
    //     var sideBySideRenderingFunction = function () {
    //         preview.innerHTML = editor.options.previewRender(editor.value(), preview);
    //     };
    //
    //     if (!cm.sideBySideRenderingFunction) {
    //         cm.sideBySideRenderingFunction = sideBySideRenderingFunction;
    //     }
    //
    //     if (useSideBySideListener) {
    //         preview.innerHTML = editor.options.previewRender(editor.value(), preview);
    //         cm.on('update', cm.sideBySideRenderingFunction);
    //     } else {
    //         cm.off('update', cm.sideBySideRenderingFunction);
    //     }
    //
    //     // Refresh to fix selection being off (#309)
    //     cm.refresh();
    // }

    public static toggleBold(_editor: NewMDE) {
        console.log('Bold!');
        // _toggleBlock(editor, 'bold', editor.options.blockStyles.bold);
    }

    private static toggleFullScreen(editor: NewMDE) {
        editor.toolBar.classList.toggle('fullscreen');
        editor.codemirror.getWrapperElement().classList.toggle('CodeMirror-fullscreen');

        editor.toggleToolBarButtonActive(editor.toolBar.getElementsByClassName('fullscreen')[0]);

        if (editor.fullScreenActive && editor.sideBySideActive) {
            NewMDE.toggleSideBySide(editor);
        }

        editor.fullScreenActive = !editor.fullScreenActive;
    }

    private toggleToolBarButtonActive(buttonElement: Element | undefined) {
        if (buttonElement) {
            buttonElement.classList.toggle('active');
        }
    }

    private togglePreview(_editor: NewMDE) {
        console.log('Preview!');
        console.log(this);
    }

    private undo(editor: NewMDE) {
        editor.codemirror.execCommand('undo');
    }

    private redo(editor: NewMDE) {
        editor.codemirror.execCommand('redo');
    }

    // IconsSet ?

    private createToolBar(): HTMLDivElement {
        const defaultToolBarLayout: IToolBarButtonOptions[][] = [
            [{
                action: NewMDE.toggleBold,
                icon: 'fa fa-bold',
                name: 'bold',
                title: 'Bold',
            }, {
                // action: toggleItalic,
                icon: 'fa fa-italic',
                name: 'italic',
                title: 'Italic',
            }, {
                // action: toggleStrikethrough,
                icon: 'fa fa-strikethrough',
                name: 'strikethrough',
                title: 'Strikethrough',
            }, {
                // action: toggleHeadingSmaller,
                icon: 'fa fa-header fa-heading',
                name: 'heading',
                title: 'Heading',
            }], [{
                // action: toggleCodeBlock,
                icon: 'fa fa-code',
                name: 'code',
                title: 'Code',
            }, {
                // action: toggleBlockquote,
                icon: 'fa fa-quote-left',
                name: 'quote',
                title: 'Quote',
            }, {
                // action: toggleUnorderedList,
                icon: 'fa fa-list-ul',
                name: 'unordered-list',
                title: 'Generic List',
            }, {
                // action: toggleOrderedList,
                icon: 'fa fa-list-ol',
                name: 'ordered-list',
                title: 'Numbered List',
            }, {
                // action: cleanBlock,
                icon: 'fa fa-eraser fa-clean-block',
                name: 'clean-block',
                title: 'Clean block',
            }], [{
                // action: drawLink,
                icon: 'fa fa-link',
                name: 'link',
                title: 'Create Link',
            }, {
                // action: drawImage,
                icon: 'fa fa-image',
                name: 'image',
                title: 'Insert Image',
            }, {
                // action: drawHorizontalRule,
                icon: 'fa fa-minus',
                name: 'horizontal-rule',
                title: 'Insert Horizontal Line',
            }], [{
                action: this.togglePreview,
                icon: 'fa fa-eye',
                name: 'preview',
                // noDisable: true,
                // noMobile: true,
                title: 'Toggle Preview',
            }, {
                action: NewMDE.toggleSideBySide,
                icon: 'fa fa-columns',
                name: 'side-by-side',
                // noDisable: true,
                // noMobile: true,
                title: 'Toggle Side by Side',
            }, {
                action: NewMDE.toggleFullScreen,
                icon: 'fa fa-arrows-alt',
                name: 'fullscreen',
                // noDisable: true,
                // noMobile: true,
                title: 'Toggle Fullscreen',
            }], [{
                action: 'https://simplemde.com/markdown-guide',
                icon: 'fa fa-question-circle',
                name: 'guide',
                // noDisable: true,
                title: 'Markdown Guide',
            }], [{
                action: this.undo,
                icon: 'fa fa-undo',
                name: 'undo',
                // noDisable: true,
                title: 'Undo',
            }, {
                action: this.redo,
                icon: 'fa fa-repeat',
                name: 'redo',
                // noDisable: true,
                title: 'Redo',
            }],
        ];

        const toolBar = document.createElement('div');
        toolBar.className = 'editor-toolbar';

        for (const toolBarButtonSection of defaultToolBarLayout) {
            const toolBarSection: HTMLElement[] = [];

            for (const toolBarButtonOptions of toolBarButtonSection) {
                toolBarSection.push(this.createToolBarButton(toolBarButtonOptions));
            }

            // Create a separator if this is not the last toolbar section.
            if (defaultToolBarLayout.indexOf(toolBarButtonSection) !== (defaultToolBarLayout.length - 1)) {
                toolBarSection.push(this.createToolBarSeparator());
            }

            for (const toolBarEntry of toolBarSection) {
                toolBar.appendChild(toolBarEntry);
            }
        }

        // Add the toolbar to the editor.
        const cmWrapper = this.codemirror.getWrapperElement();
        if (cmWrapper.parentNode) {
            cmWrapper.parentNode.insertBefore(toolBar, cmWrapper);
        }

        return toolBar;
    }

    private createToolBarButton(toolBarButtonOptions: IToolBarButtonOptions): HTMLButtonElement {
        const buttonElement: HTMLButtonElement = document.createElement('button');
        buttonElement.tabIndex = -1;
        buttonElement.classList.add(toolBarButtonOptions.name);

        // Set the button tooltip.
        buttonElement.title = toolBarButtonOptions.title;

        // Set the button onclick action.
        if (typeof toolBarButtonOptions.action === 'function') {
            buttonElement.onclick = () => toolBarButtonOptions.action(this);
            // buttonElement.addEventListener()
        } else if (typeof toolBarButtonOptions.action === 'string') {
            buttonElement.onclick = () => window.open(toolBarButtonOptions.action);
        }

        // Set the button icon.
        const buttonIcon = document.createElement('i');
        buttonIcon.className = toolBarButtonOptions.icon;

        buttonElement.appendChild(buttonIcon);
        return buttonElement;
    }

    private createToolBarSeparator() {
        const separatorElement = document.createElement('span');
        separatorElement.className = 'separator';
        separatorElement.innerHTML = '|';
        return separatorElement;
    }
};
