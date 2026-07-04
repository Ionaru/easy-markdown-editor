import { afterEach, describe, expect, it } from "vite-plus/test";

import { createEditor } from "../test-utils.js";
import { StatusBar } from "./status-bar.js";

describe("StatusBar", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("mount appends the element to the editor container", () => {
        const editor = createEditor();
        const statusBar = new StatusBar(editor);

        statusBar.mount();

        expect(editor.container.contains(statusBar.element)).toBe(true);
        expect(statusBar.element.classList.contains("easymde-statusbar")).toBe(true);
    });

    it("unmount removes the element", () => {
        const editor = createEditor();
        const statusBar = new StatusBar(editor);
        statusBar.mount();

        statusBar.unmount();

        expect(statusBar.element.isConnected).toBe(false);
    });

    it("renders initial counters into element", () => {
        const editor = createEditor();
        const statusBar = new StatusBar(editor);
        statusBar.mount();

        const text = statusBar.element.textContent ?? "";
        expect(text).toContain("Lines:");
        expect(text).toContain("Words:");
        expect(text).toContain("Characters:");
        expect(text).toContain("Pos:");
    });

    it("exposes a polite status live region for assistive tech", () => {
        const editor = createEditor();
        const statusBar = new StatusBar(editor);

        expect(statusBar.element.getAttribute("role")).toBe("status");
        expect(statusBar.element.getAttribute("aria-live")).toBe("polite");
    });
});
