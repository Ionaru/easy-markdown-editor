import { SelectionRange, StateEffect, Line } from '@codemirror/state';
import { ViewPlugin, ViewUpdate } from '@codemirror/view';

import { EasyMDE } from '../easymde';
import { countWords } from '../utils/count-words';

export class StatusBar {
    public element: HTMLDivElement;

    private characterCount = 0;
    private wordCount = 0;
    private lineCount = 1;
    private cursorLine = 1;
    private cursorColumn = 1;

    private selectionStart = 0;
    private selectionEnd = 0;

    public constructor(private editor: EasyMDE) {
        this.element = document.createElement('div');
        this.element.className = 'easymde-statusbar';

        // Initial values
        this.characterCount = this.editor.codemirror.state.doc.length;
        this.wordCount = countWords(this.editor.codemirror.state.doc);
        this.lineCount = this.editor.codemirror.state.doc.lines;

        const line = this.editor.codemirror.state.doc.lineAt(
            this.editor.codemirror.state.selection.main.to,
        );
        this.cursorLine = line.number;
        this.cursorColumn =
            this.editor.codemirror.state.selection.main.to - line.from + 1;
        this.selectionStart = this.editor.codemirror.state.selection.main.from;
        this.selectionEnd = this.editor.codemirror.state.selection.main.to;

        this.editor.codemirror.dispatch({
            effects: StateEffect.appendConfig.of(
                ViewPlugin.define(() => ({
                    update: (update: ViewUpdate) => {
                        const document = update.state.doc;
                        const selection = update.state.selection.main;

                        this.characterCount = document.length;
                        this.wordCount = countWords(document);
                        this.lineCount = document.lines;

                        const direction = this.getSelectionDirection(selection);
                        const toLine = document.lineAt(selection.to);
                        const fromLine = document.lineAt(selection.from);

                        let cursorLine: Line;

                        if (direction === 'left') {
                            // Cursor is at the start of the selection.
                            cursorLine = fromLine;
                            this.cursorColumn =
                                selection.from - cursorLine.from;
                        } else {
                            // Cursor is at the end of the selection, or there is no selection.
                            cursorLine = toLine;
                            this.cursorColumn = selection.to - cursorLine.from;

                            if (this.cursorColumn > toLine.length) {
                                // Column is incorrect, can happen when Ctrl+A is used. We need to manually adjust it.
                                this.cursorColumn = toLine.length;
                            }
                        }

                        this.cursorLine = cursorLine.number;
                        this.selectionStart = selection.from;
                        this.selectionEnd = selection.to;

                        // We start counting columns at 1.
                        this.cursorColumn++;

                        this.render();
                    },
                })),
            ),
        });

        this.render();
    }

    public render() {
        this.element.innerHTML = `
        <span class="status-bar-element">Lines: ${this.lineCount}</span>
        <span class="status-bar-element">Words: ${this.wordCount}</span>
        <span class="status-bar-element">Characters: ${this.characterCount}</span>
        <span class="status-bar-element">Pos: ${this.cursorLine}:${this.cursorColumn}</span>
        `;
    }

    private getSelectionDirection(
        selection: SelectionRange,
    ): 'right' | 'left' | undefined {
        return selection.from === this.selectionStart
            ? 'right'
            : selection.to === this.selectionEnd
            ? 'left'
            : undefined;
    }
}
