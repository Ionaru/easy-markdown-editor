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
        this.element.setAttribute("role", "toolbar");
        this.element.addEventListener("keydown", this.#handleKeydown);

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

        // Roving tabindex (WAI-ARIA toolbar pattern): only the first button is reachable
        // via Tab; #handleKeydown moves focus among the rest with the arrow/Home/End keys.
        const firstButton = this.element.querySelector<HTMLButtonElement>("button");
        if (firstButton) {
            firstButton.tabIndex = 0;
        }

        this.editor.codemirror.dispatch();
    }

    // Arrow keys move focus among buttons (wrapping at the ends); Home/End jump to the
    // first/last. Separators are <span>s, so the `button` query naturally skips them.
    #handleKeydown = (event: KeyboardEvent): void => {
        const buttons = [...this.element.querySelectorAll<HTMLButtonElement>("button")];
        if (buttons.length === 0) {
            return;
        }

        const active = document.activeElement;
        const currentIndex = active instanceof HTMLButtonElement ? buttons.indexOf(active) : -1;
        if (currentIndex === -1) {
            return;
        }

        let nextIndex: number;
        switch (event.key) {
            case "ArrowRight":
                nextIndex = (currentIndex + 1) % buttons.length;
                break;
            case "ArrowLeft":
                nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
                break;
            case "Home":
                nextIndex = 0;
                break;
            case "End":
                nextIndex = buttons.length - 1;
                break;
            default:
                return;
        }

        event.preventDefault();
        this.#focusButton(buttons, nextIndex);
    };

    #focusButton(buttons: HTMLButtonElement[], index: number): void {
        const target = buttons[index];
        if (!target) {
            return;
        }
        for (const button of buttons) {
            button.tabIndex = -1;
        }
        target.tabIndex = 0;
        target.focus();
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
        separatorElement.setAttribute("role", "separator");
        separatorElement.setAttribute("aria-orientation", "vertical");
        separatorElement.innerHTML = "|";
        return separatorElement;
    }

    #createToolBarButton(toolBarButtonOptions: IToolbarButtonOptions): HTMLButtonElement {
        const buttonElement: HTMLButtonElement = document.createElement("button");
        // Explicit type so a toolbar click never submits an enclosing <form> (default is "submit").
        buttonElement.type = "button";
        buttonElement.tabIndex = -1;
        buttonElement.classList.add(toolBarButtonOptions.name);

        // Set the button tooltip and its accessible name. The button is icon-only, so
        // aria-label (mirroring the title) is what assistive tech announces.
        buttonElement.title = toolBarButtonOptions.title;
        buttonElement.setAttribute("aria-label", toolBarButtonOptions.title);

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

        // Toggle buttons (those with an `active` state) expose that state to assistive tech
        // via aria-pressed, kept in sync with the visual `.enabled` class. Action buttons
        // (no `active`) get neither.
        const isToggle = typeof toolBarButtonOptions.active !== "undefined";
        const setActive = (state: boolean): void => {
            buttonElement.classList.toggle(Toolbar.#activeClass, state);
            if (isToggle) {
                buttonElement.setAttribute("aria-pressed", String(state));
            }
        };

        if (typeof toolBarButtonOptions.active === "boolean") {
            setActive(toolBarButtonOptions.active);
        } else if (typeof toolBarButtonOptions.active === "function") {
            // Expose an initial pressed state before the first editor update runs.
            setActive(false);
            this.editor.codemirror.dispatch({
                effects: StateEffect.appendConfig.of(
                    ViewPlugin.define(() => ({
                        update: async (update: ViewUpdate) => {
                            if (typeof toolBarButtonOptions.active === "function") {
                                const result = await toolBarButtonOptions.active(
                                    this.editor,
                                    update,
                                );
                                setActive(result);
                            }
                        },
                    })),
                ),
            });
        }

        // Set the button icon. It is decorative — the accessible name comes from
        // aria-label — so hide it from assistive tech.
        const iconElement = Toolbar.#createIconElement(toolBarButtonOptions.icon);
        iconElement.setAttribute("aria-hidden", "true");
        buttonElement.append(iconElement);
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
