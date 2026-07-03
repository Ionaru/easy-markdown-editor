import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { createEditor } from "../../test-utils.js";
import { toggleFullscreenButton } from "./toggle-fullscreen.js";

describe("toggleFullscreenButton", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        document.body.innerHTML = "";
        document.body.style.overflow = "";
    });

    it("action invokes editor.toggleFullscreen", () => {
        expect.assertions(1);
        const editor = createEditor();
        const spy = vi.spyOn(editor, "toggleFullscreen");

        toggleFullscreenButton.action(editor);

        expect(spy).toHaveBeenCalledTimes(1);
    });

    it("active reflects editor.isFullscreenActive", () => {
        expect.assertions(2);
        const editor = createEditor();
        const active = toggleFullscreenButton.active as (e: typeof editor) => boolean;

        expect(active(editor)).toBe(false);

        editor.toggleFullscreen();

        expect(active(editor)).toBe(true);
    });
});
