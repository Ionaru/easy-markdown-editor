// Create new instance
import EasyMDE = require('./easymde');

const editor = new EasyMDE({
    autoDownloadFontAwesome: false,
    element: document.getElementById('mdEditor')!,
    hideIcons: ['side-by-side', 'fullscreen'],
    inputStyle: 'textarea',
    shortcuts: {
        drawTable: 'Cmd-Alt-T',
        toggleFullScreen: null,
    },
    previewClass: 'my-custom-class',
    spellChecker: false,
    onToggleFullScreen: (full: boolean) => {
        console.log('FullscreenToggled', full);
    },
    theme: 'someOtherTheme',
    minHeight: '200px',
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

console.log(editor.options.blockStyles.bold);
console.log(editor.options.insertTexts.horizontalRule[0]);
console.log(editor.options.minHeight);
console.log(editor.options.parsingConfig.allowAtxHeaderWithoutSpace);
console.log(editor.options.previewClass);
console.log(editor.options.previewRender('Hello', document.body));
console.log(editor.options.shortcuts.cleanBlock);
console.log(editor.options.status);
console.log(editor.options.toolbar);

console.log(editor.options.uploadImage);
console.log(editor.options.imageMaxSize);
console.log(editor.options.imageAccept);
console.log(editor.options.imagePathAbsolute);
console.log(editor.options.imageCSRFName);
console.log(editor.options.imageCSRFHeader);
console.log(editor.options.imageTexts.sbInit);
console.log(editor.options.errorMessages.fileTooLarge);
console.log(editor.options.errorCallback('Something went oops!'));

console.log(editor.options.promptTexts.image);

console.log(editor.options.direction);

const editor2 = new EasyMDE({
    autoDownloadFontAwesome: undefined,
    previewClass: ['my-custom-class', 'some-other-class'],
    nativeSpellcheck: true,
    unorderedListStyle: '-',
    inputStyle: 'contenteditable',
    toolbar: [
        {
            name: 'bold',
            action: EasyMDE.toggleBold,
            className: 'fa fas fa-bolt',
            title: 'Bold',
        },
        '|',
        'undo',
        {
            name: 'alert',
            action: (editor: EasyMDE) => {
                alert('This is from a custom button action!');
                // Custom functions have access to the `editor` instance.
            },
            className: 'fa fas fa-star',
            title: 'A Custom Button',
            noDisable: undefined,
            noMobile: false,
            attributes: {
                'data-custom': 'attribute',
            }
        },
        '|',
        {
            name: 'link',
            action: 'https://github.com/Ionaru/easy-markdown-editor',
            className: 'fa fab fa-github',
            title: 'A Custom Link',
            noDisable: true,
            noMobile: true,
        },
        'preview',
        {
            name: 'links',
            className: 'fa fas fa-arrow-down',
            title: 'A Custom Link',
            children: [
                {
                    name: 'link',
                    action: 'https://github.com/Ionaru/easy-markdown-editor',
                    className: 'fa fab fa-github',
                    title: 'A Custom Link',
                    noDisable: true,
                    noMobile: true,
                },
                'preview',
                {
                    name: 'bold',
                    action: EasyMDE.toggleBold,
                    className: 'fa fas fa-bold',
                    title: 'Bold',
                    attributes: {
                        'data-custom': 'some value',
                        'data-custom-2': 'another value',
                    }
                },
            ],
        },
    ],
});

editor2.clearAutosavedValue();
editor2.updateStatusBar('upload-image', 'Drag & drop images!');

EasyMDE.togglePreview(editor2);
EasyMDE.toggleSideBySide(editor2);

const editorImages = new EasyMDE({
    uploadImage: true,
    previewImagesInEditor: false,
    imageAccept: 'image/png, image/bmp',
    imageCSRFToken: undefined,
    unorderedListStyle: '+',
    imageMaxSize: 10485760,
    imageUploadEndpoint: 'https://my.domain/image-upload/',
    imageTexts: {
        sbInit: 'Drag & drop images!',
        sbOnDragEnter: 'Let it go, let it go',
        sbOnDrop: 'Uploading...',
        sbProgress: 'Uploading... (#progress#)',
        sbOnUploaded: 'Upload complete!',
        sizeUnits: 'b,Kb,Mb',
    },
    errorMessages: {
        noFileGiven: 'Please select a file',
        typeNotAllowed: 'This file type is not allowed!',
        fileTooLarge: 'Image too big',
        importError: 'Something went oops!',
    },
    errorCallback: errorMessage => {
        console.error(errorMessage);
    },
});

const editorImagesCustom = new EasyMDE({
    uploadImage: true,
    imageAccept: 'image/png, image/bmp',
    imageCSRFToken: undefined,
    imageMaxSize: 10485760,
    imageUploadFunction: (file: File, onSuccess, onError) => {
        console.log(file);
        onSuccess('http://image.url/9.png');
        onError('Failed because reasons.');
    },
    imageTexts: {
        sbInit: 'Drag & drop images!',
        sbOnDragEnter: 'Let it go, let it go',
        sbOnDrop: 'Uploading...',
        sbProgress: 'Uploading... (#progress#)',
        sbOnUploaded: 'Upload complete!',
        sizeUnits: 'b,Kb,Mb',
    },
    errorMessages: {
        noFileGiven: 'Please select a file',
        typeNotAllowed: 'This file type is not allowed!',
        fileTooLarge: 'Image too big',
        importError: 'Something went oops!',
    },
    errorCallback: errorMessage => {
        console.error(errorMessage);
    },
    renderingConfig: {
        codeSyntaxHighlighting: true,
        markedOptions: {
            silent: true,
            highlight(code: string, lang: string, callback?: (error: (any | undefined), code: string) => void): string {
                return 'something';
            },
        },
    },
    promptTexts: {
        image: 'Insert URL',
    },
    syncSideBySidePreviewScroll: true,
});

new EasyMDE({
    toolbarButtonClassPrefix: 'mde',
    sideBySideFullscreen: true,
    lineNumbers: false,
    unorderedListStyle: '*',
    autosave: {
        enabled: true,
        delay: 2000,
        submit_delay: 10000,
        uniqueId: 'abc',
        timeFormat: {
            locale: 'en-GB',
            format: {
                month: 'long',
            },
        },
        text: 'Stored: ',
    },
});

new EasyMDE({
    sideBySideFullscreen: false,
    lineNumbers: true,
    maxHeight: '500px',
    toolbar: [
        'bold',
        'italic',
        'heading',
        '|',
        'quote',
        'unordered-list',
        'ordered-list',
        'table',
        'upload-image',
        '|',
        'link',
    ],
});

new EasyMDE({
    direction: 'ltr',
});

new EasyMDE({
    direction: 'rtl',
});

new EasyMDE({
    previewRender: (plainText: string) => {
        return '<pre>' + plainText + '</pre>';
    }
});

new EasyMDE({
    previewRender: (plainText: string, preview) => {
        preview.innerHTML = '<pre>' + plainText + '</pre>';
        return null;
    }
});
