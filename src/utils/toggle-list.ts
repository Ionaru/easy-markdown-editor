import { EditorView } from "@codemirror/view";

import { linesInSelection } from "./lines.js";

export type ListType = "ul" | "ol" | "checklist";
export type UlStyle = "*" | "-" | "+";
export type OlDelimiter = "." | ")";

export type MarkerConfig =
    | { target: "ul"; style: UlStyle }
    | { target: "ol"; delim: OlDelimiter }
    | { target: "checklist" };

const CHECKLIST_RE = /^([*\-+]|\d{1,9}[.)]) \[[\sxX]\] /;
const ORDERED_RE = /^(\d{1,9})([.)]) /;
const UL_RE = /^[*\-+] /;

interface LineMatch {
    type: ListType;
    markerLength: number;
    hostPrefixLength: number;
}

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
 * list marker. Unordered detection accepts any of `*`, `-`, `+`; ordered
 * detection accepts either CommonMark delimiter (`.` or `)`); checklist
 * detection accepts the task marker hosted on any list-item kind.
 */
export const checkList = (editor: EditorView, target: ListType): boolean =>
    linesInSelection(editor.state).every((line) => detectLine(line.text)?.type === target);

/**
 * Toggles a list-type marker on every line intersecting the selection. If all
 * lines already match `config.target`, the markers are stripped (toggle off);
 * lines carrying a different list type have their marker swapped; bare lines
 * get the marker prepended. When stripping a checklist, only the `[?] `
 * portion is removed — the underlying list-item marker is preserved per GFM
 * §5.3 (a task list item is itself a list item).
 */
export const toggleList = (editor: EditorView, config: MarkerConfig): void => {
    const { state } = editor;
    const entries = linesInSelection(state).map((line) => ({ line, match: detectLine(line.text) }));
    if (entries.length === 0) return;

    const allTarget = entries.every(({ match }) => match?.type === config.target);

    let start = 1;
    const firstLine = entries[0]?.line;
    if (!allTarget && config.target === "ol" && firstLine && firstLine.number > 1) {
        const prevMatch = ORDERED_RE.exec(state.doc.line(firstLine.number - 1).text);
        if (prevMatch) start = Number(prevMatch[1]) + 1;
    }

    const changeSpec = entries.map(({ line, match }, i) => {
        const stripping = allTarget && match;
        const skip = stripping && match.type === "checklist" ? match.hostPrefixLength : 0;
        return {
            from: line.from + skip,
            to: line.from + (match?.markerLength ?? 0),
            insert: stripping ? "" : markerFor(config, start + i),
        };
    });

    const changes = state.changes(changeSpec);
    editor.dispatch({ changes, selection: state.selection.map(changes, 1) });
    editor.focus();
};
