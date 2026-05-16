import { type ChangeSpec, Line } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

import { linesInSelection } from "./lines.js";

const HEADING_RE = /^(#{1,6}) /;
const MAX_LEVEL = 6;
const CYCLE = MAX_LEVEL + 1; // slots 0..6, where 0 means "no heading"

/** The heading level of a line (`1`–`6`), or `0` when it is not a heading. */
const levelOf = (text: string): number => HEADING_RE.exec(text)?.[1]?.length ?? 0;

/** Length of the existing `## ` prefix on a line, or `0` when it is not a heading. */
const prefixLen = (text: string): number => {
    const level = levelOf(text);
    return level === 0 ? 0 : level + 1;
};

/** A change that replaces a line's heading prefix with one for `level` (`0` strips it). */
const changeForLine = (line: Line, level: number): ChangeSpec => ({
    from: line.from,
    to: line.from + prefixLen(line.text),
    insert: level === 0 ? "" : `${"#".repeat(level)} `,
});

/** Rewrites the given lines in a single transaction, mapping each to a target heading level. */
const rewriteLines = (
    editor: EditorView,
    lines: Line[],
    targetLevel: (line: Line) => number,
): void => {
    editor.dispatch({ changes: lines.map((line) => changeForLine(line, targetLevel(line))) });
    editor.focus();
};

/** Returns whether every line intersecting the selection is at exactly `level`. */
export const checkHeading = (editor: EditorView, level: number): boolean =>
    linesInSelection(editor.state).every((line) => levelOf(line.text) === level);

/** Returns whether any line intersecting the selection carries a heading. */
export const currentLineHasHeading = (editor: EditorView): boolean =>
    linesInSelection(editor.state).some((line) => levelOf(line.text) > 0);

/**
 * Sets every line intersecting the selection to exactly heading `level`,
 * replacing any existing heading prefix. If every line is already at `level`,
 * the heading is removed from all instead (toggle off).
 */
export const setHeading = (editor: EditorView, level: number): void => {
    const lines = linesInSelection(editor.state);
    const allAtLevel = lines.every((line) => levelOf(line.text) === level);
    rewriteLines(editor, lines, () => (allAtLevel ? 0 : level));
};

/**
 * Steps every line intersecting the selection through the heading cycle by
 * `delta` (`+1` makes the heading smaller, `-1` makes it bigger). The cycle
 * wraps through "no heading": `none → 1 → … → 6 → none` for `+1`, the inverse
 * for `-1`. Each line moves independently.
 */
export const cycleHeading = (editor: EditorView, delta: number): void => {
    const lines = linesInSelection(editor.state);
    rewriteLines(editor, lines, (line) => (((levelOf(line.text) + delta) % CYCLE) + CYCLE) % CYCLE);
};
