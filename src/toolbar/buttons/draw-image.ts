import { faImage } from "@fortawesome/free-solid-svg-icons";

import type { EasyMDE } from "../../easymde.js";
import { resolveLinkSuffix } from "../../utils/resolve-link-suffix.js";
import { wrapText } from "../../utils/wrap-text.js";
import type { IToolbarButtonOptions } from "../default-toolbar.js";

export const drawImage = (editor: EasyMDE): void => {
    const [prefix, suffix] = editor.options.insertTexts.image;
    let finalSuffix = suffix;
    if (editor.options.promptURLs) {
        const url = window.prompt(editor.options.promptTexts.image)?.trim();
        if (!url) return;
        finalSuffix = resolveLinkSuffix(suffix, url);
    }

    // Empty selection → cursor between the brackets to type the alt text;
    // wrapping a selection → cursor inside the parens (before the closing `)`)
    // to type/extend the URL.
    const { from, to } = editor.codemirror.state.selection.main;
    const closer = finalSuffix.lastIndexOf(")");
    const cursorFromEnd =
        from === to ? -finalSuffix.length : closer === -1 ? 0 : closer - finalSuffix.length;

    wrapText(editor.codemirror, prefix, finalSuffix, cursorFromEnd);
};

export const drawImageButton: IToolbarButtonOptions = {
    action: drawImage,
    icon: faImage,
    name: "image",
    title: "Insert Image",
};
