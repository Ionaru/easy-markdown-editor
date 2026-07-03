import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { createEditor } from "../../test-utils.js";
import { drawLink } from "./draw-link.js";

describe("drawLink", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        document.body.innerHTML = "";
    });

    it("prepends the template's https:// when the prompted URL omits a scheme", () => {
        expect.assertions(2);
        const promptSpy = vi.spyOn(window, "prompt").mockReturnValue("example.com");
        const editor = createEditor({ promptURLs: true });

        drawLink(editor);

        expect(promptSpy).toHaveBeenCalledWith("URL for the link:");
        expect(editor.value).toBe("[](https://example.com)");
    });

    it("keeps a scheme the user typed instead of stacking https:// on top", () => {
        expect.assertions(1);
        vi.spyOn(window, "prompt").mockReturnValue("mailto:hi@example.com");
        const editor = createEditor({ promptURLs: true });

        drawLink(editor);

        expect(editor.value).toBe("[](mailto:hi@example.com)");
    });

    it("inserts nothing when the prompt is cancelled", () => {
        expect.assertions(1);
        vi.spyOn(window, "prompt").mockReturnValue(null);
        const editor = createEditor({ promptURLs: true });

        drawLink(editor);

        expect(editor.value).toBe("");
    });

    it("inserts the bare template without prompting when promptURLs is false", () => {
        expect.assertions(3);
        const promptSpy = vi.spyOn(window, "prompt");
        const editor = createEditor({ promptURLs: false });

        drawLink(editor);

        expect(promptSpy).not.toHaveBeenCalled();
        expect(editor.value).toBe("[](https://)");
        // Cursor parks between `[` and `]` (link-text slot), not at end of doc.
        expect(editor.codemirror.state.selection.main.from).toBe(1);
    });
});
