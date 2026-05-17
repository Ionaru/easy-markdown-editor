import { type EditorState, Line } from "@codemirror/state";

const FENCE_RE = /^ {0,3}(?<marker>`{3,}|~{3,})/;

export interface FenceBlock {
    open: Line;
    close: Line | null;
}

interface FenceLine {
    line: Line;
    char: "`" | "~";
    length: number;
}

const fenceOf = (line: Line): FenceLine | null => {
    const marker = FENCE_RE.exec(line.text)?.groups?.marker;
    if (!marker) return null;
    const char = marker[0];
    if (char !== "`" && char !== "~") return null;
    return { line, char, length: marker.length };
};

/**
 * Walks the document once and returns every fenced code block in document
 * order. CommonMark §4.5: an opening fence is three or more back-ticks or
 * tildes (the row may be indented up to three spaces); the matching closing
 * fence uses the same character and is at least as long. An unterminated
 * opener (no matching closer before end of document) is still emitted, with
 * `close: null`.
 */
export const findFenceBlocks = (state: EditorState): FenceBlock[] => {
    const blocks: FenceBlock[] = [];
    let open: FenceLine | null = null;
    for (let n = 1; n <= state.doc.lines; n++) {
        const candidate = fenceOf(state.doc.line(n));
        if (!candidate) continue;
        if (open === null) {
            open = candidate;
            continue;
        }
        if (candidate.char === open.char && candidate.length >= open.length) {
            blocks.push({ open: open.line, close: candidate.line });
            open = null;
        }
    }
    if (open !== null) blocks.push({ open: open.line, close: null });
    return blocks;
};

/** Returns the block in `blocks` that contains `lineNumber`, or `null` if none. */
export const blockContaining = (blocks: FenceBlock[], lineNumber: number): FenceBlock | null => {
    for (const block of blocks) {
        const start = block.open.number;
        const end = block.close?.number ?? Infinity;
        if (lineNumber >= start && lineNumber <= end) return block;
    }
    return null;
};
