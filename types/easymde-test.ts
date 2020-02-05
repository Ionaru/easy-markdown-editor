// Create new instance
import EasyMDE = require('./easymde');

const editor = new EasyMDE({
    autoDownloadFontAwesome: false,
    element: document.getElementById('mdEditor')!,
    hideIcons: ['side-by-side', 'fullscreen'],
    inputStyle: 'textarea',
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
    minHeight: '200px'
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
    nativeSpellcheck: true,
    inputStyle: 'contenteditable',
    toolbar: [
        {
            name: 'bold',
            action: EasyMDE.toggleBold,
            className: 'fa fa-bolt',
            title: 'Bold'
        },
        '|',
        {
            // Separator
            name: 'alert',
            action: (editor: EasyMDE) => {
                alert('This is from a custom button action!');
                // Custom functions have access to the `editor` instance.
            },
            className: 'fa fa-star',
            title: 'A Custom Button',
            noDisable: undefined,
            noMobile: false
        },
        '|',
        {
            name: 'link',
            action: 'https://github.com/Ionaru/easy-markdown-editor',
            className: 'fa fab fa-github',
            title: 'A Custom Link',
            noDisable: true,
            noMobile: true
        }
    ]
});

editor2.clearAutosavedValue();

const editorImages = new EasyMDE({
    uploadImage: true,
    imageAccept: 'image/png, image/bmp',
    imageCSRFToken: undefined,
    imageMaxSize: 10485760,
    imageUploadEndpoint: 'https://my.domain/image-upload/',
    imageTexts: {
        sbInit: 'Drag & drop images!',
        sbOnDragEnter: 'Let it go, let it go',
        sbOnDrop: 'Uploading...',
        sbProgress: 'Uploading... (#progress#)',
        sbOnUploaded: 'Upload complete!',
        sizeUnits: 'b,Kb,Mb'
    },
    errorMessages: {
        noFileGiven: 'Please select a file',
        typeNotAllowed: 'This file type is not allowed!',
        fileTooLarge: 'Image too big',
        importError: 'Something went oops!'
    },
    errorCallback: errorMessage => {
        console.error(errorMessage);
    }
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
        sizeUnits: 'b,Kb,Mb'
    },
    errorMessages: {
        noFileGiven: 'Please select a file',
        typeNotAllowed: 'This file type is not allowed!',
        fileTooLarge: 'Image too big',
        importError: 'Something went oops!'
    },
    errorCallback: errorMessage => {
        console.error(errorMessage);
    },
    renderingConfig: {
        codeSyntaxHighlighting: true,
        markedOptions: {
            silent: true,
            highlight(code: string, lang: string, callback?: (error: (any | undefined), code: string) => void): string {
                return 'something'
            },
        },
    },
    promptTexts: {
        image: 'Insert URL'
    },
    syncSideBySidePreviewScroll: true
  });

const editorAutosave = new EasyMDE({
    autosave: {
        enabled: true,
        delay: 2000,
        submit_delay: 10000,
        uniqueId: 'abc',
    }
});
