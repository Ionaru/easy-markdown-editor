import { faStar } from "@fortawesome/free-solid-svg-icons";
import { describe, expect, it } from "vitest";

import { resolveOptions, type InputOptions, type ToolbarButton } from "../options.js";
import { buildToolbar } from "./build-toolbar.js";
import { drawLinkButton } from "./buttons/draw-link.js";
import { toggleBoldButton } from "./buttons/toggle-bold.js";
import { toggleCodeBlockButton } from "./buttons/toggle-code-block.js";
import { toggleItalicButton } from "./buttons/toggle-italic.js";
import { defaultToolbar, type IToolbarButtonOptions } from "./default-toolbar.js";

const opts = (overrides: Omit<InputOptions, "element"> = {}) =>
    resolveOptions({ element: document.createElement("textarea"), ...overrides });

describe("buildToolbar", () => {
    it("returns an empty layout when toolbar is false", () => {
        expect(buildToolbar(opts({ toolbar: false }))).toEqual([]);
    });

    it("returns defaultToolbar unchanged when toolbar is unset", () => {
        expect(buildToolbar(opts())).toEqual(defaultToolbar);
    });

    it("filters hideIcons from the default layout", () => {
        const result = buildToolbar(opts({ hideIcons: ["bold"] }));
        const names = result.flat().map((b) => b.name);
        expect(names).not.toContain("bold");
        expect(names).toContain("italic");
    });

    it("drops a group emptied by hideIcons so no double separator is rendered", () => {
        const result = buildToolbar(opts({ hideIcons: ["guide"] }));
        expect(result.length).toBe(defaultToolbar.length - 1);
        expect(result.flat().map((b) => b.name)).not.toContain("guide");
    });

    it("appends showIcons as a single new trailing group", () => {
        const result = buildToolbar(opts({ showIcons: ["code-block"] }));
        expect(result.length).toBe(defaultToolbar.length + 1);
        expect(result.at(-1)).toEqual([toggleCodeBlockButton]);
    });

    it("uses the explicit toolbar array directly, splitting groups on '|'", () => {
        const result = buildToolbar(opts({ toolbar: ["bold", "|", "italic", "link"] }));
        expect(result).toEqual([[toggleBoldButton], [toggleItalicButton, drawLinkButton]]);
    });

    it("passes raw IToolbarButtonOptions through unchanged", () => {
        const custom: IToolbarButtonOptions = {
            name: "custom",
            title: "Custom",
            icon: faStar,
            action: () => {},
        };
        const result = buildToolbar(opts({ toolbar: ["bold", custom] }));
        expect(result).toEqual([[toggleBoldButton, custom]]);
    });

    it("ignores hideIcons and showIcons when an explicit toolbar array is provided", () => {
        const result = buildToolbar(
            opts({
                toolbar: ["bold"],
                hideIcons: ["bold"],
                showIcons: ["italic"],
            }),
        );
        expect(result).toEqual([[toggleBoldButton]]);
    });

    it("silently filters DEFERRED_BUTTON entries and drops emptied groups", () => {
        const result = buildToolbar(opts({ toolbar: ["bold", "fullscreen", "|", "fullscreen"] }));
        expect(result).toEqual([[toggleBoldButton]]);
    });

    it("throws with the offending name when the explicit array references an unknown button", () => {
        expect(() => buildToolbar(opts({ toolbar: ["bogus" as ToolbarButton] }))).toThrow(/bogus/);
    });
});
