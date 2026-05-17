import { EditorView } from "@codemirror/view";

import { linesInSelection } from "./lines.js";

export type ListType = "ul" | "ol" | "checklist";
export type UlStyle = "*" | "-" | "+";

const CHECKLIST_RE = /^- \[[ xX]\] /;
const ORDERED_RE = /^(\d{1,9})\. /;
const UL_RE = /^[*\-+] /;

interface LineMatch {
    type: ListType;
    markerLength: number;
}

const detectLine = (text: string): LineMatch | null => {
    const checklist = CHECKLIST_RE.exec(text);
    if (checklist) return { type: "checklist", markerLength: checklist[0].length };
    const ordered = ORDERED_RE.exec(text);
    if (ordered) return { type: "ol", markerLength: ordered[0].length };
    const unordered = UL_RE.exec(text);
    if (unordered) return { type: "ul", markerLength: unordered[0].length };
    return null;
};

const markerFor = (target: ListType, ulStyle: UlStyle, ordinal: number): string => {
    switch (target) {
        case "checklist":
            return "- [ ] ";
        case "ul":
            return `${ulStyle} `;
        case "ol":
            return `${ordinal}. `;
    }
};

/**
 * Returns whether every line intersecting the selection carries `target`'s
 * list marker. Unordered detection accepts any of `*`, `-`, `+`.
 */
export const checkList = (editor: EditorView, target: ListType): boolean =>
    linesInSelection(editor.state).every((line) => detectLine(line.text)?.type === target);

/**
 * Toggles a list-type marker on every line intersecting the selection. If all
 * lines already match `target`, the markers are stripped (toggle off); lines
 * carrying a different list type have their marker swapped; bare lines get the
 * marker prepended.
 */
export const toggleList = (editor: EditorView, target: ListType, ulStyle: UlStyle = "*"): void => {
    const { state } = editor;
    const entries = linesInSelection(state).map((line) => ({ line, match: detectLine(line.text) }));
    const allTarget = entries.every(({ match }) => match?.type === target);

    let start = 1;
    const firstLine = entries[0]?.line;
    if (!allTarget && target === "ol" && firstLine && firstLine.number > 1) {
        const prevMatch = ORDERED_RE.exec(state.doc.line(firstLine.number - 1).text);
        if (prevMatch) start = Number(prevMatch[1]) + 1;
    }

    const changeSpec = entries.map(({ line, match }, i) => ({
        from: line.from,
        to: line.from + (match?.markerLength ?? 0),
        insert: allTarget ? "" : markerFor(target, ulStyle, start + i),
    }));

    const changes = state.changes(changeSpec);
    editor.dispatch({ changes, selection: state.selection.map(changes, 1) });
    editor.focus();
};
