import { describe, expect, it } from "vitest";

import { resolveLinkSuffix } from "./resolve-link-suffix.js";

describe("resolveLinkSuffix", () => {
    it("prepends the template scheme to a bare host", () => {
        expect.assertions(1);
        expect(resolveLinkSuffix("](https://)", "example.com")).toBe("](https://example.com)");
    });

    it("de-dupes a https:// scheme the user already typed", () => {
        expect.assertions(1);
        expect(resolveLinkSuffix("](https://)", "https://example.com")).toBe(
            "](https://example.com)",
        );
    });

    it("de-dupes an http:// scheme the user already typed", () => {
        expect.assertions(1);
        expect(resolveLinkSuffix("](https://)", "http://example.com")).toBe(
            "](http://example.com)",
        );
    });

    it("de-dupes a scheme regardless of letter case", () => {
        expect.assertions(1);
        expect(resolveLinkSuffix("](https://)", "HTTPS://example.com")).toBe(
            "](HTTPS://example.com)",
        );
    });

    it("de-dupes a non-http scheme such as ftp://", () => {
        expect.assertions(1);
        expect(resolveLinkSuffix("](https://)", "ftp://files.example.com")).toBe(
            "](ftp://files.example.com)",
        );
    });

    it("de-dupes a custom scheme", () => {
        expect.assertions(1);
        expect(resolveLinkSuffix("](https://)", "myapp+v2://open")).toBe("](myapp+v2://open)");
    });

    it("injects verbatim when the suffix carries no scheme", () => {
        expect.assertions(1);
        expect(resolveLinkSuffix("]()", "example.com")).toBe("](example.com)");
    });

    it("preserves `://` runs inside the user's URL instead of stripping them", () => {
        expect.assertions(1);
        // No template scheme to de-dupe, so the user's own stacked schemes must survive.
        expect(resolveLinkSuffix("]()", "a://b://c")).toBe("](a://b://c)");
    });

    it("keeps the template scheme for a bare host:port (not mistaken for a scheme)", () => {
        expect.assertions(1);
        expect(resolveLinkSuffix("](https://)", "example.com:8080/path")).toBe(
            "](https://example.com:8080/path)",
        );
    });

    it("does not stack https:// onto a schemeless scheme such as mailto:", () => {
        expect.assertions(1);
        expect(resolveLinkSuffix("](https://)", "mailto:hi@example.com")).toBe(
            "](mailto:hi@example.com)",
        );
    });

    it("preserves `$` sequences in the URL instead of treating them as replacement patterns", () => {
        expect.assertions(1);
        expect(resolveLinkSuffix("](https://)", "https://ex.com/a$&b$1")).toBe(
            "](https://ex.com/a$&b$1)",
        );
    });
});
