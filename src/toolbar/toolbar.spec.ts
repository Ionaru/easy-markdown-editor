import { afterEach, describe, expect, it } from "vite-plus/test";

import { createEditor } from "../test-utils.js";
import { defaultToolbar } from "./default-toolbar.js";
import { Toolbar } from "./toolbar.js";

// noUncheckedIndexedAccess widens indexed access to `T | undefined`; this narrows it
// back to a concrete button (throwing on a bad index) without a non-null assertion.
const at = (buttons: HTMLButtonElement[], index: number): HTMLButtonElement => {
    const button = buttons[index];
    if (!button) {
        throw new Error(`expected a toolbar button at index ${index}`);
    }
    return button;
};

describe("Toolbar", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("builds DOM in the constructor without appending it", () => {
        const editor = createEditor();
        const toolbar = new Toolbar(editor, defaultToolbar);

        expect(toolbar.element.children.length).toBeGreaterThan(0);
        expect(toolbar.element.isConnected).toBe(false);
    });

    it("mount appends the element to the editor container", () => {
        const editor = createEditor();
        const toolbar = new Toolbar(editor, defaultToolbar);

        toolbar.mount();

        expect(editor.container.contains(toolbar.element)).toBe(true);
    });

    it("unmount removes the element from the container", () => {
        const editor = createEditor();
        const toolbar = new Toolbar(editor, defaultToolbar);
        toolbar.mount();

        toolbar.unmount();

        expect(toolbar.element.isConnected).toBe(false);
        expect(editor.container.contains(toolbar.element)).toBe(false);
    });

    it("does not rebuild DOM across mount/unmount cycles", () => {
        const editor = createEditor();
        const toolbar = new Toolbar(editor, defaultToolbar);
        const initialCount = toolbar.element.children.length;

        toolbar.mount();
        expect(toolbar.element.children.length).toBe(initialCount);

        toolbar.unmount();
        expect(toolbar.element.children.length).toBe(initialCount);

        toolbar.mount();
        expect(toolbar.element.children.length).toBe(initialCount);
    });

    it('sets type="button" on every toolbar button so a click cannot submit a form', () => {
        const editor = createEditor();
        const toolbar = new Toolbar(editor, defaultToolbar);

        const buttons = toolbar.element.querySelectorAll("button");
        expect(buttons.length).toBeGreaterThan(0);
        for (const button of buttons) {
            expect(button.type).toBe("button");
        }
    });

    it("exposes aria-pressed reflecting state on toggle buttons", () => {
        const editor = createEditor();
        const toolbar = new Toolbar(editor, defaultToolbar);

        const bold = toolbar.element.querySelector<HTMLButtonElement>("button.bold");
        expect(bold?.getAttribute("aria-pressed")).toBe("false");
        expect(bold?.classList.contains("enabled")).toBe(false);
    });

    it("omits aria-pressed on plain action buttons", () => {
        const editor = createEditor();
        const toolbar = new Toolbar(editor, defaultToolbar);

        const undo = toolbar.element.querySelector<HTMLButtonElement>("button.undo");
        expect(undo).not.toBeNull();
        expect(undo?.hasAttribute("aria-pressed")).toBe(false);
    });

    it('exposes role="toolbar" on the container', () => {
        const editor = createEditor();
        const toolbar = new Toolbar(editor, defaultToolbar);

        expect(toolbar.element.getAttribute("role")).toBe("toolbar");
    });

    it("mirrors each button's title into aria-label", () => {
        const editor = createEditor();
        const toolbar = new Toolbar(editor, defaultToolbar);

        const buttons = toolbar.element.querySelectorAll("button");
        expect(buttons.length).toBeGreaterThan(0);
        for (const button of buttons) {
            expect(button.title.length).toBeGreaterThan(0);
            expect(button.getAttribute("aria-label")).toBe(button.title);
        }
    });

    it("hides the decorative icon of every button from assistive tech", () => {
        const editor = createEditor();
        const toolbar = new Toolbar(editor, defaultToolbar);

        const buttons = toolbar.element.querySelectorAll("button");
        for (const button of buttons) {
            expect(button.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
        }
    });

    it('marks separators with role="separator" and vertical orientation', () => {
        const editor = createEditor();
        const toolbar = new Toolbar(editor, defaultToolbar);

        const separators = toolbar.element.querySelectorAll(".separator");
        expect(separators.length).toBeGreaterThan(0);
        for (const separator of separators) {
            expect(separator.getAttribute("role")).toBe("separator");
            expect(separator.getAttribute("aria-orientation")).toBe("vertical");
        }
    });

    it("puts only the first button in the tab order (roving tabindex)", () => {
        const editor = createEditor();
        const toolbar = new Toolbar(editor, defaultToolbar);

        const buttons = [...toolbar.element.querySelectorAll<HTMLButtonElement>("button")];
        expect(at(buttons, 0).getAttribute("tabindex")).toBe("0");
        for (const button of buttons.slice(1)) {
            expect(button.getAttribute("tabindex")).toBe("-1");
        }
    });

    it("moves focus to the next button and updates roving tabindex on ArrowRight", () => {
        const editor = createEditor();
        const toolbar = new Toolbar(editor, defaultToolbar);
        toolbar.mount();
        const buttons = [...toolbar.element.querySelectorAll<HTMLButtonElement>("button")];

        at(buttons, 0).focus();
        at(buttons, 0).dispatchEvent(
            new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
        );

        expect(document.activeElement).toBe(at(buttons, 1));
        expect(at(buttons, 1).getAttribute("tabindex")).toBe("0");
        expect(at(buttons, 0).getAttribute("tabindex")).toBe("-1");
    });

    it("skips separators when arrowing across a group boundary", () => {
        const editor = createEditor();
        const toolbar = new Toolbar(editor, defaultToolbar);
        toolbar.mount();
        const buttons = [...toolbar.element.querySelectorAll<HTMLButtonElement>("button")];

        // Index 2 is the last button of the first group, immediately before a separator;
        // the buttons array excludes separators, so landing on index 3 proves it was skipped.
        at(buttons, 2).focus();
        at(buttons, 2).dispatchEvent(
            new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
        );

        expect(document.activeElement).toBe(at(buttons, 3));
    });

    it("wraps to the last button on ArrowLeft from the first", () => {
        const editor = createEditor();
        const toolbar = new Toolbar(editor, defaultToolbar);
        toolbar.mount();
        const buttons = [...toolbar.element.querySelectorAll<HTMLButtonElement>("button")];

        at(buttons, 0).focus();
        at(buttons, 0).dispatchEvent(
            new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
        );

        expect(document.activeElement).toBe(at(buttons, buttons.length - 1));
    });

    it("wraps to the first button on ArrowRight from the last", () => {
        const editor = createEditor();
        const toolbar = new Toolbar(editor, defaultToolbar);
        toolbar.mount();
        const buttons = [...toolbar.element.querySelectorAll<HTMLButtonElement>("button")];
        const last = at(buttons, buttons.length - 1);

        last.focus();
        last.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

        expect(document.activeElement).toBe(at(buttons, 0));
    });

    it("jumps to the first button on Home and the last on End", () => {
        const editor = createEditor();
        const toolbar = new Toolbar(editor, defaultToolbar);
        toolbar.mount();
        const buttons = [...toolbar.element.querySelectorAll<HTMLButtonElement>("button")];
        const last = at(buttons, buttons.length - 1);

        at(buttons, 2).focus();
        at(buttons, 2).dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
        expect(document.activeElement).toBe(last);

        last.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
        expect(document.activeElement).toBe(at(buttons, 0));
    });
});
