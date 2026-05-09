import { library } from "@fortawesome/fontawesome-svg-core";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export const registerIcons = (...icons: IconDefinition[]): void => {
    library.add(...icons);
};
