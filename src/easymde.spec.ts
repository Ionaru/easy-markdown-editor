import { afterEach, describe, expect, it, vi } from "vitest";

import { EasyMDE, type IEasyMDEPlugin } from "./easymde.js";
import { createEditor, createTextArea, pressEnter, seedEditor } from "./test-utils.js";

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
        expect(editor.value).toBe("Hello **world**");
        expect(editor.isRendered).toBe(true);
        expect(textArea.hidden).toBe(true);

        editor.destruct();

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

        editor.value = "Changed";

        expect(editor.value).toBe("Changed");
        expect(textArea.value).toBe("Original");

        editor.destruct();

        expect(textArea.value).toBe("Changed");
    });

    it("mounts toolbar, preview and statusbar plugins by default", () => {
        const editor = new EasyMDE({ element: createTextArea() });

        const toolbar = editor.container.querySelector(".easymde-toolbar");
        const preview = editor.container.querySelector(".easymde-preview");
        const statusbar = editor.container.querySelector(".easymde-statusbar");

        expect(toolbar).not.toBeNull();
        expect(preview).not.toBeNull();
        expect(statusbar).not.toBeNull();
        expect(editor.container.firstElementChild).toBe(toolbar);
        expect(editor.container.lastElementChild).toBe(statusbar);
    });

    it("unmounts plugins on destroy", () => {
        const editor = new EasyMDE({ element: createTextArea() });

        const toolbar = editor.container.querySelector(".easymde-toolbar");
        const preview = editor.container.querySelector(".easymde-preview");
        const statusbar = editor.container.querySelector(".easymde-statusbar");

        editor.destruct();

        expect(toolbar?.isConnected).toBe(false);
        expect(preview?.isConnected).toBe(false);
        expect(statusbar?.isConnected).toBe(false);
        expect(document.querySelector(".easymde-toolbar")).toBeNull();
        expect(document.querySelector(".easymde-preview")).toBeNull();
        expect(document.querySelector(".easymde-statusbar")).toBeNull();
    });

    it("togglePreview toggles container class and renders current value", () => {
        const editor = new EasyMDE({ element: createTextArea("# Hello") });

        expect(editor.isPreviewActive()).toBe(false);
        expect(editor.container.classList.contains("preview-active")).toBe(false);

        editor.togglePreview();

        expect(editor.isPreviewActive()).toBe(true);
        expect(editor.container.classList.contains("preview-active")).toBe(true);
        const preview = editor.container.querySelector(".easymde-preview");
        expect(preview?.innerHTML).toContain("<h1>Hello</h1>");

        editor.togglePreview();

        expect(editor.isPreviewActive()).toBe(false);
        expect(editor.container.classList.contains("preview-active")).toBe(false);
    });

    it("togglePreview drives the toolbar preview button active class", async () => {
        const editor = new EasyMDE({ element: createTextArea() });
        const button = editor.container.querySelector<HTMLButtonElement>("button.preview");

        expect(button).not.toBeNull();
        expect(button?.classList.contains("enabled")).toBe(false);

        editor.togglePreview();
        await vi.waitFor(() => expect(button?.classList.contains("enabled")).toBe(true));

        editor.togglePreview();
        await vi.waitFor(() => expect(button?.classList.contains("enabled")).toBe(false));
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

        editor.destruct();

        expect(calls).toEqual(["B", "A"]);
    });

    it("syncs editor value to textarea on form submit", () => {
        const form = document.createElement("form");
        document.body.append(form);
        const textArea = document.createElement("textarea");
        textArea.value = "orig";
        form.append(textArea);

        const editor = new EasyMDE({ element: textArea, toolbar: false, statusbar: false });
        editor.value = "changed";

        expect(textArea.value).toBe("orig");

        form.addEventListener("submit", (event) => event.preventDefault());
        form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));

        expect(textArea.value).toBe("changed");
    });

    it("removes the form submit listener on destruct", () => {
        const form = document.createElement("form");
        form.addEventListener("submit", (event) => event.preventDefault());
        document.body.append(form);
        const textArea = document.createElement("textarea");
        textArea.value = "orig";
        form.append(textArea);

        const editor = new EasyMDE({ element: textArea, toolbar: false, statusbar: false });
        editor.value = "changed";
        editor.destruct();

        textArea.value = "sentinel";
        form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));

        expect(textArea.value).toBe("sentinel");
    });

    it("forceSync writes textarea on every doc change", () => {
        const textArea = createTextArea("orig");
        const editor = new EasyMDE({
            element: textArea,
            toolbar: false,
            statusbar: false,
            forceSync: true,
        });

        editor.value = "live";

        expect(textArea.value).toBe("live");
    });

    it("does not update textarea on doc change without forceSync", () => {
        const textArea = createTextArea("orig");
        const editor = new EasyMDE({ element: textArea, toolbar: false, statusbar: false });

        editor.value = "changed";

        expect(textArea.value).toBe("orig");
        editor.destruct();
    });

    it("construct without a form ancestor does not throw", () => {
        const textArea = createTextArea("orig");
        expect(
            () => new EasyMDE({ element: textArea, toolbar: false, statusbar: false }),
        ).not.toThrow();
    });

    it("trims leading/trailing whitespace from the textarea on construct by default", () => {
        const textArea = createTextArea("  \n  hello  \n  ");
        const editor = new EasyMDE({ element: textArea, toolbar: false, statusbar: false });

        expect(editor.value).toBe("hello");
    });

    it("preserves whitespace when trimInitialValue is false", () => {
        const textArea = createTextArea("  \n  hello  \n  ");
        const editor = new EasyMDE({
            element: textArea,
            toolbar: false,
            statusbar: false,
            trimInitialValue: false,
        });

        expect(editor.value).toBe("  \n  hello  \n  ");
    });

    describe("Enter key behavior", () => {
        it.each([
            { name: "two Enters after text", initial: "foo", presses: 2, expected: "foo\n\n" },
            { name: "three Enters after text", initial: "foo", presses: 3, expected: "foo\n\n\n" },
            { name: "three Enters in empty doc", initial: "", presses: 3, expected: "\n\n\n" },
            {
                name: "Enter continues list marker",
                initial: "- a",
                presses: 1,
                expected: "- a\n- ",
            },
            {
                name: "Enter continues blockquote marker",
                initial: "> a",
                presses: 1,
                expected: "> a\n> ",
            },
        ])("$name", ({ initial, presses, expected }) => {
            const editor = seedEditor(initial);

            for (let index = 0; index < presses; index++) {
                pressEnter(editor.codemirror);
            }

            expect(editor.value).toBe(expected);
        });
    });
});
