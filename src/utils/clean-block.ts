import { type ChangeSpec, Line } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

import { blockContaining, findFenceBlocks } from "./fences.js";
import { deleteLine, linesInSelection } from "./lines.js";

const PREFIX_RES = [
    /^#{1,6} /,
    /^> /,
    /^(?:[*\-+]|\d{1,9}[.)]) \[[\sxX]\] /,
    /^\d{1,9}[.)] /,
    /^[*\-+] /,
];

const stripPrefix = (line: Line): ChangeSpec | null => {
    for (const re of PREFIX_RES) {
        const match = re.exec(line.text);
        if (match) return { from: line.from, to: line.from + match[0].length, insert: "" };
    }
    return null;
};

/**
 * Strips block-level formatting from every line intersecting the selection:
 * heading prefixes, the blockquote prefix, list markers (UL, OL, checklist),
 * and the open/close fences of any fenced-code block that any selected line
 * falls inside. Inline formatting (bold, italic, strikethrough, inline code)
 * is untouched.
 *
 * Spec basis. CommonMark §4.2 (ATX headings), §5.1 (blockquotes), §5.2 (list
 * items — both `.` and `)` ordered delimiters), §4.5 (fenced code). The GFM
 * §5.3 checklist marker is treated as a single block-level token and removed
 * whole — unlike `toggleList`'s checklist-off, which preserves the host list
 * marker, because cleanBlock's semantics are destructive, not toggle.
 */
export const cleanBlock = (editor: EditorView): void => {
    const { state } = editor;
    const lines = linesInSelection(state);
    if (lines.length === 0) return;

    const fenceBlocks = findFenceBlocks(state);
    const fenceLineNumbers = new Set<number>();
    const linesInsideFence = new Set<number>();
    for (const line of lines) {
        const fence = blockContaining(fenceBlocks, line.number);
        if (!fence) continue;
        fenceLineNumbers.add(fence.open.number);
        if (fence.close) fenceLineNumbers.add(fence.close.number);
        linesInsideFence.add(line.number);
    }

    const prefixChanges = lines
        .filter((line) => !linesInsideFence.has(line.number))
        .map(stripPrefix)
        .filter((change): change is ChangeSpec => change !== null);

    const fenceChanges: ChangeSpec[] = [];
    for (const number of fenceLineNumbers) {
        fenceChanges.push(deleteLine(state.doc.line(number), state.doc.length));
    }

    const changeSpec = [...prefixChanges, ...fenceChanges];
    if (changeSpec.length === 0) return;

    const changes = state.changes(changeSpec);
    editor.dispatch({ changes, selection: state.selection.map(changes, 1) });
    editor.focus();
};
