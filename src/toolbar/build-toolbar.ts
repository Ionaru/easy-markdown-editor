import type { Options } from "../options.js";
import { DEFERRED_BUTTON, resolveButton } from "./button-registry.js";
import { defaultToolbar, type IToolbarButtonOptions } from "./default-toolbar.js";

/**
 * Resolve the configured toolbar into the grouped layout the `Toolbar` plugin
 * consumes.
 *
 * - `toolbar: false` → empty layout (no toolbar rendered).
 * - `toolbar: array` → consumer-supplied layout; `hideIcons` and `showIcons`
 *   are ignored. `ToolbarButton` strings resolve via the registry; raw
 *   `IToolbarButtonOptions` objects pass through. The literal `"|"` string
 *   introduces a group boundary (matches the toolbar's separator placement).
 *   Consumers supplying raw `IToolbarButtonOptions` are responsible for
 *   registering their own FontAwesome icons via the exported `registerIcons`
 *   helper.
 * - `toolbar: true | undefined` → start from `defaultToolbar`; remove
 *   `hideIcons` from each group; append any `showIcons` as a single new
 *   trailing group.
 *
 * Empty groups (after filtering or after a deferred name drops out) are
 * dropped so the `Toolbar` constructor never emits orphaned separators.
 */
export const buildToolbar = (options: Options): IToolbarButtonOptions[][] => {
    if (options.toolbar === false) return [];

    if (Array.isArray(options.toolbar)) {
        return groupByPipe(options.toolbar)
            .map((group) => group.flatMap(resolveEntry))
            .filter((group) => group.length > 0);
    }

    const hide = new Set<string>(options.hideIcons ?? []);
    const filtered = defaultToolbar
        .map((group) => group.filter((button) => !hide.has(button.name)))
        .filter((group) => group.length > 0);

    const tail = (options.showIcons ?? []).flatMap(resolveEntry);
    if (tail.length > 0) filtered.push(tail);
    return filtered;
};

const resolveEntry = (entry: string | IToolbarButtonOptions): IToolbarButtonOptions[] => {
    if (typeof entry !== "string") return [entry];
    const resolved = resolveButton(entry);
    return resolved === DEFERRED_BUTTON ? [] : [resolved];
};

const groupByPipe = (
    items: readonly (string | IToolbarButtonOptions)[],
): (string | IToolbarButtonOptions)[][] => {
    const groups: (string | IToolbarButtonOptions)[][] = [];
    let current: (string | IToolbarButtonOptions)[] = [];
    groups.push(current);
    for (const item of items) {
        if (item === "|") {
            current = [];
            groups.push(current);
        } else {
            current.push(item);
        }
    }
    return groups;
};
