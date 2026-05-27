import type { Extension } from "@codemirror/state";
import type { MarkedOptions } from "marked";

import type { EasyMDE } from "./easymde.js";

type ToolbarButton =
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
    | "heading"
    | "undo"
    | "heading-bigger"
    | "heading-smaller"
    | "heading-1"
    | "heading-2"
    | "heading-3"
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

interface RenderingOptions {
    markedOptions?: MarkedOptions;
    sanitizerFunction?: (html: string) => string;
}

interface ToolbarDropdownIcon {
    name: string;
    children: [ToolbarIcon | ToolbarButton, ...(ToolbarIcon | ToolbarButton)[]];
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
    attributes?: Record<string, string>;
}

type ToolbarConfig = boolean | readonly ("|" | ToolbarButton | ToolbarIcon | ToolbarDropdownIcon)[];

export const DEFAULT_BLOCK_STYLES: Required<BlockStyleOptions> = {
    bold: "**",
    italic: "*",
    strikethrough: "~~",
    code: "`",
};

export interface InputOptions {
    element: HTMLTextAreaElement;
    toolbar?: ToolbarConfig;
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
    codemirrorExtensions?: Extension;
    previewRender?: (markdownPlaintext: string, previewElement: HTMLElement) => string;
    renderingConfig?: RenderingOptions;
    trimInitialValue?: boolean;
}

export type Options = Omit<
    InputOptions,
    | "toolbar"
    | "statusbar"
    | "blockStyles"
    | "trimInitialValue"
    | "unorderedListStyle"
    | "orderedListDelimiter"
> & {
    toolbar: ToolbarConfig;
    statusbar: boolean;
    blockStyles: Required<BlockStyleOptions>;
    trimInitialValue: boolean;
    unorderedListStyle: "*" | "-" | "+";
    orderedListDelimiter: "." | ")";
};

export const resolveOptions = (input: InputOptions): Options => ({
    ...input,
    toolbar: input.toolbar ?? true,
    statusbar: input.statusbar ?? true,
    trimInitialValue: input.trimInitialValue ?? true,
    unorderedListStyle: input.unorderedListStyle ?? "*",
    orderedListDelimiter: input.orderedListDelimiter ?? ".",
    blockStyles: {
        bold: input.blockStyles?.bold ?? DEFAULT_BLOCK_STYLES.bold,
        italic: input.blockStyles?.italic ?? DEFAULT_BLOCK_STYLES.italic,
        strikethrough: input.blockStyles?.strikethrough ?? DEFAULT_BLOCK_STYLES.strikethrough,
        code: input.blockStyles?.code ?? DEFAULT_BLOCK_STYLES.code,
    },
});
