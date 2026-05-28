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
 *
 * Shared by `drawLink` and `drawImage` — both wrap a selection in
 * `[text](url)` / `![alt](url)` syntax via `wrapText` and need the same
 * URL-injection rules in the suffix.
 */
export const resolveLinkSuffix = (suffix: string, url: string): string => {
    const template = URL_HAS_SCHEME.test(url) ? suffix.replace(TEMPLATE_SCHEME, "") : suffix;
    return template.replace(")", () => `${url})`);
};
