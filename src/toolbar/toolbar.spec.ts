import { afterEach, describe, expect, it } from "vite-plus/test";

import { createEditor } from "../test-utils.js";
import { defaultToolbar } from "./default-toolbar.js";
import { Toolbar } from "./toolbar.js";

describe("Toolbar", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("builds DOM in the constructor without appending it", () => {
        const editor = createEditor();
        const toolbar = new Toolbar(editor, defaultToolbar);

        expect(toolbar.element.children.length).toBeGreaterThan(0);
        expect(toolbar.element.isConnected).toBe(false);
    });

    it("mount appends the element to the editor container", () => {
        const editor = createEditor();
        const toolbar = new Toolbar(editor, defaultToolbar);

        toolbar.mount();

        expect(editor.container.contains(toolbar.element)).toBe(true);
    });

    it("unmount removes the element from the container", () => {
        const editor = createEditor();
        const toolbar = new Toolbar(editor, defaultToolbar);
        toolbar.mount();

        toolbar.unmount();

        expect(toolbar.element.isConnected).toBe(false);
        expect(editor.container.contains(toolbar.element)).toBe(false);
    });

    it("does not rebuild DOM across mount/unmount cycles", () => {
        const editor = createEditor();
        const toolbar = new Toolbar(editor, defaultToolbar);
        const initialCount = toolbar.element.children.length;

        toolbar.mount();
        expect(toolbar.element.children.length).toBe(initialCount);

        toolbar.unmount();
        expect(toolbar.element.children.length).toBe(initialCount);

        toolbar.mount();
        expect(toolbar.element.children.length).toBe(initialCount);
    });

    it('sets type="button" on every toolbar button so a click cannot submit a form', () => {
        const editor = createEditor();
        const toolbar = new Toolbar(editor, defaultToolbar);

        const buttons = toolbar.element.querySelectorAll("button");
        expect(buttons.length).toBeGreaterThan(0);
        for (const button of buttons) {
            expect(button.type).toBe("button");
        }
    });

    it("exposes aria-pressed reflecting state on toggle buttons", () => {
        const editor = createEditor();
        const toolbar = new Toolbar(editor, defaultToolbar);

        const bold = toolbar.element.querySelector<HTMLButtonElement>("button.bold");
        expect(bold?.getAttribute("aria-pressed")).toBe("false");
        expect(bold?.classList.contains("enabled")).toBe(false);
    });

    it("omits aria-pressed on plain action buttons", () => {
        const editor = createEditor();
        const toolbar = new Toolbar(editor, defaultToolbar);

        const undo = toolbar.element.querySelector<HTMLButtonElement>("button.undo");
        expect(undo).not.toBeNull();
        expect(undo?.hasAttribute("aria-pressed")).toBe(false);
    });
});
