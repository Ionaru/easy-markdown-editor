import { afterEach, describe, expect, it } from "vite-plus/test";

import { createEditor } from "../test-utils.js";
import { Preview } from "./preview.js";

describe("Preview", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("creates an element with the easymde-preview class", () => {
        const editor = createEditor();
        const preview = new Preview(editor);

        expect(preview.element).toBeInstanceOf(HTMLDivElement);
        expect(preview.element.classList.contains("easymde-preview")).toBe(true);
    });

    it("mounts the element into the editor container and unmounts on teardown", () => {
        const editor = createEditor();
        const preview = new Preview(editor);

        preview.mount();
        expect(editor.container.contains(preview.element)).toBe(true);

        preview.unmount();
        expect(editor.container.contains(preview.element)).toBe(false);
    });

    it("renders Markdown into sanitized HTML on render()", () => {
        const editor = createEditor();
        const preview = new Preview(editor);

        preview.render("# Hello\n\n**world**");

        expect(preview.element.innerHTML).toContain("<h1>Hello</h1>");
        expect(preview.element.innerHTML).toContain("<strong>world</strong>");
    });

    it("strips XSS payloads from rendered output", () => {
        const editor = createEditor();
        const preview = new Preview(editor);

        preview.render("<script>alert(1)</script>safe");

        expect(preview.element.innerHTML).not.toContain("<script");
        expect(preview.element.innerHTML).toContain("safe");
    });

    it("replaces previous content on re-render", () => {
        const editor = createEditor();
        const preview = new Preview(editor);

        preview.render("# First");
        preview.render("# Second");

        expect(preview.element.innerHTML).not.toContain("First");
        expect(preview.element.innerHTML).toContain("<h1>Second</h1>");
    });

    it("honors renderingConfig.markedOptions", () => {
        const editor = createEditor({
            renderingConfig: { markedOptions: { breaks: true } },
        });
        const preview = new Preview(editor);

        preview.render("line1\nline2");

        expect(preview.element.innerHTML).toContain("<br>");
    });

    it("exposes the preview as a labelled region for assistive tech", () => {
        const editor = createEditor();
        const preview = new Preview(editor);

        expect(preview.element.getAttribute("role")).toBe("region");
        expect(preview.element.getAttribute("aria-label")).toBe("Preview");
    });

    it("carries tabindex=-1 so it is focusable by script but skipped by Tab", () => {
        const editor = createEditor();
        const preview = new Preview(editor);

        // A plain div returns null here; "-1" proves the attribute was set explicitly.
        // The actual focus move is exercised through togglePreview() in easymde.spec.ts,
        // where the pane is made visible first (it is display:none until preview-active).
        expect(preview.element.getAttribute("tabindex")).toBe("-1");
    });
});
