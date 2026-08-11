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
const USED_NUMBER = /\[#(\d+)]/g;
const USED_USER = /\[@([\w-]+)]/g;
const DEFINED_NUMBER = /^\[#(\d+)]: (.+)$/;
const DEFINED_USER = /^\[@([\w-]+)]: (.+)$/;
const DEFINED_LABEL = /^\[([^\]]+)]: (.+)$/;

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

/**
 * References the entries use but never define, split by whether a release can
 * still fix them: `pending` are used only under `## [Unreleased]`, where the
 * next release generates their definitions, while `dangling` are used by an
 * already-released section and so will never be generated at all.
 */
export interface RefAudit {
    pending: MissingRefs;
    dangling: MissingRefs;
}

/** Thrown for every recoverable problem so the caller decides how to report it. */
export class ChangelogError extends Error {}

/**
 * The line ending the file mostly uses. Taking the majority rather than the
 * first occurrence keeps one stray CRLF, pasted in from a Windows editor, from
 * rewriting all of the other several hundred lines at release time.
 */
const dominantEol = (raw: string): string => {
    const crlf = raw.split("\r\n").length - 1;
    const lf = raw.split("\n").length - 1 - crlf;
    return crlf > lf ? "\r\n" : "\n";
};

/** Splits into lines without the trailing empty element left by a final newline. */
export const splitLines = (raw: string): { lines: string[]; eol: string } => {
    const lines = raw.split(/\r?\n/);
    if (lines.at(-1) === "") lines.pop();
    return { lines, eol: dominantEol(raw) };
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

/** Whether a line ends the run of definitions that follows an anchor. */
const closesBlock = (line: string | undefined): boolean =>
    line === undefined || line === "" || line.startsWith("<!--");

/**
 * Half-open range of the definition lines belonging to the block starting at
 * `anchorIndex`: everything between the anchor's blank separator and whatever
 * closes the block, which is a blank line, the anchor of the next block, or the
 * end of the file. An empty block yields an empty range rather than running on
 * into the block below it.
 */
export const blockRange = (lines: readonly string[], anchorIndex: number): [number, number] => {
    const start = lines[anchorIndex + 1] === "" ? anchorIndex + 2 : anchorIndex + 1;

    let end = start;
    while (!closesBlock(lines[end])) end += 1;

    return [start, end];
};

interface Refs {
    numbers: Set<number>;
    users: Set<string>;
}

/**
 * Splits lines into the references they define and the ones they merely use. A
 * line is a definition when it matches a definition pattern in full, so a
 * `[#42]:` that happens to fall inside prose still counts as a usage instead of
 * disappearing from both halves.
 */
const collect = (lines: readonly string[]): { used: Refs; defined: Refs } => {
    const used: Refs = { numbers: new Set(), users: new Set() };
    const defined: Refs = { numbers: new Set(), users: new Set() };

    for (const line of lines) {
        const number = DEFINED_NUMBER.exec(line);
        if (number?.[1] !== undefined) {
            defined.numbers.add(Number(number[1]));
            continue;
        }

        const user = DEFINED_USER.exec(line);
        if (user?.[1] !== undefined) {
            defined.users.add(user[1]);
            continue;
        }

        for (const [, value] of line.matchAll(USED_NUMBER)) {
            if (value !== undefined) used.numbers.add(Number(value));
        }
        for (const [, value] of line.matchAll(USED_USER)) {
            if (value !== undefined) used.users.add(value);
        }
    }

    return { used, defined };
};

const undefinedRefs = (used: Refs, defined: Refs, ignore?: MissingRefs): MissingRefs => ({
    numbers: [...used.numbers]
        .filter((number) => !defined.numbers.has(number) && !ignore?.numbers.includes(number))
        .sort((a, b) => a - b),
    users: [...used.users]
        .filter((user) => !defined.users.has(user) && !ignore?.users.includes(user))
        .sort(),
});

/** Reference links used somewhere in `lines` that `lines` never defines. */
export const missingRefs = (lines: readonly string[]): MissingRefs => {
    const { used, defined } = collect(lines);
    return undefinedRefs(used, defined);
};

/** Half-open range covering `## [Unreleased]` and everything under it. */
export const unreleasedRange = (lines: readonly string[]): [number, number] => {
    const start = findAnchor(lines, UNRELEASED_HEADING);
    const next = lines.findIndex((line, index) => index > start && VERSION_HEADING.test(line));

    return [start, next === -1 ? lines.length : next];
};

/**
 * Splits the undefined references by whether the next release will generate
 * them. Definitions are collected from the whole file, since they all live
 * below the released sections, but usages are attributed per section.
 */
export const auditRefs = (lines: readonly string[]): RefAudit => {
    const [start, end] = unreleasedRange(lines);
    const { defined } = collect(lines);

    const { used: unreleased } = collect(lines.slice(start, end));
    const { used: released } = collect([...lines.slice(0, start), ...lines.slice(end)]);

    // A reference used by a released section too is dangling rather than
    // pending: promoting `## [Unreleased]` will not rescue it.
    const dangling = undefinedRefs(released, defined);

    return { pending: undefinedRefs(unreleased, defined, dangling), dangling };
};

/** Version headings, `[Unreleased]` included, that no compare link resolves. */
const missingVersionLinks = (lines: readonly string[]): string[] => {
    const defined = new Set(
        lines.flatMap((line) => {
            const label = DEFINED_LABEL.exec(line)?.[1];
            return label === undefined ? [] : [label];
        }),
    );

    const headings = lines.flatMap((line) => VERSION_HEADING.exec(line)?.[1] ?? []);

    return ["Unreleased", ...headings].filter((version) => !defined.has(version));
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

    const undefinedVersions = missingVersionLinks(lines);
    if (undefinedVersions.length > 0) {
        throw new ChangelogError(
            `has version headings with no compare link: ${undefinedVersions.join(", ")}`,
        );
    }
};

/**
 * Retitles `## [Unreleased]` as the released version and opens a fresh empty
 * `## [Unreleased]` above it. Returns the version it now compares against.
 */
export const promoteUnreleased = (lines: string[], version: string, date: string): string => {
    const [unreleasedIndex, previousIndex] = unreleasedRange(lines);

    const previousVersion = VERSION_HEADING.exec(lines[previousIndex] ?? "")?.[1];
    if (previousVersion === undefined) {
        throw new ChangelogError(
            `has no released version below "${UNRELEASED_HEADING}" to compare against`,
        );
    }
    if (previousVersion === version) {
        throw new ChangelogError(`already has a "${version}" section`);
    }
    if (lines.slice(unreleasedIndex + 1, previousIndex).every((line) => line === "")) {
        throw new ChangelogError(`has no entries under "${UNRELEASED_HEADING}" to release`);
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

/**
 * Appends a definition to a block. A block that was empty has no closing blank
 * line of its own to push down, so one is added and the anchor below it keeps
 * its blank separator.
 */
const appendDefinition = (
    lines: string[],
    [start, end]: [number, number],
    definition: string,
): void => {
    const closingBlank = start === end && lines[end] !== "" ? [""] : [];
    lines.splice(end, 0, definition, ...closingBlank);
};

/** Adds an issue or pull-request definition to its block, kept descending by number. */
export const insertNumberDefinition = (
    lines: string[],
    number: number,
    kind: RefKind,
    repository: Repository,
): void => {
    const definition = `[#${String(number)}]: ${repository.url}/${kind}/${String(number)}`;
    const range = blockRange(
        lines,
        findAnchor(lines, kind === "pull" ? PRS_ANCHOR : ISSUES_ANCHOR),
    );
    const [start, end] = range;

    for (let index = start; index < end; index += 1) {
        const existing = DEFINED_NUMBER.exec(lines[index] ?? "");
        if (existing?.[1] !== undefined && Number(existing[1]) < number) {
            lines.splice(index, 0, definition);
            return;
        }
    }

    appendDefinition(lines, range, definition);
};

/**
 * Adds a contributor definition. That block is in insertion-history order
 * rather than sorted, so new names are appended instead of merged into a sort.
 */
export const insertUserDefinition = (lines: string[], user: string): void => {
    const range = blockRange(lines, findAnchor(lines, USERS_ANCHOR));
    appendDefinition(lines, range, `[@${user}]: https://github.com/${user}`);
};
