import { afterEach, describe, expect, it, vi } from "vitest";

import { createEditor } from "../../test-utils.js";
import { toggleSideBySideButton } from "./toggle-side-by-side.js";

describe("toggleSideBySideButton", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        document.body.innerHTML = "";
    });

    it("action invokes editor.toggleSideBySide", () => {
        expect.assertions(1);
        const editor = createEditor();
        const spy = vi.spyOn(editor, "toggleSideBySide");

        toggleSideBySideButton.action(editor);

        expect(spy).toHaveBeenCalledTimes(1);
    });

    it("active reflects editor.isSideBySideActive", () => {
        expect.assertions(2);
        const editor = createEditor();
        const active = toggleSideBySideButton.active as (e: typeof editor) => boolean;

        expect(active(editor)).toBe(false);

        editor.toggleSideBySide();

        expect(active(editor)).toBe(true);
    });
});
