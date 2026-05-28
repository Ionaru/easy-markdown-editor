import { faLink } from "@fortawesome/free-solid-svg-icons";

import type { EasyMDE } from "../../easymde.js";
import { wrapText } from "../../utils/wrap-text.js";
import type { IToolbarButtonOptions } from "../default-toolbar.js";

/** The scheme part of an RFC 3986 URI, e.g. `https`, `ftp`, `mailto`, `myapp+v2`. */
const SCHEME = String.raw`[a-zA-Z][a-zA-Z0-9+.-]*`;
/**
 * Whether `url` already opens with its own scheme — either `scheme://` (http,
 * ftp, …) or a schemeless `scheme:` (mailto, tel, …). The `(?![0-9])` guard
 * stops a bare `host:port` such as `example.com:8080` being read as a scheme.
 */
const URL_HAS_SCHEME = new RegExp(String.raw`^${SCHEME}:(//|(?![0-9]))`);
/** The template's own `scheme://`, dropped when the URL brings one of its own. */
const TEMPLATE_SCHEME = new RegExp(String.raw`${SCHEME}://`);

/**
 * Injects `url` into the template `suffix`'s URL slot — the text between `](`
 * and the closing `)`. When `url` brings its own scheme the template's scheme is
 * dropped so the two are not stacked; when `url` has no scheme the template's is
 * kept, so a bare host gains the template's default protocol (`https://`):
 *
 *   "](https://)" + "example.com"         -> "](https://example.com)"
 *   "](https://)" + "https://example.com" -> "](https://example.com)"
 *   "](https://)" + "mailto:a@b.com"      -> "](mailto:a@b.com)"
 *
 * The scheme is stripped from the template (not from the spliced result), so a
 * user URL that itself contains `://` runs is never mangled. The URL is spliced
 * via a replacer function so `$`-sequences in it (`$&`, `$1`) are not treated as
 * replacement patterns.
 */
export const resolveLinkSuffix = (suffix: string, url: string): string => {
    const template = URL_HAS_SCHEME.test(url) ? suffix.replace(TEMPLATE_SCHEME, "") : suffix;
    return template.replace(")", () => `${url})`);
};

export const drawLink = (editor: EasyMDE): void => {
    const [prefix, suffix] = editor.options.insertTexts.link;
    let finalSuffix = suffix;
    if (editor.options.promptURLs) {
        const url = window.prompt(editor.options.promptTexts.link)?.trim();
        if (!url) return;
        finalSuffix = resolveLinkSuffix(suffix, url);
    }

    // Empty selection → cursor between the brackets to type the link text;
    // wrapping a selection → cursor inside the parens (before the closing `)`)
    // to type/extend the URL.
    const { from, to } = editor.codemirror.state.selection.main;
    const closer = finalSuffix.lastIndexOf(")");
    const cursorFromEnd =
        from === to ? -finalSuffix.length : closer === -1 ? 0 : closer - finalSuffix.length;

    wrapText(editor.codemirror, prefix, finalSuffix, cursorFromEnd);
};

export const drawLinkButton: IToolbarButtonOptions = {
    action: drawLink,
    icon: faLink,
    name: "link",
    title: "Create Link",
};
