import { countColumn, type EditorState, type Line } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

import { linesInSelection } from "./lines.js";

export type ListType = "ul" | "ol" | "checklist";
export type UlStyle = "*" | "-" | "+";
export type OlDelimiter = "." | ")";

export type MarkerConfig =
    | { target: "ul"; style: UlStyle }
    | { target: "ol"; delim: OlDelimiter }
    | { target: "checklist" };

const INDENT_RE = /^[ \t]*/;
const CHECKLIST_RE = /^([*\-+]|\d{1,9}[.)]) \[[\sxX]\] /;
const ORDERED_RE = /^(\d{1,9})([.)]) /;
const UL_RE = /^[*\-+] /;

interface LineMatch {
    type: ListType;
    markerLength: number;
    hostPrefixLength: number;
}

/** Detects the list marker at the very start of `text` (indentation already removed). */
const detectLine = (text: string): LineMatch | null => {
    const checklist = CHECKLIST_RE.exec(text);
    if (checklist?.[1]) {
        return {
            type: "checklist",
            markerLength: checklist[0].length,
            hostPrefixLength: checklist[1].length + 1,
        };
    }
    const ordered = ORDERED_RE.exec(text);
    if (ordered) return { type: "ol", markerLength: ordered[0].length, hostPrefixLength: 0 };
    const unordered = UL_RE.exec(text);
    if (unordered) return { type: "ul", markerLength: unordered[0].length, hostPrefixLength: 0 };
    return null;
};

/**
 * Length of `text`'s indentation. Only spaces and tabs count, at any width;
 * other whitespace such as U+00A0 is content.
 */
const indentOf = (text: string): number => INDENT_RE.exec(text)?.[0].length ?? 0;

/** Splits a line into its indentation length and the list marker that follows it. */
const parseLine = (text: string): { indent: number; match: LineMatch | null } => {
    const indent = indentOf(text);
    return { indent, match: detectLine(text.slice(indent)) };
};

/**
 * The number the selection's first ordered item starts at: one past the line
 * above when that line is an ordered item at the same indent column, else 1.
 */
const continuationStart = (state: EditorState, first: Line, column: number): number => {
    if (first.number === 1) return 1;
    const above = state.doc.line(first.number - 1).text;
    const indent = indentOf(above);
    const ordered = ORDERED_RE.exec(above.slice(indent));
    return ordered && countColumn(above, state.tabSize, indent) === column
        ? Number(ordered[1]) + 1
        : 1;
};

/**
 * Numbers the selected lines per indent level, comparing indent columns with
 * tabs expanded to `state.tabSize`. A deeper line opens a level counting from
 * 1, a line at the same column continues its level, and a shallower line
 * closes the levels deeper than it. The first line may continue the list
 * above the selection (see `continuationStart`).
 */
const orderedOrdinals = (
    state: EditorState,
    entries: readonly { line: Line; indent: number }[],
): number[] => {
    const levels: { column: number; last: number }[] = [];
    return entries.map(({ line, indent }, i) => {
        const column = countColumn(line.text, state.tabSize, indent);
        while ((levels.at(-1)?.column ?? -1) > column) levels.pop();
        const innermost = levels.at(-1);
        if (innermost?.column === column) {
            innermost.last += 1;
            return innermost.last;
        }
        const ordinal = i === 0 ? continuationStart(state, line, column) : 1;
        levels.push({ column, last: ordinal });
        return ordinal;
    });
};

const markerFor = (config: MarkerConfig, ordinal: number): string => {
    switch (config.target) {
        case "checklist":
            return "- [ ] ";
        case "ul":
            return `${config.style} `;
        case "ol":
            return `${ordinal}${config.delim} `;
    }
};

/**
 * Returns whether every line intersecting the selection carries `target`'s
 * list marker. Leading indentation (spaces and tabs, any width) is ignored.
 * Unordered detection accepts any of `*`, `-`, `+`; ordered detection accepts
 * either CommonMark delimiter (`.` or `)`); checklist detection accepts the
 * task marker hosted on any list-item kind.
 */
export const checkList = (editor: EditorView, target: ListType): boolean =>
    linesInSelection(editor.state).every((line) => parseLine(line.text).match?.type === target);

/**
 * Toggles a list-type marker on every line intersecting the selection. If all
 * lines already match `config.target`, the markers are stripped (toggle off);
 * lines carrying a different list type have their marker swapped; bare lines
 * get the marker inserted after their indentation. Leading indentation is
 * always kept, and ordered numbering restarts per indent level. When stripping
 * a checklist, only the `[?] ` portion is removed: the underlying list-item
 * marker is preserved per GFM §5.3 (a task list item is itself a list item).
 */
export const toggleList = (editor: EditorView, config: MarkerConfig): void => {
    const { state } = editor;
    const entries = linesInSelection(state).map((line) => ({ line, ...parseLine(line.text) }));
    if (entries.length === 0) return;

    const allTarget = entries.every(({ match }) => match?.type === config.target);
    const ordinals = !allTarget && config.target === "ol" ? orderedOrdinals(state, entries) : [];

    const changeSpec = entries.map(({ line, indent, match }, i) => {
        const markerFrom = line.from + indent;
        const stripping = allTarget && match;
        const skip = stripping && match.type === "checklist" ? match.hostPrefixLength : 0;
        return {
            from: markerFrom + skip,
            to: markerFrom + (match?.markerLength ?? 0),
            insert: stripping ? "" : markerFor(config, ordinals[i] ?? 1),
        };
    });

    const changes = state.changes(changeSpec);
    editor.dispatch({ changes, selection: state.selection.map(changes, 1) });
    editor.focus();
};
