import { afterEach, describe, expect, it, vi } from "vitest";

import { EasyMDE, type IEasyMDEPlugin } from "./easymde.js";
import { createEditor, createTextArea } from "./test-utils.js";

const makeStubPlugin = (
    editor: EasyMDE,
    onUnmount?: () => void,
    element: HTMLElement = document.createElement("div"),
): IEasyMDEPlugin => ({
    element,
    mount() {
        editor.container.append(this.element);
    },
    unmount() {
        onUnmount?.();
        this.element.remove();
    },
});

describe("EasyMDE", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("creates a ready editor instance", () => {
        const textArea = createTextArea("Hello **world**");
        const editor = new EasyMDE({
            element: textArea,
            toolbar: false,
            statusbar: false,
        });

        expect(editor.element).toBe(textArea);
        expect(editor.container).toBeInstanceOf(HTMLDivElement);
        expect(editor.codemirror.dom.isConnected).toBe(true);
        expect(editor.getValue()).toBe("Hello **world**");
        expect(editor.isRendered).toBe(true);
        expect(textArea.hidden).toBe(true);

        editor.destroy();

        expect(textArea.hidden).toBe(false);
        expect(editor.isRendered).toBe(false);
    });

    it("updates the editor value and syncs it back on destroy", () => {
        const textArea = createTextArea("Original");
        const editor = new EasyMDE({
            element: textArea,
            toolbar: false,
            statusbar: false,
        });

        editor.setValue("Changed");

        expect(editor.getValue()).toBe("Changed");
        expect(textArea.value).toBe("Original");

        editor.destroy();

        expect(textArea.value).toBe("Changed");
    });

    it("mounts toolbar and statusbar plugins by default", () => {
        const editor = new EasyMDE({ element: createTextArea() });

        const toolbar = editor.container.querySelector(".easymde-toolbar");
        const statusbar = editor.container.querySelector(".easymde-statusbar");

        expect(toolbar).not.toBeNull();
        expect(statusbar).not.toBeNull();
        expect(editor.container.firstElementChild).toBe(toolbar);
        expect(editor.container.lastElementChild).toBe(statusbar);
    });

    it("unmounts plugins on destroy", () => {
        const editor = new EasyMDE({ element: createTextArea() });

        const toolbar = editor.container.querySelector(".easymde-toolbar");
        const statusbar = editor.container.querySelector(".easymde-statusbar");

        editor.destroy();

        expect(toolbar?.isConnected).toBe(false);
        expect(statusbar?.isConnected).toBe(false);
        expect(document.querySelector(".easymde-toolbar")).toBeNull();
        expect(document.querySelector(".easymde-statusbar")).toBeNull();
    });

    it("addPlugin mounts the plugin into the container", () => {
        const editor = createEditor();
        const stub = makeStubPlugin(editor, undefined, document.createElement("aside"));
        const mountSpy = vi.spyOn(stub, "mount");

        editor.addPlugin(stub);

        expect(mountSpy).toHaveBeenCalledTimes(1);
        expect(editor.container.contains(stub.element)).toBe(true);
    });

    it("destroy unmounts plugins in reverse registration order", () => {
        const editor = createEditor();
        const calls: string[] = [];

        editor.addPlugin(makeStubPlugin(editor, () => calls.push("A")));
        editor.addPlugin(makeStubPlugin(editor, () => calls.push("B")));

        editor.destroy();

        expect(calls).toEqual(["B", "A"]);
    });
});
