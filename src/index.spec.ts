import { findIconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faAddressBook, faBold } from "@fortawesome/free-solid-svg-icons";
import { describe, expect, it } from "vite-plus/test";

import "./index.js";

describe("module side effects", () => {
    it("registers icons used by the default toolbar", () => {
        expect(findIconDefinition({ prefix: "fas", iconName: faBold.iconName })).toBeDefined();
    });

    it("does not register the entire fas icon set", () => {
        expect(
            findIconDefinition({
                prefix: "fas",
                iconName: faAddressBook.iconName,
            }),
        ).toBeUndefined();
    });
});
