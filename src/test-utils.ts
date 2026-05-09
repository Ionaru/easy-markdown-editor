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
