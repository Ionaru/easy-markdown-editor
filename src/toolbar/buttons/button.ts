import { ViewUpdate } from '@codemirror/view';

import { EasyMDE } from '../..';
import { IToolbarButtonOptions } from '../default-toolbar';

export class ToolbarButton implements IToolbarButtonOptions {
    public action?: any;
    public active?:
        | boolean
        | ((editor: EasyMDE, update: ViewUpdate) => boolean)
        | ((editor: EasyMDE, update: ViewUpdate) => Promise<boolean>);
    public icon = '';
    public title = '';
    private _name = '';

    public get name() {
        return this._name;
    }
}
