import { StateEffect } from '@codemirror/state';
import { ViewPlugin, ViewUpdate } from '@codemirror/view';

import { EasyMDE, IEasyMDEPlugin } from '../easymde';

import { IToolbarButtonOptions } from './default-toolbar';

export class Toolbar implements IEasyMDEPlugin {
    private static readonly activeClass = 'enabled';

    public element: HTMLDivElement;

    public constructor(
        private editor: EasyMDE,
        toolbarLayout: IToolbarButtonOptions[][],
    ) {
        this.element = document.createElement('div');
        this.element.className = 'easymde-toolbar';

        for (const toolBarButtonSection of toolbarLayout) {
            const toolBarSection: Array<HTMLButtonElement | HTMLSpanElement> =
                [];

            for (const toolBarButtonOptions of toolBarButtonSection) {
                toolBarSection.push(
                    this.createToolBarButton(toolBarButtonOptions),
                );
            }

            // Create a separator if this is not the last toolbar section.
            if (
                toolbarLayout.indexOf(toolBarButtonSection) !==
                toolbarLayout.length - 1
            ) {
                toolBarSection.push(this.createToolBarSeparator());
            }

            for (const toolBarEntry of toolBarSection) {
                this.element.append(toolBarEntry);
            }
        }

        this.editor.codemirror.dispatch();

        // Add the toolbar to the editor.

        // const cmWrapper = this.codemirror.getWrapperElement();
        // if (cmWrapper.parentNode) {
        //     cmWrapper.parentNode.insertBefore(toolBar, cmWrapper);
        // }

        // return toolBar;
    }

    public async build(toolbarLayout: IToolbarButtonOptions[][]) {
        for (const toolBarButtonSection of toolbarLayout) {
            const toolBarSection: Array<HTMLButtonElement | HTMLSpanElement> =
                [];

            for (const toolBarButtonOptions of toolBarButtonSection) {
                toolBarSection.push(
                    this.createToolBarButton(toolBarButtonOptions),
                );
            }

            // Create a separator if this is not the last toolbar section.
            if (
                toolbarLayout.indexOf(toolBarButtonSection) !==
                toolbarLayout.length - 1
            ) {
                toolBarSection.push(this.createToolBarSeparator());
            }

            for (const toolBarEntry of toolBarSection) {
                this.element.append(toolBarEntry);
            }
        }
    }
    public async destroy() {
        this.element.remove();
    }

    private createToolBarSeparator() {
        const separatorElement = document.createElement('span');
        separatorElement.className = 'separator';
        separatorElement.innerHTML = '|';
        return separatorElement;
    }

    private createToolBarButton(
        toolBarButtonOptions: IToolbarButtonOptions,
    ): HTMLButtonElement {
        const buttonElement: HTMLButtonElement =
            document.createElement('button');
        buttonElement.tabIndex = -1;
        buttonElement.classList.add(toolBarButtonOptions.name);

        // Set the button tooltip.
        buttonElement.title = toolBarButtonOptions.title;

        // Set the button onclick action.
        if (typeof toolBarButtonOptions.action === 'function') {
            buttonElement.addEventListener('click', () =>
                toolBarButtonOptions.action(this.editor),
            );
            // buttonElement.addEventListener()
        } else if (typeof toolBarButtonOptions.action === 'string') {
            buttonElement.addEventListener('click', () =>
                window.open(toolBarButtonOptions.action),
            );
        }

        if (typeof toolBarButtonOptions.active === 'boolean') {
            buttonElement.classList.toggle(
                Toolbar.activeClass,
                toolBarButtonOptions.active,
            );
        } else if (typeof toolBarButtonOptions.active === 'function') {
            this.editor.codemirror.dispatch({
                effects: StateEffect.appendConfig.of(
                    ViewPlugin.define(() => ({
                        update: async (update: ViewUpdate) => {
                            if (
                                typeof toolBarButtonOptions.active ===
                                'function'
                            ) {
                                const result =
                                    await toolBarButtonOptions.active(
                                        this.editor,
                                        update,
                                    );
                                buttonElement.classList.toggle(
                                    Toolbar.activeClass,
                                    result,
                                );
                            }
                        },
                    })),
                ),
            });
        }

        // Set the button icon.
        const buttonIcon = document.createElement('i');
        buttonIcon.className = toolBarButtonOptions.icon;

        buttonElement.append(buttonIcon);
        return buttonElement;
    }
}
