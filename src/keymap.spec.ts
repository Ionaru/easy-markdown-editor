import { runScopeHandlers } from "@codemirror/view";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import type { EasyMDE } from "./easymde.js";
import { createEditor, seedEditor } from "./test-utils.js";

/**
 * Build a KeyboardEvent the way a real browser would emit it for the requested
 * logical key, then route it through CodeMirror's keymap.
 *
 * Two things matter for CM6's keymap fallback (see @codemirror/view runHandlers):
 *   - When Shift is held with a letter, the browser sets `key` to the uppercase
 *     form, so we mirror that here.
 *   - The shifted-letter fallback path looks up `base[keyCode]` to resolve the
 *     base letter, so `keyCode` must be set for letter keys.
 */
const press = (editor: EasyMDE, key: string, mods: Partial<KeyboardEventInit> = {}): boolean => {
    const isLetter = /^[a-z]$/i.test(key);
    const shifted = Boolean(mods.shiftKey);
    const effectiveKey = isLetter ? (shifted ? key.toUpperCase() : key.toLowerCase()) : key;
    const keyCode = isLetter ? key.toUpperCase().charCodeAt(0) : 0;
    const event = new KeyboardEvent("keydown", {
        key: effectiveKey,
        keyCode,
        bubbles: true,
        cancelable: true,
        ctrlKey: true,
        ...mods,
    });
    return runScopeHandlers(editor.codemirror, event, "editor");
};

const selectAll = (editor: EasyMDE): void => {
    editor.codemirror.dispatch({
        selection: { anchor: 0, head: editor.value.length },
    });
};

describe("easymde keymap", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        document.body.innerHTML = "";
        document.body.style.overflow = "";
    });

    it("Mod-b wraps the selection in **bold**", () => {
        expect.assertions(2);
        const editor = seedEditor("hello");
        selectAll(editor);

        expect(press(editor, "b")).toBe(true);
        expect(editor.value).toBe("**hello**");
    });

    it("Mod-i wraps the selection in *italic*", () => {
        expect.assertions(1);
        const editor = seedEditor("hello");
        selectAll(editor);

        press(editor, "i");

        expect(editor.value).toBe("*hello*");
    });

    it("Mod-' prefixes the current line with `> `", () => {
        expect.assertions(1);
        const editor = seedEditor("quote me");

        press(editor, "'");

        expect(editor.value).toBe("> quote me");
    });

    it("Mod-h cycles to a smaller heading on the current line", () => {
        expect.assertions(1);
        const editor = seedEditor("title");

        press(editor, "h");

        expect(editor.value).toBe("# title");
    });

    it("Shift-Mod-h cycles to a bigger heading on the current line", () => {
        expect.assertions(1);
        const editor = seedEditor("###### title");

        press(editor, "h", { shiftKey: true });

        expect(editor.value).toBe("##### title");
    });

    it("Mod-Alt-1 sets the current line to heading level 1", () => {
        expect.assertions(1);
        const editor = seedEditor("title");

        press(editor, "1", { altKey: true });

        expect(editor.value).toBe("# title");
    });

    it("Mod-Alt-6 sets the current line to heading level 6", () => {
        expect.assertions(1);
        const editor = seedEditor("title");

        press(editor, "6", { altKey: true });

        expect(editor.value).toBe("###### title");
    });

    it("Mod-l toggles an unordered list on the current line", () => {
        expect.assertions(1);
        const editor = seedEditor("item");

        press(editor, "l");

        expect(editor.value).toBe("* item");
    });

    it("Mod-Alt-l toggles an ordered list on the current line", () => {
        expect.assertions(1);
        const editor = seedEditor("item");

        press(editor, "l", { altKey: true });

        expect(editor.value).toBe("1. item");
    });

    it("Mod-k inserts a link template", () => {
        expect.assertions(1);
        const editor = createEditor({ promptURLs: false });

        press(editor, "k");

        expect(editor.value).toBe("[](https://)");
    });

    it("Mod-Alt-i inserts an image template", () => {
        expect.assertions(1);
        const editor = createEditor({ promptURLs: false });

        press(editor, "i", { altKey: true });

        expect(editor.value).toBe("![](https://)");
    });

    it("Mod-e strips block formatting from the current line", () => {
        expect.assertions(1);
        const editor = seedEditor("# heading");

        press(editor, "e");

        expect(editor.value).toBe("heading");
    });

    it("Mod-Alt-c wraps the selection in a fenced code block", () => {
        expect.assertions(1);
        const editor = seedEditor("code");
        selectAll(editor);

        press(editor, "c", { altKey: true });

        expect(editor.value).toBe("```\ncode\n```");
    });

    it("Mod-p toggles the preview pane", () => {
        expect.assertions(2);
        const editor = createEditor();
        expect(editor.isPreviewActive()).toBe(false);

        press(editor, "p");

        expect(editor.isPreviewActive()).toBe(true);
    });

    it("Mod-z undoes the last edit", () => {
        expect.assertions(2);
        const editor = createEditor();
        editor.codemirror.dispatch({ changes: { from: 0, insert: "hello" } });
        expect(editor.value).toBe("hello");

        press(editor, "z");

        expect(editor.value).toBe("");
    });

    it("Mod-y redoes after an undo", () => {
        expect.assertions(2);
        const editor = createEditor();
        editor.codemirror.dispatch({ changes: { from: 0, insert: "hello" } });
        press(editor, "z");
        expect(editor.value).toBe("");

        press(editor, "y");

        expect(editor.value).toBe("hello");
    });

    it("Shift-Mod-z also redoes after an undo", () => {
        expect.assertions(1);
        const editor = createEditor();
        editor.codemirror.dispatch({ changes: { from: 0, insert: "hello" } });
        press(editor, "z");

        press(editor, "z", { shiftKey: true });

        expect(editor.value).toBe("hello");
    });

    it("F9 toggles side-by-side mode", () => {
        expect.assertions(3);
        const editor = createEditor();
        const spy = vi.spyOn(editor, "toggleSideBySide");

        const handled = runScopeHandlers(
            editor.codemirror,
            new KeyboardEvent("keydown", { key: "F9" }),
            "editor",
        );

        expect(handled).toBe(true);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(editor.isSideBySideActive()).toBe(true);
    });

    it("F11 toggles fullscreen mode", () => {
        expect.assertions(3);
        const editor = createEditor();
        const spy = vi.spyOn(editor, "toggleFullscreen");

        const handled = runScopeHandlers(
            editor.codemirror,
            new KeyboardEvent("keydown", { key: "F11" }),
            "editor",
        );

        expect(handled).toBe(true);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(editor.isFullscreenActive()).toBe(true);
    });

    it("Enter still inserts a newline (handled by standardKeymap's insertNewlineAndIndent)", () => {
        expect.assertions(1);
        const editor = seedEditor("line1");

        runScopeHandlers(
            editor.codemirror,
            new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }),
            "editor",
        );

        expect(editor.value).toBe("line1\n");
    });
});
