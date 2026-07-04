import { runScopeHandlers } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { EasyMDE } from "./easymde.js";

/**
 * End-to-end style tests that drive a fully-assembled editor (real default
 * toolbar + statusbar) through the DOM, rather than exercising a single unit.
 * They confirm the toolbar buttons, keymap, roving-tabindex navigation and
 * form-submit sync are wired together correctly against a live CodeMirror view.
 */

const nextFrame = (): Promise<void> =>
    new Promise((resolve) => {
        requestAnimationFrame(() => {
            resolve();
        });
    });

// CodeMirror measures asynchronously; spin the frame budget until `isReady`
// holds (or it runs out, in which case the caller's assertions report the
// real failure). Mirrors the helper in easymde.spec.ts.
const settle = async (isReady: () => boolean = () => false, maxFrames = 30): Promise<void> => {
    for (let frame = 0; frame < maxFrames && !isReady(); frame++) {
        await nextFrame();
    }
};

// Guarded query so a missing element throws a clear message instead of tripping
// the no-non-null-assertion lint rule.
const query = <T extends Element>(root: ParentNode, selector: string): T => {
    const element = root.querySelector<T>(selector);
    if (!element) {
        throw new Error(`expected an element matching "${selector}"`);
    }
    return element;
};

// Mount an editor with the real default toolbar (the shared test-utils helpers
// default to toolbar:false). Optionally seed a value with a full-document
// selection so formatting actions have something to wrap.
const mountEditor = (value = "", parent: ParentNode = document.body): EasyMDE => {
    const textArea = document.createElement("textarea");
    parent.append(textArea);
    const editor = new EasyMDE({ element: textArea, trimInitialValue: false });
    if (value) {
        editor.value = value;
        editor.codemirror.dispatch({ selection: { anchor: 0, head: editor.value.length } });
    }
    return editor;
};

describe("editor integration", () => {
    afterEach(() => {
        document.body.innerHTML = "";
        document.body.style.overflow = "";
    });

    it("wraps the selection in ** when the bold toolbar button is clicked", async () => {
        expect.assertions(1);
        const editor = mountEditor("hello");

        query<HTMLButtonElement>(document.body, ".easymde-toolbar button.bold").click();
        await settle(() => editor.value === "**hello**");

        expect(editor.value).toBe("**hello**");
    });

    it("shows the preview pane and hides the editor when the preview button is clicked", async () => {
        expect.assertions(3);
        const editor = mountEditor("# heading");

        query<HTMLButtonElement>(document.body, ".easymde-toolbar button.preview").click();
        await settle(() => editor.isPreviewActive());

        const cmEditor = query<HTMLElement>(editor.container, ".cm-editor");
        const preview = query<HTMLElement>(editor.container, ".easymde-preview");
        expect(editor.isPreviewActive()).toBe(true);
        expect(getComputedStyle(cmEditor).display).toBe("none");
        expect(getComputedStyle(preview).display).toBe("block");
    });

    it("wraps the selection in ** on the Ctrl/Cmd-B keyboard shortcut", () => {
        expect.assertions(2);
        const editor = mountEditor("hello");

        const event = new KeyboardEvent("keydown", {
            key: "b",
            keyCode: "B".charCodeAt(0),
            bubbles: true,
            cancelable: true,
            ctrlKey: true,
        });
        const handled = runScopeHandlers(editor.codemirror, event, "editor");

        expect(handled).toBe(true);
        expect(editor.value).toBe("**hello**");
    });

    it("moves toolbar focus to the next button on ArrowRight", () => {
        expect.assertions(1);
        const editor = mountEditor();

        const buttons = [
            ...editor.container.querySelectorAll<HTMLButtonElement>(".easymde-toolbar button"),
        ];
        const [first, second] = buttons;
        if (!first || !second) {
            throw new Error("expected at least two toolbar buttons");
        }

        first.focus();
        first.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

        expect(document.activeElement).toBe(second);
    });

    it("syncs the editor content into the textarea on form submit", () => {
        expect.assertions(1);
        const form = document.createElement("form");
        form.addEventListener("submit", (event) => event.preventDefault());
        document.body.append(form);

        const editor = mountEditor("", form);
        editor.value = "submitted content";
        form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));

        expect(query<HTMLTextAreaElement>(form, "textarea").value).toBe("submitted content");
    });
});
