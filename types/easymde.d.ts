// This file is based on https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/simplemde/index.d.ts,
// which is written by Scalesoft <https://github.com/Scalesoft> and licensed under the MIT license:
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/// <reference types="codemirror"/>

import { marked } from 'marked';

interface ArrayOneOrMore<T> extends Array<T> {
    0: T;
}

type ToolbarButton =
    'bold'
    | 'italic'
    | 'quote'
    | 'unordered-list'
    | 'ordered-list'
    | 'link'
    | 'image'
    | 'strikethrough'
    | 'code'
    | 'table'
    | 'redo'
    | 'heading'
    | 'undo'
    | 'heading-bigger'
    | 'heading-smaller'
    | 'heading-1'
    | 'heading-2'
    | 'heading-3'
    | 'clean-block'
    | 'horizontal-rule'
    | 'preview'
    | 'side-by-side'
    | 'fullscreen'
    | 'guide';

declare namespace EasyMDE {

    interface TimeFormatOptions {
        locale?: string | string[];
        format?: Intl.DateTimeFormatOptions;
    }

    interface AutoSaveOptions {
        enabled?: boolean;
        delay?: number;
        submit_delay?: number;
        uniqueId: string;
        timeFormat?: TimeFormatOptions;
        text?: string;
    }

    interface BlockStyleOptions {
        bold?: string;
        code?: string;
        italic?: string;
    }

    interface CustomAttributes {
        [key: string]: string;
    }

    interface InsertTextOptions {
        horizontalRule?: ReadonlyArray<string>;
        image?: ReadonlyArray<string>;
        link?: ReadonlyArray<string>;
        table?: ReadonlyArray<string>;
    }

    interface ParsingOptions {
        allowAtxHeaderWithoutSpace?: boolean;
        strikethrough?: boolean;
        underscoresBreakWords?: boolean;
    }

    interface PromptTexts {
        image?: string;
        link?: string;
    }

    interface RenderingOptions {
        codeSyntaxHighlighting?: boolean;
        hljs?: any;
        markedOptions?: marked.MarkedOptions;
        sanitizerFunction?: (html: string) => string;
        singleLineBreaks?: boolean;
    }

    interface Shortcuts {
        [action: string]: string | undefined | null;

        toggleBlockquote?: string | null;
        toggleBold?: string | null;
        cleanBlock?: string | null;
        toggleHeadingSmaller?: string | null;
        toggleItalic?: string | null;
        drawLink?: string | null;
        toggleUnorderedList?: string | null;
        togglePreview?: string | null;
        toggleCodeBlock?: string | null;
        drawImage?: string | null;
        toggleOrderedList?: string | null;
        toggleHeadingBigger?: string | null;
        toggleSideBySide?: string | null;
        toggleFullScreen?: string | null;
    }

    interface StatusBarItem {
        className: string;
        defaultValue: (element: HTMLElement) => void;
        onUpdate: (element: HTMLElement) => void;
    }

    interface ToolbarDropdownIcon {
        name: string;
        children: ArrayOneOrMore<ToolbarIcon | ToolbarButton>;
        className: string;
        title: string;
        noDisable?: boolean;
        noMobile?: boolean;
    }

    interface ToolbarIcon {
        name: string;
        action: string | ((editor: EasyMDE) => void);
        className: string;
        title: string;
        noDisable?: boolean;
        noMobile?: boolean;
        icon?: string;
        attributes?: CustomAttributes;
    }

    interface ImageTextsOptions {
        sbInit?: string;
        sbOnDragEnter?: string;
        sbOnDrop?: string;
        sbProgress?: string;
        sbOnUploaded?: string;
        sizeUnits?: string;
    }

    interface ImageErrorTextsOptions {
        noFileGiven?: string;
        typeNotAllowed?: string;
        fileTooLarge?: string;
        importError?: string;
    }

    interface OverlayModeOptions {
        mode: CodeMirror.Mode<any>;
        combine?: boolean;
    }

    interface SpellCheckerOptions {
        codeMirrorInstance: CodeMirror.Editor;
    }

