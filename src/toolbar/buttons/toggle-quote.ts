import { ViewUpdate } from "@codemirror/view";
import { faQuoteLeft } from "@fortawesome/free-solid-svg-icons";

import { EasyMDE } from "../../easymde.js";
import { checkLine, toggleLine } from "../../utils/toggle-line.js";
import type { IToolbarButtonOptions } from "../default-toolbar.js";

export const toggleQuote = (editor: EasyMDE): void => toggleLine(editor.codemirror, ">");

export const checkQuote = (editor: EasyMDE, _update: ViewUpdate): boolean =>
    checkLine(editor.codemirror, ">");

export const toggleQuoteButton: IToolbarButtonOptions = {
    action: toggleQuote,
    active: checkQuote,
    icon: faQuoteLeft,
    name: "quote",
    title: "Quote",
};
