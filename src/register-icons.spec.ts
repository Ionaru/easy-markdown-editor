import { findIconDefinition, library } from "@fortawesome/fontawesome-svg-core";
import { faAddressBook, faAddressCard, faAnchor } from "@fortawesome/free-solid-svg-icons";
import { describe, expect, it, vi } from "vitest";

import { registerIcons } from "./register-icons.js";

describe("registerIcons", () => {
    it("registers a single icon so it is resolvable via library", () => {
        registerIcons(faAddressBook);

        expect(
            findIconDefinition({
                prefix: "fas",
                iconName: faAddressBook.iconName,
            }),
        ).toBeDefined();
    });

    it("accepts multiple icons in one call", () => {
        registerIcons(faAddressCard, faAnchor);

        expect(
            findIconDefinition({
                prefix: "fas",
                iconName: faAddressCard.iconName,
            }),
        ).toBeDefined();
        expect(findIconDefinition({ prefix: "fas", iconName: faAnchor.iconName })).toBeDefined();
    });

    it("is a no-op when called with zero icons", () => {
        const addSpy = vi.spyOn(library, "add");

        registerIcons();

        expect(addSpy).toHaveBeenCalledWith();
        addSpy.mockRestore();
    });
});
