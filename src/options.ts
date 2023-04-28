import { marked } from 'marked';

import { EasyMDE } from './easymde';

interface ArrayOneOrMore<T> extends Array<T> {
    0: T;
}

type ToolbarButton =
    | 'bold'
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
    strikethrough?: string;
    italic?: string;
}

interface CustomAttributes {
    [key: string]: string;
}

interface InsertTextOptions {
    horizontalRule?: readonly string[];
    image?: readonly string[];
    link?: readonly string[];
    table?: readonly string[];
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
    // mode: CodeMirror.Mode<any>;
    combine?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface SpellCheckerOptions {
    // codeMirrorInstance: CodeMirror.Editor;
}

export interface InputOptions {
    autoDownloadFontAwesome?: boolean;
    autofocus?: boolean;
    autosave?: AutoSaveOptions;
    autoRefresh?: boolean | { delay: number };
    blockStyles?: BlockStyleOptions;
    element: HTMLTextAreaElement;
    forceSync?: boolean;
    hideIcons?: readonly string[];
    indentWithTabs?: boolean;
    initialValue?: string;
    insertTexts?: InsertTextOptions;
    lineNumbers?: boolean;
    lineWrapping?: boolean;
    minHeight?: string;
    maxHeight?: string;
    parsingConfig?: ParsingOptions;
    placeholder?: string;
    previewClass?: string | readonly string[];
    previewImagesInEditor?: boolean;
    previewRender?: (
        markdownPlaintext: string,
        previewElement: HTMLElement,
    ) => string;
    promptURLs?: boolean;
    renderingConfig?: RenderingOptions;
    shortcuts?: Shortcuts;
    showIcons?: readonly ToolbarButton[];
    spellChecker?: boolean | ((options: SpellCheckerOptions) => void);
    inputStyle?: 'textarea' | 'contenteditable';
    nativeSpellcheck?: boolean;
    sideBySideFullscreen?: boolean;
    status?: boolean | ReadonlyArray<string | StatusBarItem>;
    styleSelectedText?: boolean;
    tabSize?: number;
    toolbar?:
        | boolean
        | ReadonlyArray<
              '|' | ToolbarButton | ToolbarIcon | ToolbarDropdownIcon
          >;
    toolbarTips?: boolean;
    onToggleFullScreen?: (goingIntoFullScreen: boolean) => void;
    theme?: string;
    scrollbarStyle?: string;
    unorderedListStyle?: '*' | '-' | '+';

    uploadImage?: boolean;
    imageMaxSize?: number;
    imageAccept?: string;
    imageUploadFunction?: (
        file: File,
        onSuccess: (url: string) => void,
        onError: (error: string) => void,
    ) => void;
    imageUploadEndpoint?: string;
    imagePathAbsolute?: boolean;
    imageCSRFToken?: string;
    imageTexts?: ImageTextsOptions;
    errorMessages?: ImageErrorTextsOptions;
    errorCallback?: (errorMessage: string) => void;

    promptTexts?: PromptTexts;
    syncSideBySidePreviewScroll?: boolean;

    overlayMode?: OverlayModeOptions;

    direction?: 'ltr' | 'rtl';
}

export interface Options {
    statusbar?: boolean;
    toolbar?:
        | boolean
        | ReadonlyArray<
              '|' | ToolbarButton | ToolbarIcon | ToolbarDropdownIcon
          >;
    blockStyles: {
        bold: string;
        code: string;
        strikethrough: string;
        italic: string;
    };
}
