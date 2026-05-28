import { afterEach, describe, expect, it, vi } from "vitest";

import { createEditor } from "../../test-utils.js";
import { drawImage } from "./draw-image.js";

describe("drawImage", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        document.body.innerHTML = "";
    });

    it("prepends the template's https:// when the prompted URL omits a scheme", () => {
        expect.assertions(2);
        const promptSpy = vi.spyOn(window, "prompt").mockReturnValue("example.com/i.png");
        const editor = createEditor({ promptURLs: true });

        drawImage(editor);

        expect(promptSpy).toHaveBeenCalledWith("URL of the image:");
        expect(editor.value).toBe("![](https://example.com/i.png)");
    });

    it("keeps a scheme the user typed instead of stacking https:// on top", () => {
        expect.assertions(1);
        vi.spyOn(window, "prompt").mockReturnValue("data:image/png;base64,abc");
        const editor = createEditor({ promptURLs: true });

        drawImage(editor);

        expect(editor.value).toBe("![](data:image/png;base64,abc)");
    });

    it("inserts nothing when the prompt is cancelled", () => {
        expect.assertions(1);
        vi.spyOn(window, "prompt").mockReturnValue(null);
        const editor = createEditor({ promptURLs: true });

        drawImage(editor);

        expect(editor.value).toBe("");
    });

    it("inserts the bare template without prompting when promptURLs is false", () => {
        expect.assertions(3);
        const promptSpy = vi.spyOn(window, "prompt");
        const editor = createEditor({ promptURLs: false });

        drawImage(editor);

        expect(promptSpy).not.toHaveBeenCalled();
        expect(editor.value).toBe("![](https://)");
        // Cursor parks between `![` and `]` (alt-text slot), not at end of doc.
        expect(editor.codemirror.state.selection.main.from).toBe(2);
    });
});
