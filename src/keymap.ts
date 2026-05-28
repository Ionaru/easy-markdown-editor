import { redo, standardKeymap, undo } from "@codemirror/commands";
import { type Extension, Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";

import type { EasyMDE } from "./easymde.js";
import { cleanBlock } from "./toolbar/buttons/clean-block.js";
import { drawImage } from "./toolbar/buttons/draw-image.js";
import { drawLink } from "./toolbar/buttons/draw-link.js";
import { toggleBold } from "./toolbar/buttons/toggle-bold.js";
import { toggleCodeBlock } from "./toolbar/buttons/toggle-code-block.js";
import {
    toggleHeading1,
    toggleHeading2,
    toggleHeading3,
    toggleHeading4,
    toggleHeading5,
    toggleHeading6,
    toggleHeadingBigger,
    toggleHeadingSmaller,
} from "./toolbar/buttons/toggle-heading.js";
import { toggleItalic } from "./toolbar/buttons/toggle-italic.js";
import { toggleOrderedList } from "./toolbar/buttons/toggle-ol.js";
import { toggleQuote } from "./toolbar/buttons/toggle-quote.js";
import { toggleUnorderedList } from "./toolbar/buttons/toggle-ul.js";

/**
 * Build the EasyMDE default keymap for `editor`.
 *
 * Bindings register at {@link Prec.high} so they override CodeMirror's default
 * keymap when keys collide. `standardKeymap` is included at default precedence
 * to provide basic motion / Enter / Backspace.
 *
 * `Mod-` resolves to `Cmd` on macOS and `Ctrl` on Windows / Linux, so each
 * binding covers both platforms in a single entry.
 *
 * F9 (`toggleSideBySide`) and F11 (`toggleFullscreen`) are reserved as dormant
 * stubs — the public methods ship in Milestone C; when they exist these two
 * entries get swapped from `() => false` to the real action calls.
 */
export const createEasyMdeKeymap = (editor: EasyMDE): Extension => {
    const bind = (action: (e: EasyMDE) => void) => (): boolean => {
        action(editor);
        return true;
    };
    return [
        Prec.high(
            keymap.of([
                { key: "Mod-b", run: bind(toggleBold) },
                { key: "Mod-i", run: bind(toggleItalic) },
                { key: "Mod-'", run: bind(toggleQuote) },
                { key: "Mod-h", run: bind(toggleHeadingSmaller) },
                { key: "Shift-Mod-h", run: bind(toggleHeadingBigger) },
                { key: "Mod-l", run: bind(toggleUnorderedList) },
                { key: "Mod-Alt-l", run: bind(toggleOrderedList) },
                { key: "Mod-k", run: bind(drawLink) },
                { key: "Mod-Alt-i", run: bind(drawImage) },
                { key: "Mod-e", run: bind(cleanBlock) },
                { key: "Mod-Alt-c", run: bind(toggleCodeBlock) },
                { key: "Mod-p", run: bind((e) => e.togglePreview()) },
                { key: "Mod-z", run: undo },
                { key: "Mod-y", run: redo },
                { key: "Shift-Mod-z", run: redo },
                { key: "Mod-Alt-1", run: bind(toggleHeading1) },
                { key: "Mod-Alt-2", run: bind(toggleHeading2) },
                { key: "Mod-Alt-3", run: bind(toggleHeading3) },
                { key: "Mod-Alt-4", run: bind(toggleHeading4) },
                { key: "Mod-Alt-5", run: bind(toggleHeading5) },
                { key: "Mod-Alt-6", run: bind(toggleHeading6) },
                // F9 / F11 — dormant until Milestone C ships toggleSideBySide / toggleFullscreen.
                // Returning false lets the key fall through (e.g. browser-native F11 fullscreen).
                { key: "F9", run: () => false },
                { key: "F11", run: () => false },
            ]),
        ),
        keymap.of(standardKeymap),
    ];
};
