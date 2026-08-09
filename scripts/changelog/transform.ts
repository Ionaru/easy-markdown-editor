/**
 * Pure `CHANGELOG.md` transformations, kept free of I/O so they can be unit
 * tested. All file, network and process handling lives in
 * `scripts/update-changelog.ts`.
 *
 * The file this operates on is Keep a Changelog with two local conventions:
 * non-standard `### BREAKING CHANGES` / `### Documentation` sections, and four
 * separate reference-definition blocks introduced by HTML comment markers.
 */

export const UNRELEASED_HEADING = "## [Unreleased]";
export const ISSUES_ANCHOR = "<!-- Linked issues -->";
export const PRS_ANCHOR = "<!-- Linked PRs -->";
export const USERS_ANCHOR = "<!-- Linked users -->";
export const VERSIONS_ANCHOR = "<!-- Linked versions -->";

const VERSION_HEADING = /^## \[([^\]]+)] - \d{4}-\d{2}-\d{2}$/;
const USED_NUMBER = /\[#(\d+)](?!:)/g;
const USED_USER = /\[@([\w-]+)](?!:)/g;
const DEFINED_NUMBER = /^\[#(\d+)]: (.+)$/;
const DEFINED_USER = /^\[@([\w-]+)]: (.+)$/;

/** A number is an issue or a pull request; GitHub shares one counter for both. */
export type RefKind = "issues" | "pull";

export interface Repository {
    owner: string;
    name: string;
    url: string;
}

export interface MissingRefs {
    numbers: number[];
    users: string[];
}

/** Thrown for every recoverable problem so the caller decides how to report it. */
export class ChangelogError extends Error {}

/** Splits into lines without the trailing empty element left by a final newline. */
export const splitLines = (raw: string): { lines: string[]; eol: string } => {
    const lines = raw.split(/\r?\n/);
    if (lines.at(-1) === "") lines.pop();
    return { lines, eol: raw.includes("\r\n") ? "\r\n" : "\n" };
};

export const joinLines = (lines: readonly string[], eol: string): string => lines.join(eol) + eol;

/** Derives the GitHub slug from a `repository.url` in any of npm's usual shapes. */
export const parseRepository = (url: string): Repository => {
    const slug = /github\.com[/:]([\w.-]+)\/([\w.-]+?)(?:\.git)?$/.exec(url);
    const owner = slug?.[1];
    const name = slug?.[2];
    if (owner === undefined || name === undefined) {
        throw new ChangelogError(`could not read a GitHub owner/repo out of "${url}"`);
    }
    return { owner, name, url: `https://github.com/${owner}/${name}` };
};

/** Index of the single line equal to `anchor`; throws when absent or duplicated. */
export const findAnchor = (lines: readonly string[], anchor: string): number => {
    const matches = lines.flatMap((line, index) => (line === anchor ? [index] : []));
    const [index] = matches;
    if (index === undefined) throw new ChangelogError(`missing the "${anchor}" marker`);
    if (matches.length > 1) {
        throw new ChangelogError(`has ${String(matches.length)} "${anchor}" markers`);
    }
    return index;
};

/**
 * Half-open range of the definition lines belonging to the block starting at
 * `anchorIndex`, i.e. everything up to the blank line that closes the block.
 */
export const blockRange = (lines: readonly string[], anchorIndex: number): [number, number] => {
    let start = anchorIndex + 1;
    while (lines[start] === "") start += 1;

    let end = start;
    while (end < lines.length && lines[end] !== "") end += 1;

    return [start, end];
};

const collectUsed = (text: string): { numbers: Set<number>; users: Set<string> } => ({
    numbers: new Set([...text.matchAll(USED_NUMBER)].map(([, number]) => Number(number))),
    users: new Set([...text.matchAll(USED_USER)].flatMap(([, user]) => user ?? [])),
});

const collectDefined = (lines: readonly string[]): { numbers: Set<number>; users: Set<string> } => {
    const numbers = new Set<number>();
    const users = new Set<string>();

    for (const line of lines) {
        const number = DEFINED_NUMBER.exec(line);
        if (number?.[1] !== undefined) numbers.add(Number(number[1]));

        const user = DEFINED_USER.exec(line);
        if (user?.[1] !== undefined) users.add(user[1]);
    }

    return { numbers, users };
};

/**
 * Reference links used somewhere in the entries but never defined. A usage
 * (`[#42]`) is distinguished from a definition (`[#42]: …`) by the colon.
 */
export const missingRefs = (lines: readonly string[]): MissingRefs => {
    const used = collectUsed(lines.join("\n"));
    const defined = collectDefined(lines);

    return {
        numbers: [...used.numbers]
            .filter((number) => !defined.numbers.has(number))
            .sort((a, b) => a - b),
        users: [...used.users].filter((user) => !defined.users.has(user)).sort(),
    };
};

/** Throws unless every structural marker this script relies on is present. */
export const validateStructure = (lines: readonly string[]): void => {
    for (const anchor of [
        UNRELEASED_HEADING,
        ISSUES_ANCHOR,
        PRS_ANCHOR,
        USERS_ANCHOR,
        VERSIONS_ANCHOR,
    ]) {
        findAnchor(lines, anchor);
    }
};

/**
 * Retitles `## [Unreleased]` as the released version and opens a fresh empty
 * `## [Unreleased]` above it. Returns the version it now compares against.
 */
export const promoteUnreleased = (lines: string[], version: string, date: string): string => {
    const unreleasedIndex = findAnchor(lines, UNRELEASED_HEADING);

    const previousIndex = lines.findIndex(
        (line, index) => index > unreleasedIndex && VERSION_HEADING.test(line),
    );
    const previousVersion = VERSION_HEADING.exec(lines[previousIndex] ?? "")?.[1];
    if (previousVersion === undefined) {
        throw new ChangelogError(
            `has no released version below "${UNRELEASED_HEADING}" to compare against`,
        );
    }
    if (previousVersion === version) {
        throw new ChangelogError(`already has a "${version}" section`);
    }

    lines.splice(unreleasedIndex, 1, UNRELEASED_HEADING, "", `## [${version}] - ${date}`);
    return previousVersion;
};

/** Repoints the `[Unreleased]` compare link and inserts the released one below it. */
export const updateVersionLinks = (
    lines: string[],
    version: string,
    previousVersion: string,
    repositoryUrl: string,
): void => {
    const [start] = blockRange(lines, findAnchor(lines, VERSIONS_ANCHOR));
    if (!(lines[start] ?? "").startsWith("[Unreleased]: ")) {
        throw new ChangelogError(
            `"${VERSIONS_ANCHOR}" must be followed by the [Unreleased] compare link`,
        );
    }

    lines.splice(
        start,
        1,
        `[Unreleased]: ${repositoryUrl}/compare/${version}...HEAD`,
        `[${version}]: ${repositoryUrl}/compare/${previousVersion}...${version}`,
    );
};

/** Adds an issue or pull-request definition to its block, kept descending by number. */
export const insertNumberDefinition = (
    lines: string[],
    number: number,
    kind: RefKind,
    repository: Repository,
): void => {
    const definition = `[#${String(number)}]: ${repository.url}/${kind}/${String(number)}`;
    const [start, end] = blockRange(
        lines,
        findAnchor(lines, kind === "pull" ? PRS_ANCHOR : ISSUES_ANCHOR),
    );

    for (let index = start; index < end; index += 1) {
        const existing = DEFINED_NUMBER.exec(lines[index] ?? "");
        if (existing?.[1] !== undefined && Number(existing[1]) < number) {
            lines.splice(index, 0, definition);
            return;
        }
    }

    lines.splice(end, 0, definition);
};

/**
 * Adds a contributor definition. That block is in insertion-history order
 * rather than sorted, so new names are appended instead of merged into a sort.
 */
export const insertUserDefinition = (lines: string[], user: string): void => {
    const [, end] = blockRange(lines, findAnchor(lines, USERS_ANCHOR));
    lines.splice(end, 0, `[@${user}]: https://github.com/${user}`);
};
