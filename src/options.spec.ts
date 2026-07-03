import { EditorView } from "@codemirror/view";
import { describe, expect, it } from "vite-plus/test";

import {
    DEFAULT_BLOCK_STYLES,
    resolveOptions,
    type InputOptions,
    type Options,
} from "./options.js";

const makeElement = (): HTMLTextAreaElement => document.createElement("textarea");

describe("resolveOptions", () => {
    it("applies defaults when only element is supplied", () => {
        const element = makeElement();

        const resolved = resolveOptions({ element });

        expect(resolved.element).toBe(element);
        expect(resolved.toolbar).toBe(true);
        expect(resolved.statusbar).toBe(true);
        expect(resolved.trimInitialValue).toBe(true);
        expect(resolved.blockStyles).toEqual(DEFAULT_BLOCK_STYLES);
    });

    it("defaults insertTexts.link and insertTexts.image to symmetric templates", () => {
        const element = makeElement();

        const resolved = resolveOptions({ element });

        expect(resolved.insertTexts.link).toEqual(["[", "](https://)"]);
        expect(resolved.insertTexts.image).toEqual(["![", "](https://)"]);
    });

    it("preserves a consumer-supplied insertTexts.image template", () => {
        const element = makeElement();

        const resolved = resolveOptions({
            element,
            insertTexts: { image: ["![](", ")"] },
        });

        expect(resolved.insertTexts.image).toEqual(["![](", ")"]);
    });

    it("preserves an explicit trimInitialValue=false", () => {
        const element = makeElement();

        const resolved = resolveOptions({ element, trimInitialValue: false });

        expect(resolved.trimInitialValue).toBe(false);
    });

    it("defaults syncSideBySidePreviewScroll to true and sideBySideFullscreen to false", () => {
        const element = makeElement();

        const resolved = resolveOptions({ element });

        expect(resolved.syncSideBySidePreviewScroll).toBe(true);
        expect(resolved.sideBySideFullscreen).toBe(false);
    });

    it("preserves explicit side-by-side option overrides", () => {
        const element = makeElement();

        const resolved = resolveOptions({
            element,
            syncSideBySidePreviewScroll: false,
            sideBySideFullscreen: true,
        });

        expect(resolved.syncSideBySidePreviewScroll).toBe(false);
        expect(resolved.sideBySideFullscreen).toBe(true);
    });

    it("preserves consumer-supplied toolbar and statusbar booleans", () => {
        const element = makeElement();

        const resolved = resolveOptions({ element, toolbar: false, statusbar: false });

        expect(resolved.toolbar).toBe(false);
        expect(resolved.statusbar).toBe(false);
    });

    it("preserves a consumer-supplied toolbar array", () => {
        const element = makeElement();
        const toolbar: InputOptions["toolbar"] = ["bold", "|", "italic"];

        const resolved = resolveOptions({ element, toolbar });

        expect(resolved.toolbar).toEqual(["bold", "|", "italic"]);
    });

    it("merges blockStyles field-wise with defaults", () => {
        const element = makeElement();

        const resolved = resolveOptions({
            element,
            blockStyles: { bold: "__", italic: "_" },
        });

        expect(resolved.blockStyles).toEqual({
            ...DEFAULT_BLOCK_STYLES,
            bold: "__",
            italic: "_",
        });
    });

    it("passes through optional fields unchanged", () => {
        const element = makeElement();
        const previewRender = (markdown: string) => `<p>${markdown}</p>`;
        const renderingConfig = {
            markedOptions: { gfm: true },
            sanitizerFunction: (html: string) => html,
        };
        const codemirrorExtensions = EditorView.editable.of(false);

        const resolved = resolveOptions({
            element,
            unorderedListStyle: "-",
            indentWithTabs: true,
            tabSize: 4,
            lineWrapping: false,
            lineNumbers: true,
            minHeight: "100px",
            maxHeight: "500px",
            placeholder: "Type here",
            forceSync: true,
            promptURLs: true,
            promptTexts: { image: "URL?", link: "Link?" },
            codemirrorExtensions,
            previewRender,
            renderingConfig,
        });

        expect(resolved.unorderedListStyle).toBe("-");
        expect(resolved.indentWithTabs).toBe(true);
        expect(resolved.tabSize).toBe(4);
        expect(resolved.lineWrapping).toBe(false);
        expect(resolved.lineNumbers).toBe(true);
        expect(resolved.minHeight).toBe("100px");
        expect(resolved.maxHeight).toBe("500px");
        expect(resolved.placeholder).toBe("Type here");
        expect(resolved.forceSync).toBe(true);
        expect(resolved.promptURLs).toBe(true);
        expect(resolved.promptTexts).toEqual({ image: "URL?", link: "Link?" });
        expect(resolved.codemirrorExtensions).toBe(codemirrorExtensions);
        expect(resolved.previewRender).toBe(previewRender);
        expect(resolved.renderingConfig).toBe(renderingConfig);
    });

    it("leaves unspecified optional fields undefined", () => {
        const element = makeElement();

        const resolved: Options = resolveOptions({ element });

        expect(resolved.tabSize).toBeUndefined();
        expect(resolved.lineWrapping).toBeUndefined();
        expect(resolved.placeholder).toBeUndefined();
        expect(resolved.codemirrorExtensions).toBeUndefined();
        expect(resolved.previewRender).toBeUndefined();
        expect(resolved.renderingConfig).toBeUndefined();
    });
});
