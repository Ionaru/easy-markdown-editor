import { undo } from "@codemirror/commands";
import { afterEach, describe, expect, it } from "vitest";

import { createEditor } from "../../test-utils.js";
import { redoButton } from "./redo.js";

describe("redoButton", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("re-applies a change that was undone", () => {
        expect.assertions(2);
        const editor = createEditor();
        editor.codemirror.dispatch({ changes: { from: 0, insert: "hello" } });
        undo(editor.codemirror);
        expect(editor.value).toBe("");

        redoButton.action(editor);

        expect(editor.value).toBe("hello");
    });

    it("no-ops when the redo stack is empty", () => {
        expect.assertions(1);
        const editor = createEditor();
        expect(() => redoButton.action(editor)).not.toThrow();
    });
});
