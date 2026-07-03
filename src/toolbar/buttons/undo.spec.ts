import { afterEach, describe, expect, it } from "vite-plus/test";

import { createEditor } from "../../test-utils.js";
import { undoButton } from "./undo.js";

describe("undoButton", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("reverts the most recent document change", () => {
        expect.assertions(2);
        const editor = createEditor();
        editor.codemirror.dispatch({ changes: { from: 0, insert: "hello" } });
        expect(editor.value).toBe("hello");

        undoButton.action(editor);

        expect(editor.value).toBe("");
    });

    it("no-ops when the history stack is empty", () => {
        expect.assertions(1);
        const editor = createEditor();
        expect(() => undoButton.action(editor)).not.toThrow();
    });
});
