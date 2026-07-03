import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { createEditor } from "../../test-utils.js";
import { openGuide } from "./open-guide.js";

describe("openGuide", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        document.body.innerHTML = "";
    });

    it("opens the configured URL in a new tab with noopener", () => {
        expect.assertions(1);
        const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
        const editor = createEditor({ toolbarGuideUrl: "https://example.com/help" });

        openGuide(editor);

        expect(openSpy).toHaveBeenCalledWith("https://example.com/help", "_blank", "noopener");
    });

    it("falls back to the markdownguide.org default when no option is passed", () => {
        expect.assertions(1);
        const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
        const editor = createEditor();

        openGuide(editor);

        expect(openSpy).toHaveBeenCalledWith(
            "https://www.markdownguide.org/cheat-sheet/",
            "_blank",
            "noopener",
        );
    });

    it("no-ops when toolbarGuideUrl is an empty string", () => {
        expect.assertions(1);
        const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
        const editor = createEditor({ toolbarGuideUrl: "" });

        openGuide(editor);

        expect(openSpy).not.toHaveBeenCalled();
    });
});