    interface Options {
        autoDownloadFontAwesome?: boolean;
        autofocus?: boolean;
        autosave?: AutoSaveOptions;
        autoRefresh?: boolean | { delay: number; };
        blockStyles?: BlockStyleOptions;
        element?: HTMLElement;
        forceSync?: boolean;
        hideIcons?: ReadonlyArray<ToolbarButton>;
        indentWithTabs?: boolean;
        initialValue?: string;
        insertTexts?: InsertTextOptions;
        lineNumbers?: boolean;
        lineWrapping?: boolean;
        minHeight?: string;
        maxHeight?: string;
        parsingConfig?: ParsingOptions;
        placeholder?: string;
        previewClass?: string | ReadonlyArray<string>;
        previewImagesInEditor?: boolean;
        imagesPreviewHandler?: (src: string) => string,
        previewRender?: (markdownPlaintext: string, previewElement: HTMLElement) => string | null;
        promptURLs?: boolean;
        renderingConfig?: RenderingOptions;
        shortcuts?: Shortcuts;
        showIcons?: ReadonlyArray<ToolbarButton>;
        spellChecker?: boolean | ((options: SpellCheckerOptions) => void);
        inputStyle?: 'textarea' | 'contenteditable';
        nativeSpellcheck?: boolean;
        sideBySideFullscreen?: boolean;
        status?: boolean | ReadonlyArray<string | StatusBarItem>;
        styleSelectedText?: boolean;
        tabSize?: number;
        toolbar?: boolean | ReadonlyArray<'|' | ToolbarButton | ToolbarIcon | ToolbarDropdownIcon>;
        toolbarTips?: boolean;
        toolbarButtonClassPrefix?: string;
        onToggleFullScreen?: (goingIntoFullScreen: boolean) => void;
        theme?: string;
        scrollbarStyle?: string;
        unorderedListStyle?: '*' | '-' | '+';

        uploadImage?: boolean;
        imageMaxSize?: number;
        imageAccept?: string;
        imageUploadFunction?: (file: File, onSuccess: (url: string) => void, onError: (error: string) => void) => void;
        imageUploadEndpoint?: string;
        imagePathAbsolute?: boolean;
        imageCSRFToken?: string;
        imageCSRFName?: string;
        imageCSRFHeader?: boolean;
        imageTexts?: ImageTextsOptions;
        errorMessages?: ImageErrorTextsOptions;
        errorCallback?: (errorMessage: string) => void;

        promptTexts?: PromptTexts;
        syncSideBySidePreviewScroll?: boolean;

        overlayMode?: OverlayModeOptions;

        direction?: 'ltr' | 'rtl';
    }
}

declare class EasyMDE {
    constructor(options?: EasyMDE.Options);

    value(): string;
    value(val: string): void;

    codemirror: CodeMirror.Editor;

    cleanup(): void;

    toTextArea(): void;

    isPreviewActive(): boolean;

    isSideBySideActive(): boolean;

    isFullscreenActive(): boolean;

    clearAutosavedValue(): void;

    static toggleBold: (editor: EasyMDE) => void;
    static toggleItalic: (editor: EasyMDE) => void;
    static toggleStrikethrough: (editor: EasyMDE) => void;
    static toggleHeadingSmaller: (editor: EasyMDE) => void;
    static toggleHeadingBigger: (editor: EasyMDE) => void;
    static toggleHeading1: (editor: EasyMDE) => void;
    static toggleHeading2: (editor: EasyMDE) => void;
    static toggleHeading3: (editor: EasyMDE) => void;
    static toggleHeading4: (editor: EasyMDE) => void;
    static toggleHeading5: (editor: EasyMDE) => void;
    static toggleHeading6: (editor: EasyMDE) => void;
    static toggleCodeBlock: (editor: EasyMDE) => void;
    static toggleBlockquote: (editor: EasyMDE) => void;
    static toggleUnorderedList: (editor: EasyMDE) => void;
    static toggleOrderedList: (editor: EasyMDE) => void;
    static cleanBlock: (editor: EasyMDE) => void;
    static drawLink: (editor: EasyMDE) => void;
    static drawImage: (editor: EasyMDE) => void;
    static drawUploadedImage: (editor: EasyMDE) => void;
    static drawTable: (editor: EasyMDE) => void;
    static drawHorizontalRule: (editor: EasyMDE) => void;
    static togglePreview: (editor: EasyMDE) => void;
    static toggleSideBySide: (editor: EasyMDE) => void;
    static toggleFullScreen: (editor: EasyMDE) => void;
    static undo: (editor: EasyMDE) => void;
    static redo: (editor: EasyMDE) => void;
}

export as namespace EasyMDE;
export = EasyMDE;
