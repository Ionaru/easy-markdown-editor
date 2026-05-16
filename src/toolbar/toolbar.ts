import { StateEffect } from "@codemirror/state";
import { ViewPlugin, ViewUpdate } from "@codemirror/view";

import { EasyMDE, type IEasyMDEPlugin, type IEasyMDEPluginClass } from "../easymde.js";
import { isLayeredIcon, type IToolbarButtonOptions, type ToolbarIcon } from "./default-toolbar.js";

export class Toolbar implements IEasyMDEPlugin {
    static readonly #activeClass = "enabled";

    // FA layer transform: shrink the overlay glyph and pin it to the icon's bottom-right corner.
    static readonly #overlayTransform = "shrink-6 down-5 right-10";

    readonly element: HTMLDivElement;

    constructor(
        private editor: EasyMDE,
        toolbarLayout: IToolbarButtonOptions[][],
    ) {
        this.element = document.createElement("div");
        this.element.className = "easymde-toolbar";

        for (const toolBarButtonSection of toolbarLayout) {
            const toolBarSection: (HTMLButtonElement | HTMLSpanElement)[] = [];

            for (const toolBarButtonOptions of toolBarButtonSection) {
                toolBarSection.push(this.#createToolBarButton(toolBarButtonOptions));
            }

            // Create a separator if this is not the last toolbar section.
            if (toolbarLayout.indexOf(toolBarButtonSection) !== toolbarLayout.length - 1) {
                toolBarSection.push(this.#createToolBarSeparator());
            }

            for (const toolBarEntry of toolBarSection) {
                this.element.append(toolBarEntry);
            }
        }

        this.editor.codemirror.dispatch();
    }

    mount(): void {
        this.editor.container.append(this.element);
    }

    unmount(): void {
        this.element.remove();
    }

    #createToolBarSeparator() {
        const separatorElement = document.createElement("span");
        separatorElement.className = "separator";
        separatorElement.innerHTML = "|";
        return separatorElement;
    }

    #createToolBarButton(toolBarButtonOptions: IToolbarButtonOptions): HTMLButtonElement {
        const buttonElement: HTMLButtonElement = document.createElement("button");
        buttonElement.tabIndex = -1;
        buttonElement.classList.add(toolBarButtonOptions.name);

        // Set the button tooltip.
        buttonElement.title = toolBarButtonOptions.title;

        // Set the button onclick action.
        if (typeof toolBarButtonOptions.action === "function") {
            buttonElement.addEventListener("click", () =>
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
                toolBarButtonOptions.action(this.editor),
            );
        } else if (typeof toolBarButtonOptions.action === "string") {
            buttonElement.addEventListener("click", () =>
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                window.open(toolBarButtonOptions.action),
            );
        }

        if (typeof toolBarButtonOptions.active === "boolean") {
            buttonElement.classList.toggle(Toolbar.#activeClass, toolBarButtonOptions.active);
        } else if (typeof toolBarButtonOptions.active === "function") {
            this.editor.codemirror.dispatch({
                effects: StateEffect.appendConfig.of(
                    ViewPlugin.define(() => ({
                        update: async (update: ViewUpdate) => {
                            if (typeof toolBarButtonOptions.active === "function") {
                                const result = await toolBarButtonOptions.active(
                                    this.editor,
                                    update,
                                );
                                buttonElement.classList.toggle(Toolbar.#activeClass, result);
                            }
                        },
                    })),
                ),
            });
        }

        // Set the button icon.
        buttonElement.append(Toolbar.#createIconElement(toolBarButtonOptions.icon));
        return buttonElement;
    }

    static #createIconElement(icon: ToolbarIcon): HTMLElement {
        if (!isLayeredIcon(icon)) {
            const iconElement = document.createElement("i");
            iconElement.className = `fa-solid fa-${icon.iconName}`;
            return iconElement;
        }

        const layers = document.createElement("span");
        layers.className = "fa-layers fa-fw";

        const base = document.createElement("i");
        base.className = `fa-solid fa-${icon.base.iconName}`;

        const overlay = document.createElement("i");
        overlay.className = `fa-solid fa-${icon.overlay.iconName}`;
        overlay.setAttribute("data-fa-transform", Toolbar.#overlayTransform);

        // DOM order = paint order: overlay drawn over base.
        layers.append(base, overlay);
        return layers;
    }
}

Toolbar satisfies IEasyMDEPluginClass<[IToolbarButtonOptions[][]]>;
