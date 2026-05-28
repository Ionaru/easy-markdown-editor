import { faQuestion } from "@fortawesome/free-solid-svg-icons";

import type { EasyMDE } from "../../easymde.js";
import type { IToolbarButtonOptions } from "../default-toolbar.js";

export const openGuide = (editor: EasyMDE): void => {
    const url = editor.options.toolbarGuideUrl;
    // Empty URL: no-op. Hide-on-empty is B15 `buildToolbar` territory.
    if (!url) return;
    // `noopener` in windowFeatures = the new window has `window.opener === null`,
    // equivalent to `rel="noopener"` on an anchor. The renderer in `toolbar.ts`
    // produces `<button>`, not `<a>`, so security flows through `window.open` args.
    window.open(url, "_blank", "noopener");
};

export const openGuideButton: IToolbarButtonOptions = {
    action: openGuide,
    icon: faQuestion,
    name: "guide",
    title: "Markdown Guide",
};
