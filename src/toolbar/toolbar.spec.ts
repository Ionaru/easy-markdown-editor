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
});
