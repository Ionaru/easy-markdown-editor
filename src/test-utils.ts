import { type EditorView, runScopeHandlers } from "@codemirror/view";

import { EasyMDE } from "./easymde.js";
import type { InputOptions } from "./options.js";

export const createTextArea = (value = ""): HTMLTextAreaElement => {
    const textArea = document.createElement("textarea");
    textArea.value = value;
    document.body.append(textArea);
    return textArea;
};

export const createEditor = (overrides: Partial<InputOptions> = {}): EasyMDE => {
    const textArea = createTextArea();
    return new EasyMDE({
        element: textArea,
        toolbar: false,
        statusbar: false,
        ...overrides,
    });
};

export const seedEditor = (value: string, overrides: Partial<InputOptions> = {}): EasyMDE => {
    const editor = createEditor({ trimInitialValue: false, ...overrides });
    editor.value = value;
    editor.codemirror.dispatch({
        selection: { anchor: editor.value.length },
    });
    return editor;
};

export const pressEnter = (view: EditorView): void => {
    const event = new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
        cancelable: true,
    });
    runScopeHandlers(view, event, "editor");
};
