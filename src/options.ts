import type { Extension } from "@codemirror/state";
import type { MarkedOptions } from "marked";

import type { IToolbarButtonOptions } from "./toolbar/default-toolbar.js";

export type ToolbarButton =
    | "bold"
    | "italic"
    | "quote"
    | "unordered-list"
    | "ordered-list"
    | "task-list"
    | "link"
    | "image"
    | "strikethrough"
    | "code"
    | "code-block"
    | "table"
    | "redo"
    | "cycle-heading"
    | "undo"
    | "heading-bigger"
    | "heading-smaller"
    | "heading-1"
    | "heading-2"
    | "heading-3"
    | "heading-4"
    | "heading-5"
    | "heading-6"
    | "clean-block"
    | "horizontal-rule"
    | "preview"
    | "side-by-side"
    | "fullscreen"
    | "guide";

interface BlockStyleOptions {
    bold?: string;
    code?: string;
    strikethrough?: string;
    italic?: string;
}

interface PromptTexts {
    image?: string;
    link?: string;
}

interface InsertTexts {
    horizontalRule?: string;
    table?: string;
    link?: [prefix: string, suffix: string];
    image?: [prefix: string, suffix: string];
}

interface RenderingOptions {
    markedOptions?: MarkedOptions;
    sanitizerFunction?: (html: string) => string;
}

export type ToolbarConfig = boolean | readonly ("|" | ToolbarButton | IToolbarButtonOptions)[];

export const DEFAULT_BLOCK_STYLES: Required<BlockStyleOptions> = {
    bold: "**",
    italic: "*",
    strikethrough: "~~",
    code: "`",
};

export interface InputOptions {
    element: HTMLTextAreaElement;
    toolbar?: ToolbarConfig;
    hideIcons?: readonly ToolbarButton[];
    showIcons?: readonly ToolbarButton[];
    statusbar?: boolean;
    blockStyles?: BlockStyleOptions;
    unorderedListStyle?: "*" | "-" | "+";
    orderedListDelimiter?: "." | ")";
    indentWithTabs?: boolean;
    tabSize?: number;
    lineWrapping?: boolean;
    lineNumbers?: boolean;
    minHeight?: string;
    maxHeight?: string;
    placeholder?: string;
    forceSync?: boolean;
    promptURLs?: boolean;
    promptTexts?: PromptTexts;
    insertTexts?: InsertTexts;
    codemirrorExtensions?: Extension;
    previewRender?: (markdownPlaintext: string, previewElement: HTMLElement) => string;
    renderingConfig?: RenderingOptions;
    toolbarGuideUrl?: string;
    trimInitialValue?: boolean;
    syncSideBySidePreviewScroll?: boolean;
    sideBySideFullscreen?: boolean;
    onToggleFullScreen?: (entering: boolean) => void;
}

export type Options = Omit<
    InputOptions,
    | "toolbar"
    | "statusbar"
    | "blockStyles"
    | "trimInitialValue"
    | "unorderedListStyle"
    | "orderedListDelimiter"
    | "insertTexts"
    | "promptURLs"
    | "promptTexts"
    | "toolbarGuideUrl"
    | "syncSideBySidePreviewScroll"
    | "sideBySideFullscreen"
> & {
    toolbar: ToolbarConfig;
    statusbar: boolean;
    blockStyles: Required<BlockStyleOptions>;
    trimInitialValue: boolean;
    unorderedListStyle: "*" | "-" | "+";
    orderedListDelimiter: "." | ")";
    insertTexts: Required<InsertTexts>;
    promptURLs: boolean;
    promptTexts: Required<PromptTexts>;
    toolbarGuideUrl: string;
    syncSideBySidePreviewScroll: boolean;
    sideBySideFullscreen: boolean;
};

export const resolveOptions = (input: InputOptions): Options => ({
    ...input,
    toolbar: input.toolbar ?? true,
    statusbar: input.statusbar ?? true,
    trimInitialValue: input.trimInitialValue ?? true,
    unorderedListStyle: input.unorderedListStyle ?? "*",
    orderedListDelimiter: input.orderedListDelimiter ?? ".",
    toolbarGuideUrl: input.toolbarGuideUrl ?? "https://www.markdownguide.org/cheat-sheet/",
    promptURLs: input.promptURLs ?? false,
    syncSideBySidePreviewScroll: input.syncSideBySidePreviewScroll ?? true,
    sideBySideFullscreen: input.sideBySideFullscreen ?? false,
    promptTexts: {
        image: input.promptTexts?.image ?? "URL of the image:",
        link: input.promptTexts?.link ?? "URL for the link:",
    },
    blockStyles: {
        bold: input.blockStyles?.bold ?? DEFAULT_BLOCK_STYLES.bold,
        italic: input.blockStyles?.italic ?? DEFAULT_BLOCK_STYLES.italic,
        strikethrough: input.blockStyles?.strikethrough ?? DEFAULT_BLOCK_STYLES.strikethrough,
        code: input.blockStyles?.code ?? DEFAULT_BLOCK_STYLES.code,
    },
    insertTexts: {
        horizontalRule: input.insertTexts?.horizontalRule ?? "\n\n---\n\n",
        table:
            input.insertTexts?.table ??
            "\n\n| Column 1 | Column 2 | Column 3 |\n" +
                "| -------- | -------- | -------- |\n" +
                "| Text     | Text     | Text     |\n\n",
        link: input.insertTexts?.link ?? ["[", "](https://)"],
        image: input.insertTexts?.image ?? ["![", "](https://)"],
    },
});
