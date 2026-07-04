import { afterEach, describe, expect, it, vi } from "vite-plus/test";

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

const longDoc = (lines = 300): string => {
    let doc = "# scroll sync\n\n";
    for (let line = 1; line <= lines; line++) {
        doc += `Line ${line}: the quick brown fox jumps over the lazy dog.\n\n`;
    }
    return doc;
};

const getPreview = (editor: EasyMDE): HTMLElement => {
    const element = editor.container.querySelector<HTMLElement>(".easymde-preview");
    if (!element) {
        throw new Error("expected a .easymde-preview element");
    }
    return element;
};

const nextFrame = (): Promise<void> =>
    new Promise((resolve) => {
        requestAnimationFrame(() => {
            resolve();
        });
    });

// CodeMirror measures asynchronously; wait until `isReady` holds (or the frame budget runs
// out, in which case the caller's assertions report the real failure).
const settle = async (isReady: () => boolean = () => false, maxFrames = 30): Promise<void> => {
    for (let frame = 0; frame < maxFrames && !isReady(); frame++) {
        await nextFrame();
    }
};

describe("EasyMDE", () => {
    afterEach(() => {
        document.body.innerHTML = "";
        document.body.style.overflow = "";
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

    it("applies the theme option as a data-easymde-theme attribute on the container", () => {
        const editor = createEditor({ theme: "custom" });

        expect(editor.container.dataset.easymdeTheme).toBe("custom");
    });

    it("omits data-easymde-theme when no theme option is set", () => {
        const editor = createEditor();

        expect(editor.container.hasAttribute("data-easymde-theme")).toBe(false);
    });

    it("renders the placeholder text when the placeholder option is set", () => {
        const editor = createEditor({ placeholder: "Write something…" });

        const placeholderEl = editor.container.querySelector(".cm-placeholder");
        expect(placeholderEl).not.toBeNull();
        expect(placeholderEl?.textContent).toBe("Write something…");
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

    it("toggleSideBySide toggles container class and renders current value", () => {
        const editor = new EasyMDE({ element: createTextArea("# Hello") });

        expect(editor.isSideBySideActive()).toBe(false);
        expect(editor.container.classList.contains("easymde-side-by-side")).toBe(false);

        editor.toggleSideBySide();

        expect(editor.isSideBySideActive()).toBe(true);
        expect(editor.container.classList.contains("easymde-side-by-side")).toBe(true);
        const preview = editor.container.querySelector(".easymde-preview");
        expect(preview?.innerHTML).toContain("<h1>Hello</h1>");

        editor.toggleSideBySide();

        expect(editor.isSideBySideActive()).toBe(false);
        expect(editor.container.classList.contains("easymde-side-by-side")).toBe(false);
    });

    it("activating side-by-side clears preview-only mode", () => {
        const editor = new EasyMDE({ element: createTextArea("hi") });

        editor.togglePreview();
        expect(editor.isPreviewActive()).toBe(true);

        editor.toggleSideBySide();

        expect(editor.isSideBySideActive()).toBe(true);
        expect(editor.isPreviewActive()).toBe(false);
    });

    it("activating preview-only clears side-by-side mode", () => {
        const editor = new EasyMDE({ element: createTextArea("hi") });

        editor.toggleSideBySide();
        expect(editor.isSideBySideActive()).toBe(true);

        editor.togglePreview();

        expect(editor.isPreviewActive()).toBe(true);
        expect(editor.isSideBySideActive()).toBe(false);
    });

    it("doc changes re-render the preview while side-by-side is active (debounced)", () => {
        vi.useFakeTimers();
        try {
            const editor = new EasyMDE({ element: createTextArea("first") });
            const preview = editor.container.querySelector<HTMLDivElement>(".easymde-preview");
            editor.toggleSideBySide();
            expect(preview?.innerHTML).toContain("first");

            editor.value = "second";
            expect(preview?.innerHTML).toContain("first");

            vi.advanceTimersByTime(300);
            expect(preview?.innerHTML).toContain("second");

            editor.destruct();
        } finally {
            vi.useRealTimers();
        }
    });

    it("attaches scroll listeners only when syncSideBySidePreviewScroll is true", () => {
        const textArea = createTextArea();
        const editor = new EasyMDE({ element: textArea, syncSideBySidePreviewScroll: false });
        const scrollDom = editor.codemirror.scrollDOM;
        const addSpy = vi.spyOn(scrollDom, "addEventListener");

        editor.toggleSideBySide();

        expect(addSpy).not.toHaveBeenCalledWith("scroll", expect.anything());
    });

    it("attaches scroll listeners when syncSideBySidePreviewScroll defaults to true", () => {
        const textArea = createTextArea();
        const editor = new EasyMDE({ element: textArea });
        const scrollDom = editor.codemirror.scrollDOM;
        const addSpy = vi.spyOn(scrollDom, "addEventListener");

        editor.toggleSideBySide();

        expect(addSpy).toHaveBeenCalledWith("scroll", expect.any(Function), { passive: true });
    });

    it("destruct removes scroll listeners installed by side-by-side", () => {
        const textArea = createTextArea();
        const editor = new EasyMDE({ element: textArea });
        const scrollDom = editor.codemirror.scrollDOM;
        const removeSpy = vi.spyOn(scrollDom, "removeEventListener");

        editor.toggleSideBySide();
        editor.destruct();

        expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
    });

    it("side-by-side panes grow with content when the container height is unbounded", async () => {
        const editor = createEditor();
        editor.value = longDoc();
        editor.toggleSideBySide();
        const scroller = editor.codemirror.scrollDOM;
        await settle(() => false, 10);
        const preview = getPreview(editor);

        // No external height limit: both panes grow to fit their content and the page
        // scrolls, so neither pane has any internal scroll range.
        expect(scroller.scrollHeight - scroller.clientHeight).toBe(0);
        expect(preview.scrollHeight - preview.clientHeight).toBe(0);

        editor.destruct();
    });

    it("scrolling the editor proportionally scrolls the preview when the height is bounded", async () => {
        const editor = createEditor();
        editor.value = longDoc();
        editor.toggleSideBySide();
        editor.container.style.height = "300px";
        const scroller = editor.codemirror.scrollDOM;
        await settle(() => scroller.scrollHeight - scroller.clientHeight > 0);
        const preview = getPreview(editor);

        const editorMax = scroller.scrollHeight - scroller.clientHeight;
        const previewMax = preview.scrollHeight - preview.clientHeight;
        expect(editorMax).toBeGreaterThan(0);
        expect(previewMax).toBeGreaterThan(0);

        scroller.scrollTop = editorMax * 0.5;
        scroller.dispatchEvent(new Event("scroll"));

        expect(preview.scrollTop / previewMax).toBeCloseTo(0.5, 1);

        editor.destruct();
    });

    it("scrolling the preview proportionally scrolls the editor when the height is bounded", async () => {
        const editor = createEditor();
        editor.value = longDoc();
        editor.toggleSideBySide();
        editor.container.style.height = "300px";
        const scroller = editor.codemirror.scrollDOM;
        await settle(() => scroller.scrollHeight - scroller.clientHeight > 0);
        const preview = getPreview(editor);

        const editorMax = scroller.scrollHeight - scroller.clientHeight;
        const previewMax = preview.scrollHeight - preview.clientHeight;
        expect(editorMax).toBeGreaterThan(0);
        expect(previewMax).toBeGreaterThan(0);

        preview.scrollTop = previewMax * 0.25;
        preview.dispatchEvent(new Event("scroll"));

        expect(scroller.scrollTop / editorMax).toBeCloseTo(0.25, 1);

        editor.destruct();
    });

    it("does not sync scroll when syncSideBySidePreviewScroll is false", async () => {
        const editor = createEditor({ syncSideBySidePreviewScroll: false });
        editor.value = longDoc();
        editor.toggleSideBySide();
        editor.container.style.height = "300px";
        const scroller = editor.codemirror.scrollDOM;
        await settle(() => scroller.scrollHeight - scroller.clientHeight > 0);
        const preview = getPreview(editor);

        const editorMax = scroller.scrollHeight - scroller.clientHeight;
        expect(editorMax).toBeGreaterThan(0);

        scroller.scrollTop = editorMax * 0.5;
        scroller.dispatchEvent(new Event("scroll"));

        expect(preview.scrollTop).toBe(0);

        editor.destruct();
    });

    it("bounded side-by-side shrinks both panes to fit instead of overflowing the container", async () => {
        const editor = createEditor();
        editor.value = longDoc();
        editor.toggleSideBySide();
        // A content area below the panes' 300px min-height floor: both panes must shrink to
        // the bounded row and scroll internally, not spill out of the fixed-height box.
        editor.container.style.height = "200px";
        await settle(() => false, 12);
        const preview = getPreview(editor);

        expect(preview.clientHeight).toBeLessThan(250);
        expect(editor.container.scrollHeight).toBeLessThanOrEqual(
            editor.container.clientHeight + 1,
        );

        editor.destruct();
    });

    it("toggleFullscreen toggles container class and isFullscreenActive", () => {
        const editor = new EasyMDE({ element: createTextArea() });

        expect(editor.isFullscreenActive()).toBe(false);
        expect(editor.container.classList.contains("easymde-fullscreen")).toBe(false);

        editor.toggleFullscreen();

        expect(editor.isFullscreenActive()).toBe(true);
        expect(editor.container.classList.contains("easymde-fullscreen")).toBe(true);

        editor.toggleFullscreen();

        expect(editor.isFullscreenActive()).toBe(false);
        expect(editor.container.classList.contains("easymde-fullscreen")).toBe(false);

        editor.destruct();
    });

    it("locks body scroll on enter and restores the previous value on exit", () => {
        document.body.style.overflow = "scroll";
        const editor = new EasyMDE({ element: createTextArea() });

        editor.toggleFullscreen();
        expect(document.body.style.overflow).toBe("hidden");

        editor.toggleFullscreen();
        expect(document.body.style.overflow).toBe("scroll");

        editor.destruct();
    });

    it("Escape exits fullscreen", () => {
        const editor = new EasyMDE({ element: createTextArea() });

        editor.toggleFullscreen();
        expect(editor.isFullscreenActive()).toBe(true);

        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

        expect(editor.isFullscreenActive()).toBe(false);

        editor.destruct();
    });

    it("fires onToggleFullScreen with the entering boolean", () => {
        const onToggleFullScreen = vi.fn();
        const editor = new EasyMDE({ element: createTextArea(), onToggleFullScreen });

        editor.toggleFullscreen();
        editor.toggleFullscreen();

        expect(onToggleFullScreen).toHaveBeenNthCalledWith(1, true);
        expect(onToggleFullScreen).toHaveBeenNthCalledWith(2, false);

        editor.destruct();
    });

    it("destruct while fullscreen restores body scroll and removes the Escape listener", () => {
        document.body.style.overflow = "auto";
        const removeSpy = vi.spyOn(document, "removeEventListener");
        const editor = new EasyMDE({ element: createTextArea() });

        editor.toggleFullscreen();
        editor.destruct();

        expect(document.body.style.overflow).toBe("auto");
        expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
    });

    it("couples side-by-side with fullscreen when sideBySideFullscreen is true", () => {
        const editor = new EasyMDE({ element: createTextArea(), sideBySideFullscreen: true });

        editor.toggleSideBySide();
        expect(editor.isSideBySideActive()).toBe(true);
        expect(editor.isFullscreenActive()).toBe(true);

        editor.toggleSideBySide();
        expect(editor.isSideBySideActive()).toBe(false);
        expect(editor.isFullscreenActive()).toBe(false);
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
