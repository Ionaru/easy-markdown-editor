import { afterEach, describe, expect, it } from "vitest";

import { EasyMDE } from "./easymde.js";

const createTextArea = (value: string): HTMLTextAreaElement => {
    const textArea = document.createElement("textarea");
    textArea.value = value;
    document.body.append(textArea);
    return textArea;
};

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
});
