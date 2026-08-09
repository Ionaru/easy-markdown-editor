/**
 * Release-time maintenance for `CHANGELOG.md`.
 *
 * Entries themselves are always written by hand. This script only does the
 * mechanical parts of a release:
 *
 * - Promotes `## [Unreleased]` to `## [<version>] - <date>` and opens a fresh
 *   empty `## [Unreleased]` above it.
 * - Keeps the `<!-- Linked versions -->` compare links in sync.
 * - Generates the `[#123]` and `[@user]` reference definitions used by the
 *   entry text, resolving issue-versus-pull-request through the GitHub API.
 *
 * Run with `--check` for a read-only, network-free validation pass suitable for
 * CI. The transformations themselves live in `changelog/transform.ts`.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import process from "node:process";

import type { RefKind, Repository } from "./changelog/transform.ts";
import {
    ChangelogError,
    insertNumberDefinition,
    insertUserDefinition,
    joinLines,
    missingRefs,
    parseRepository,
    promoteUnreleased,
    splitLines,
    updateVersionLinks,
    validateStructure,
} from "./changelog/transform.ts";

const CHANGELOG_PATH = "CHANGELOG.md";
const PACKAGE_PATH = "package.json";

/** Reads the version to release and the repository the links point at. */
const readPackage = (): { version: string; repository: Repository } => {
    const manifest: unknown = JSON.parse(readFileSync(PACKAGE_PATH, "utf8"));
    if (typeof manifest !== "object" || manifest === null) {
        throw new ChangelogError(`${PACKAGE_PATH} is not an object`);
    }

    const { version, repository } = manifest as {
        version?: unknown;
        repository?: { url?: unknown };
    };
    if (typeof version !== "string") throw new ChangelogError(`${PACKAGE_PATH} has no "version"`);

    const url = repository?.url;
    if (typeof url !== "string")
        throw new ChangelogError(`${PACKAGE_PATH} has no "repository.url"`);

    return { version, repository: parseRepository(url) };
};

const resolveToken = (): string | undefined => {
    const fromEnvironment = process.env["GITHUB_TOKEN"] ?? process.env["GH_TOKEN"];
    if (fromEnvironment !== undefined && fromEnvironment !== "") return fromEnvironment;

    try {
        return execFileSync("gh", ["auth", "token"], {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
        }).trim();
    } catch {
        return undefined;
    }
};

/**
 * GitHub redirects between `/issues/N` and `/pull/N`, so an unreachable or
 * rate-limited API degrades to a working, if less precise, issue link rather
 * than failing the release.
 */
const classify = async (
    number: number,
    repository: Repository,
    token: string | undefined,
): Promise<RefKind> => {
    const headers: Record<string, string> = {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    };
    if (token !== undefined) headers["Authorization"] = `Bearer ${token}`;

    const fallBackToIssue = (reason: string): RefKind => {
        process.stderr.write(
            `update-changelog: warning: could not classify #${String(number)} (${reason}); linking it as an issue\n`,
        );
        return "issues";
    };

    const endpoint = `https://api.github.com/repos/${repository.owner}/${repository.name}/issues/${String(number)}`;
    try {
        const response = await fetch(endpoint, { headers });
        if (!response.ok) return fallBackToIssue(`GitHub API responded ${String(response.status)}`);

        const payload = (await response.json()) as { pull_request?: unknown };
        return payload.pull_request === undefined ? "issues" : "pull";
    } catch (error) {
        // Network failure, or a body that is not JSON.
        return fallBackToIssue(String(error));
    }
};

const check = (lines: readonly string[]): void => {
    validateStructure(lines);

    const missing = missingRefs(lines);
    if (missing.numbers.length > 0 || missing.users.length > 0) {
        const items = [
            ...missing.numbers.map((number) => `[#${String(number)}]`),
            ...missing.users.map((user) => `[@${user}]`),
        ];
        throw new ChangelogError(`uses reference links with no definition: ${items.join(", ")}`);
    }

    process.stdout.write(`${CHANGELOG_PATH} is well-formed\n`);
};

const today = (): string => {
    const now = new Date();
    const pad = (value: number): string => String(value).padStart(2, "0");
    return `${String(now.getFullYear())}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const release = async (lines: string[]): Promise<void> => {
    const { version, repository } = readPackage();

    validateStructure(lines);
    const previousVersion = promoteUnreleased(lines, version, today());
    updateVersionLinks(lines, version, previousVersion, repository.url);

    const missing = missingRefs(lines);
    const token = missing.numbers.length > 0 ? resolveToken() : undefined;

    for (const number of missing.numbers) {
        insertNumberDefinition(
            lines,
            number,
            await classify(number, repository, token),
            repository,
        );
    }
    for (const user of missing.users) {
        insertUserDefinition(lines, user);
    }

    const added = missing.numbers.length + missing.users.length;
    process.stdout.write(
        `${CHANGELOG_PATH}: released ${version} (previous ${previousVersion}), added ${String(added)} reference definition(s)\n`,
    );
};

const main = async (): Promise<void> => {
    const { lines, eol } = splitLines(readFileSync(CHANGELOG_PATH, "utf8"));

    if (process.argv.includes("--check")) {
        check(lines);
        return;
    }

    await release(lines);
    writeFileSync(CHANGELOG_PATH, joinLines(lines, eol));
};

try {
    await main();
} catch (error) {
    const detail =
        error instanceof ChangelogError ? `${CHANGELOG_PATH} ${error.message}` : String(error);
    process.stderr.write(`update-changelog: ${detail}\n`);
    process.exit(1);
}
