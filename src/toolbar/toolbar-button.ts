import { EasyMDE } from '../easymde';

interface CustomAttributes {
    [key: string]: string;
}

interface ArrayOneOrMore<T> extends Array<T> {
    0: T;
}

interface ToolbarButtonOptions {
    name: string;
    action: string | ((editor: EasyMDE) => void);
    className: string;
    title: string;
    noDisable?: boolean;
    noMobile?: boolean;
    icon?: string;
    attributes?: CustomAttributes | undefined;
}

interface ToolbarDropdownButtonOptions extends ToolbarButtonOptions {
    children: ArrayOneOrMore<ToolbarButtonOptions>;
}

export class ToolbarButton {
    private readonly element = document.createElement('button');

    public constructor(
        private options: ToolbarButtonOptions | ToolbarDropdownButtonOptions,
    ) {
        this.setCustomAttributes();
        this.element.setAttribute('type', 'button');
        // Shortcuts
        // Tooltip
        if (options.noDisable) {
            // Disable on previes
            this.element.classList.add('no-disable');
        }
        if (options.noMobile) {
            // Hide on mobile
            this.element.classList.add('no-mobile');
        }
        this.element.tabIndex = -1;
    }

    private setCustomAttributes(): void {
        const attributes = this.options.attributes || {};
        for (const [key, value] of Object.entries(attributes)) {
            this.element.setAttribute(key, value);
        }
    }
}
