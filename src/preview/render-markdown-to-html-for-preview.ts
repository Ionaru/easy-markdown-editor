import DOMPurify from "dompurify";
import type { Marked } from "marked";

import type { Options } from "../options.js";

export const renderMarkdownToHtmlForPreview = (
    markdown: string,
    marked: Marked,
    options: Options,
    previewElement: HTMLElement,
): string => {
    const html = options.previewRender
        ? options.previewRender(markdown, previewElement)
        : marked.parse(markdown, { async: false });

    const sanitize =
        options.renderingConfig?.sanitizerFunction ??
        ((dirty: string) => DOMPurify.sanitize(dirty));
    return sanitize(html);
};
