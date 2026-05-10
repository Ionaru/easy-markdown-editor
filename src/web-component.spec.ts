import { afterEach, describe, expect, it } from "vitest";

import { EasyMarkdownEditor } from "./web-component.js";

const TAG = "easy-markdown-editor";

const mount = (html = ""): EasyMarkdownEditor => {
    const host = document.createElement(TAG) as EasyMarkdownEditor;
    if (html) host.innerHTML = html;
    document.body.append(host);
    return host;
};

describe("<easy-markdown-editor>", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("registers the custom element", () => {
        expect(customElements.get(TAG)).toBe(EasyMarkdownEditor);
    });

    it("auto-creates a textarea and constructs an EasyMDE instance", () => {
        const host = mount();

        const textarea = host.querySelector("textarea");
        expect(textarea).not.toBeNull();
        expect(textarea?.hidden).toBe(true);
        expect(host.querySelector(".CodeMirror, .cm-editor")).not.toBeNull();
    });

    it("uses an existing child <textarea> and preserves its content", () => {
        const host = mount("<textarea>Pre-filled</textarea>");

        const textareas = host.querySelectorAll("textarea");
        expect(textareas.length).toBe(1);
        expect(host.value).toBe("Pre-filled");
    });

    it("applies the value attribute as initial content", () => {
        const host = document.createElement(TAG) as EasyMarkdownEditor;
        host.setAttribute("value", "Hello **world**");
        document.body.append(host);

        expect(host.value).toBe("Hello **world**");
    });

    it("does not throw when constructed with a placeholder attribute", () => {
        const host = document.createElement(TAG) as EasyMarkdownEditor;
        host.setAttribute("placeholder", "Type here…");
        host.setAttribute("toolbar", "false");
        host.setAttribute("statusbar", "false");
        document.body.append(host);

        expect(host.querySelector(".cm-editor")).not.toBeNull();
    });

    it('hides the toolbar when toolbar="false"', () => {
        const host = document.createElement(TAG) as EasyMarkdownEditor;
        host.setAttribute("toolbar", "false");
        document.body.append(host);

        expect(host.querySelector(".easymde-toolbar")).toBeNull();
    });

    it('hides the statusbar when statusbar="false"', () => {
        const host = document.createElement(TAG) as EasyMarkdownEditor;
        host.setAttribute("statusbar", "false");
        document.body.append(host);

        expect(host.querySelector(".easymde-statusbar")).toBeNull();
    });

    it("forwards the theme attribute to dataset.theme", () => {
        const host = document.createElement(TAG) as EasyMarkdownEditor;
        host.setAttribute("theme", "dark");
        document.body.append(host);

        expect(host.dataset.theme).toBe("dark");
    });

    it("exposes a value JS property that reads and writes the editor", () => {
        const host = mount();

        expect(host.value).toBe("");

        host.value = "Programmatic";

        expect(host.value).toBe("Programmatic");
    });

    it("caches the value before connect via the value attribute", () => {
        const host = document.createElement(TAG) as EasyMarkdownEditor;

        host.value = "Pre-connect";

        expect(host.getAttribute("value")).toBe("Pre-connect");

        document.body.append(host);

        expect(host.value).toBe("Pre-connect");
    });

    it("updates the editor when the value attribute mutates after connect", () => {
        const host = mount();

        host.setAttribute("value", "New text");

        expect(host.value).toBe("New text");
    });

    it("swaps dataset.theme when the theme attribute mutates after connect", () => {
        const host = document.createElement(TAG) as EasyMarkdownEditor;
        host.setAttribute("theme", "light");
        document.body.append(host);

        host.setAttribute("theme", "dark");
        expect(host.dataset.theme).toBe("dark");

        host.removeAttribute("theme");
        expect(host.dataset.theme).toBeUndefined();
    });

    it("ignores placeholder mutations after connect", () => {
        const host = mount();

        expect(() => host.setAttribute("placeholder", "ignored")).not.toThrow();
        expect(host.querySelector(".cm-editor")).not.toBeNull();
    });

    it("destructs the editor on disconnect and removes the auto-created textarea", () => {
        const host = mount();
        const textarea = host.querySelector("textarea");
        expect(textarea?.isConnected).toBe(true);

        host.remove();

        expect(host.querySelector(".cm-editor")).toBeNull();
        expect(textarea?.isConnected).toBe(false);
    });

    it("preserves a pre-existing textarea on disconnect", () => {
        const host = mount("<textarea>Keep me</textarea>");
        const textarea = host.querySelector("textarea") as HTMLTextAreaElement;

        host.remove();

        expect(textarea.isConnected).toBe(false);
        expect(textarea.value).toBe("Keep me");
        expect(host.contains(textarea)).toBe(true);
    });

    it("uses host text content as initial editor value", () => {
        const host = mount("hello");

        expect(host.value).toBe("hello");
        const textarea = host.querySelector("textarea") as HTMLTextAreaElement;
        expect(textarea.value).toBe("hello");
        const stray = Array.from(host.childNodes).some((n) => n.nodeType === Node.TEXT_NODE);
        expect(stray).toBe(false);
    });

    it("trims surrounding whitespace from text content by default", () => {
        const host = mount("\n   hello   \n");

        expect(host.value).toBe("hello");
    });

    it('preserves whitespace in text content when trim="false"', () => {
        const host = document.createElement(TAG) as EasyMarkdownEditor;
        host.setAttribute("trim", "false");
        host.append(document.createTextNode("\n  hi  \n"));
        document.body.append(host);

        expect(host.value).toBe("\n  hi  \n");
    });

    it("value attribute beats text content", () => {
        const host = document.createElement(TAG) as EasyMarkdownEditor;
        host.setAttribute("value", "x");
        host.append(document.createTextNode("y"));
        document.body.append(host);

        expect(host.value).toBe("x");
    });

    it("child <textarea> beats sibling text content", () => {
        const host = mount("y<textarea>z</textarea>");

        expect(host.value).toBe("z");
    });

    it("ignores whitespace-only text content", () => {
        const host = mount("   \n   ");

        expect(host.value).toBe("");
        const textarea = host.querySelector("textarea") as HTMLTextAreaElement;
        expect(textarea.value).toBe("");
    });

    it("forwards the name attribute to the auto-created textarea", () => {
        const host = document.createElement(TAG) as EasyMarkdownEditor;
        host.setAttribute("name", "comment");
        document.body.append(host);

        const textarea = host.querySelector("textarea") as HTMLTextAreaElement;
        expect(textarea.name).toBe("comment");
    });

    it("name attribute overrides a child textarea's own name", () => {
        const host = document.createElement(TAG) as EasyMarkdownEditor;
        host.setAttribute("name", "host-name");
        host.innerHTML = '<textarea name="own-name"></textarea>';
        document.body.append(host);

        const textarea = host.querySelector("textarea") as HTMLTextAreaElement;
        expect(textarea.name).toBe("host-name");
    });

    it("updates textarea.name reactively", () => {
        const host = document.createElement(TAG) as EasyMarkdownEditor;
        host.setAttribute("name", "first");
        document.body.append(host);

        const textarea = host.querySelector("textarea") as HTMLTextAreaElement;
        expect(textarea.name).toBe("first");

        host.setAttribute("name", "second");
        expect(textarea.name).toBe("second");

        host.removeAttribute("name");
        expect(textarea.name).toBe("");
    });

    it("submits its content under the configured name", () => {
        const form = document.createElement("form");
        document.body.append(form);
        const host = document.createElement(TAG) as EasyMarkdownEditor;
        host.setAttribute("name", "comment");
        host.append(document.createTextNode("hi"));
        form.append(host);

        form.addEventListener("submit", (e) => e.preventDefault());

        const data = new FormData(form);
        expect(data.get("comment")).toBe("hi");
    });
});
