// Create new instance
const editor = new EasyMDE({
    autoDownloadFontAwesome: false,
    element: document.getElementById('mdEditor')!,
    hideIcons: ['side-by-side', 'fullscreen'],
    shortcuts: {
        drawTable: 'Cmd-Alt-T',
        toggleFullScreen: null
    },
    previewClass: 'my-custom-class',
    spellChecker: false,
    onToggleFullScreen: (full: boolean) => {
        console.log('FullscreenToggled', full);
    },
    theme: 'someOtherTheme',
});

// Editor functions
const value = editor.value() as string;
editor.value(value.toUpperCase());

const sbs = editor.isSideBySideActive() as boolean;
const fullscreen = editor.isFullscreenActive() as boolean;

// Access to codemirror object
editor.codemirror.setOption('readOnly', true);

// Static properties
EasyMDE.toggleItalic = (editor: EasyMDE) => {
    console.log('SomeButtonOverride');
};

const editor2 = new EasyMDE({
    autoDownloadFontAwesome: undefined,
    previewClass: ['my-custom-class', 'some-other-class'],
    toolbar: [{
        name: 'bold',
        action: EasyMDE.toggleBold,
        className: 'fa fa-bolt',
        title: 'Bold',
    }, '|', { // Separator
        name: 'alert',
        action: (editor) => {
            alert('This is from a custom button action!');
            // Custom functions have access to the `editor` instance.
        },
        className: 'fa fa-star',
        title: 'A Custom Button',
        noDisable: undefined,
        noMobile: false,
    }, '|', {
        name: 'link',
        action: 'https://github.com/Ionaru/easy-markdown-editor',
        className: 'fa fab fa-github',
        title: 'A Custom Link',
        noDisable: true,
        noMobile: true,
    }]
});

editor2.clearAutosavedValue();
