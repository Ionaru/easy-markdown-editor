import { Marked } from "marked";
import { describe, expect, it, vi } from "vitest";

import type { Options } from "../options.js";
import { renderMarkdownToHtmlForPreview } from "./render-markdown-to-html-for-preview.js";

const baseOptions = (overrides: Partial<Options> = {}): Options =>
    ({
        element: document.createElement("textarea"),
        toolbar: false,
        statusbar: false,
        blockStyles: { bold: "**", italic: "*", strikethrough: "~~", code: "`" },
        ...overrides,
    }) as Options;

describe("renderMarkdownToHtmlForPreview", () => {
    it("renders Markdown to HTML via the provided Marked instance", () => {
        const marked = new Marked();
        const html = renderMarkdownToHtmlForPreview(
            "**bold**",
            marked,
            baseOptions(),
            document.createElement("div"),
        );

        expect(html).toContain("<strong>bold</strong>");
    });

    it("strips XSS payloads through DOMPurify by default", () => {
        const marked = new Marked();
        const html = renderMarkdownToHtmlForPreview(
            "<script>alert(1)</script>safe",
            marked,
            baseOptions(),
            document.createElement("div"),
        );

        expect(html).not.toContain("<script");
        expect(html).toContain("safe");
    });

    it("calls previewRender with markdown and the preview element", () => {
        const previewElement = document.createElement("div");
        const previewRender = vi.fn(() => "<p>custom</p>");

        const html = renderMarkdownToHtmlForPreview(
            "# ignored",
            new Marked(),
            baseOptions({ previewRender }),
            previewElement,
        );

        expect(previewRender).toHaveBeenCalledWith("# ignored", previewElement);
        expect(html).toBe("<p>custom</p>");
    });

    it("runs the sanitizer over previewRender output", () => {
        const previewRender = () => "<p>ok</p><script>bad</script>";

        const html = renderMarkdownToHtmlForPreview(
            "ignored",
            new Marked(),
            baseOptions({ previewRender }),
            document.createElement("div"),
        );

        expect(html).toContain("<p>ok</p>");
        expect(html).not.toContain("<script");
    });

    it("uses renderingConfig.sanitizerFunction when provided", () => {
        const sanitizerFunction = vi.fn((html: string): string => `SANITIZED:${html}`);

        const html = renderMarkdownToHtmlForPreview(
            "**bold**",
            new Marked(),
            baseOptions({ renderingConfig: { sanitizerFunction } }),
            document.createElement("div"),
        );

        expect(sanitizerFunction).toHaveBeenCalledTimes(1);
        expect(html).toContain("SANITIZED:");
        expect(html).toContain("<strong>bold</strong>");
    });
});
