# EasyMDE - Editor de Markdown

[![npm version](https://img.shields.io/npm/v/easymde.svg?style=for-the-badge)](https://www.npmjs.com/package/easymde)
[![npm version](https://img.shields.io/npm/v/easymde/next.svg?style=for-the-badge)](https://www.npmjs.com/package/easymde/v/next)
[![Build Status](https://img.shields.io/github/actions/workflow/status/ionaru/easy-markdown-editor/cd.yaml?branch=master&style=for-the-badge)](https://github.com/Ionaru/easy-markdown-editor/actions?query=branch%3Amaster)

> Este repositorio es un fork de
[SimpleMDE, hecho por Sparksuite](https://github.com/sparksuite/simplemde-markdown-editor/).
Vaya a la [sección dedicada](#simplemde-fork) para más información.

Un reemplazo de área de texto de JavaScript para escribir Markdown hermoso y comprensible. EasyMDE permite a los usuarios que pueden tener menos experiencia con Markdown usar botones de la barra de herramientas y atajos familiares.

Además, la sintaxis se renderiza mientras se edita para mostrar claramente el resultado esperado. Los encabezados son más grandes, las palabras enfatizadas están en cursiva, los enlaces están subrayados, etc.

EasyMDE también cuenta con guardado automático y corrección ortográfica integrados. El editor es completamente personalizable, desde temas hasta botones de la barra de herramientas y hooks de JavaScript.

[**Prueba la demo**](https://stackblitz.com/edit/easymde/)

[![Vista previa](https://user-images.githubusercontent.com/3472373/51319377-26fe6e00-1a5d-11e9-8cc6-3137a566796d.png)](https://stackblitz.com/edit/easymde/)

## Acceso rápido

- [EasyMDE - Editor de Markdown](#easymde---editor-de-markdown)
  - [Acceso rápido](#acceso-rápido)
  - [Instalar EasyMDE](#instalar-easymde)
  - [Cómo usar](#cómo-usar)
    - [Cargar el editor](#cargar-el-editor)
    - [Funciones del editor](#funciones-del-editor)
  - [Configuración](#configuración)
    - [Lista de opciones](#lista-de-opciones)
    - [Ejemplo de opciones](#ejemplo-de-opciones)
    - [Iconos de la barra de herramientas](#iconos-de-la-barra-de-herramientas)
    - [Personalización de la barra de herramientas](#personalización-de-la-barra-de-herramientas)
    - [Atajos de teclado](#atajos-de-teclado)
  - [Uso avanzado](#uso-avanzado)
    - [Manejo de eventos](#manejo-de-eventos)
    - [Eliminar EasyMDE del área de texto](#eliminar-easymde-del-área-de-texto)
    - [Métodos útiles](#métodos-útiles)
  - [Cómo funciona](#cómo-funciona)
  - [Fork de SimpleMDE](#fork-de-simplemde)
  - [Modificaciones a EasyMDE](#modificaciones-a-easymde)
  - [Contribuir](#contribuir)
  - [Licencia](#licencia)


## Instalar EasyMDE

A través de [npm](https://www.npmjs.com/package/easymde):

```
npm install easymde
```

A través del CDN de *UNPKG*:

```html
<link rel="stylesheet" href="https://unpkg.com/easymde/dist/easymde.min.css">
<script src="https://unpkg.com/easymde/dist/easymde.min.js"></script>
```

O *jsDelivr*:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/easymde/dist/easymde.min.css">
<script src="https://cdn.jsdelivr.net/npm/easymde/dist/easymde.min.js"></script>
```

## Cómo usar

### Cargar el editor

Después de instalar e importar el módulo, puedes cargar EasyMDE en el primer elemento `textarea` de la página web:

```html
<textarea></textarea>
<script>
const easyMDE = new EasyMDE();
</script>
```

Alternativamente, puedes seleccionar un `textarea` específico mediante JavaScript:

```html
<textarea id="mi-area-texto"></textarea>
<script>
const easyMDE = new EasyMDE({element: document.getElementById('mi-area-texto')});
</script>
```

### Funciones del editor

Usa `easyMDE.value()` para obtener el contenido del editor:

```html
<script>
easyMDE.value();
</script>
```

Usa `easyMDE.value(val)` para establecer el contenido del editor:

```html
<script>
easyMDE.value('Nuevo contenido para **EasyMDE**');
</script>
```

## Configuración

### Lista de opciones

- **autoDownloadFontAwesome**: Si se establece en `true`, descarga automáticamente Font Awesome (usado para iconos). Si se establece en `false`, evita la descarga. Por defecto, es `undefined`, lo que verificará inteligentemente si Font Awesome ya se ha incluido, luego descargará en consecuencia.
- **autofocus**: Si se establece en `true`, enfoca el editor automáticamente. Por defecto es `false`.
- **autosave**: *Guarda el texto que se está escribiendo y lo cargará en el futuro. Olvidará el texto cuando se envíe el formulario en el que está contenido.*
  - **enabled**: Si se establece en `true`, guarda el texto automáticamente. Por defecto es `false`.
  - **delay**: Retraso entre guardados, en milisegundos. Por defecto es `10000` (10 segundos).
  - **submit_delay**: Retraso antes de asumir que el envío del formulario falló y guardar el texto, en milisegundos. Por defecto es `autosave.delay` o `10000` (10 segundos).
  - **uniqueId**: Debes establecer un identificador de cadena único para que EasyMDE pueda guardar automáticamente. Algo que separe esto de otras instancias de EasyMDE en tu sitio web.
  - **timeFormat**: Establece el formato de fecha y hora. Más información en [instancias de DateTimeFormat](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat). Por defecto `locale: en-US, format: hour:minute`.
  - **text**: Establece el texto para guardar automáticamente.
- **autoRefresh**: Útil al inicializar el editor en un nodo DOM oculto. Si se establece en `{ delay: 300 }`, comprobará cada 300 ms si el editor es visible y, si es positivo, llamará a la función [`refresh()` de CodeMirror](https://codemirror.net/doc/manual.html#refresh).
- **blockStyles**: Personaliza cómo ciertos botones que estilizan bloques de texto se comportan.
  - **bold**: Puede establecerse en `**` o `__`. Por defecto es `**`.
  - **code**: Puede establecerse en  ```` ``` ```` o `~~~`.  Por defecto es ```` ``` ````.
  - **italic**: Puede establecerse en `*` o `_`. Por defecto es `*`.
- **unorderedListStyle**: puede ser `*`, `-` o `+`. Por defecto es `*`.
- **scrollbarStyle**: Elige una implementación de barra de desplazamiento. El predeterminado es "native", mostrando barras de desplazamiento nativas. La biblioteca principal también proporciona el estilo "null", que oculta completamente las barras de desplazamiento. Los complementos pueden implementar modelos de barra de desplazamiento adicionales.
- **element**: El elemento DOM para el elemento `textarea` a usar. Por defecto es el primer elemento `textarea` en la página.
- **forceSync**: Si se establece en `true`, fuerza los cambios de texto realizados en EasyMDE a almacenarse inmediatamente en el área de texto original. Por defecto es `false`.
- **hideIcons**: Una matriz de nombres de iconos para ocultar. Puede usarse para ocultar iconos específicos mostrados por defecto sin personalizar completamente la barra de herramientas.
- **indentWithTabs**: Si se establece en `false`, indenta usando espacios en lugar de tabulaciones. Por defecto es `true`.
- **initialValue**: Si se establece, personalizará el valor inicial del editor.
- **previewImagesInEditor**: - EasyMDE mostrará una vista previa de las imágenes, `false` por defecto, la vista previa de las imágenes aparecerá solo para imágenes en líneas separadas.
- **imagesPreviewHandler**: Una función personalizada para manejar la vista previa de imágenes. Toma la cadena analizada entre los paréntesis del markdown de imagen `![]()` como argumento y devuelve una cadena que sirve como el atributo `src` de la etiqueta `<img>` en la vista previa. Permite la vista previa dinámica de imágenes en el frontend sin tener que subirlas a un servidor, permite copiar y pegar imágenes en el editor con vista previa.
- **insertTexts**: Personaliza cómo se comportan ciertos botones que insertan texto. Toma una matriz con dos elementos. El primer elemento será el texto insertado antes del cursor o resaltado, y el segundo elemento se insertará después. Por ejemplo, este es el valor de enlace predeterminado: `["[", "](http://)"]`.
  - reglaHorizontal
  - imagen
  - enlace
  - tabla
- **lineNumbers**: Si se establece en `true`, habilita los números de línea en el editor.
- **lineWrapping**: Si se establece en `false`, deshabilita el ajuste de línea. Por defecto es `true`.
- **minHeight**: Establece la altura mínima para el área de composición, antes de que comience a crecer automáticamente. Debe ser una cadena que contenga un valor CSS válido como `"500px"`. Por defecto es `"300px"`.
- **maxHeight**: Establece una altura fija para el área de composición. La opción `minHeight` se ignorará. Debe ser una cadena que contenga un valor CSS válido como `"500px"`. Por defecto es `undefined`.
- **onToggleFullScreen**: Una función que se llama cuando se activa el modo de pantalla completa del editor. La función recibirá un booleano como parámetro, `true` cuando el editor esté entrando en modo de pantalla completa, o `false`.
- **parsingConfig**: Ajusta la configuración para analizar el Markdown durante la edición (no la vista previa).
  - **allowAtxHeaderWithoutSpace**: Si se establece en `true`, renderizará encabezados sin un espacio después del `#`. Por defecto es `false`.
  - **strikethrough**: Si se establece en `false`, no procesará la sintaxis de tachado de GFM. Por defecto es `true`.
  - **underscoresBreakWords**: Si se establece en `true`, permite que los guiones bajos sean un delimitador para separar palabras. Por defecto es `false`.
- **overlayMode**: Pasa un modo de superposición de CodeMirror personalizado para analizar y dar estilo al Markdown durante la edición.
  - **mode**: Un objeto de modo de CodeMirror.
  - **combine**: Si se establece en `false`, *reemplazará* las clases CSS devueltas por el modo Markdown predeterminado. De lo contrario, las clases devueltas por el modo personalizado se combinarán con las clases devueltas por el modo predeterminado. Por defecto es `true`.
- **placeholder**: Si se establece, muestra un mensaje de marcador de posición personalizado.
- **previewClass**: Una cadena o matriz de cadenas que se aplicarán a la pantalla de vista previa cuando se active. Por defecto es `"editor-preview"`.
- **previewRender**: Función personalizada para analizar el Markdown en texto plano y devolver HTML. Usado cuando el usuario realiza una vista previa.
- **promptURLs**: Si se establece en `true`, aparece una ventana de alerta de JS pidiendo el enlace o URL de la imagen. Por defecto es `false`.
- **promptTexts**: Personaliza el texto utilizado para solicitar URLs.
  - **image**: El texto que se usará al solicitar la URL de una imagen. Por defecto es `URL de la imagen:`.
  - **link**: El texto que se usará al solicitar la URL de un enlace. Por defecto es `URL para el enlace:`.
- **iconClassMap**: Se usa para especificar los nombres de clase de icono para los varios botones de la barra de herramientas.
- **uploadImage**: Si se establece en `true`, habilita la funcionalidad de carga de imágenes, que puede activarse mediante arrastrar y soltar, copiar y pegar y a través de la ventana de exploración de archivos (abierta cuando el usuario hace clic en el icono *upload-image*). Por defecto es `false`.
- **imageMaxSize**: Tamaño máximo de imagen en bytes, verificado antes de cargar (nota: nunca confíes en el cliente, siempre verifica el tamaño de la imagen en el servidor). Por defecto es `1024 * 1024 * 2` (2 MB).
- **imageAccept**: Una lista separada por comas de tipos MIME utilizados para verificar el tipo de imagen antes de cargarla (nota: nunca confíes en el cliente, siempre verifica los tipos de archivo en el servidor). Por defecto es `image/png, image/jpeg`.
- **imageUploadFunction**: Una función personalizada para manejar la carga de imágenes. Usar esta función hará que las opciones `imageMaxSize`, `imageAccept`, `imageUploadEndpoint` e `imageCSRFToken` sean ineficaces.
    - La función recibe un archivo y funciones de callback `onSuccess` y `onError` como parámetros. `onSuccess(imageUrl: string)` y `onError(errorMessage: string)`
- **imageUploadEndpoint**: El endpoint donde se enviarán los datos de las imágenes, a través de una solicitud *POST* asíncrona. Se supone que el servidor guardará esta imagen y devolverá una respuesta JSON.
     - si la solicitud fue procesada exitosamente (HTTP 200 OK): `{"data": {"filePath": "<filePath>"}}` donde *filePath* es la ruta de la imagen (absoluta si `imagePathAbsolute` está establecido en true, relativa si no);
     - de lo contrario: `{"error": "<errorCode>"}`, donde *errorCode* puede ser `noFileGiven` (HTTP 400 Bad Request), `typeNotAllowed` (HTTP 415 Unsupported Media Type), `fileTooLarge` (HTTP 413 Payload Too Large) o `importError` (ver *errorMessages* a continuación). Si *errorCode* no es uno de los *errorMessages*, se alerta sin cambios al usuario. Esto permite mensajes de error del lado del servidor.
     No tiene valor predeterminado.
- **imagePathAbsolute**: Si se establece en `true`, tratará `imageUrl` de `imageUploadFunction` y *filePath* devuelto de `imageUploadEndpoint` como una ruta absoluta en lugar de relativa, es decir, no antepondrá `window.location.origin` a ella.
- **imageCSRFToken**: Token CSRF para incluir con la llamada AJAX para cargar la imagen. Para varias instancias como Django, Spring y Laravel.
- **imageCSRFName**: Nombre del campo CSRF token para incluir con la llamada AJAX para cargar la imagen, aplicado cuando `imageCSRFToken` tiene valor, por defecto es `csrfmiddlewaretoken`.
- **imageCSRFHeader**: Si se establece en `true`, pasa el token CSRF a través del encabezado. Por defecto es `false`, lo que pasa CSRF a través del cuerpo de la solicitud.
- **imageTexts**: Textos mostrados al usuario (principalmente en la barra de estado) para la función de importación de imágenes, donde `#image_name#`, `#image_size#` y `#image_max_size#` serán reemplazados por sus valores respectivos, que pueden usarse para personalización o internacionalización:
    - **sbInit**: Mensaje de estado mostrado inicialmente si `uploadImage` está establecido en `true`. Por defecto es `Attach files by drag and dropping or pasting from clipboard.`.
    - **sbOnDragEnter**: Mensaje de estado mostrado cuando el usuario arrastra un archivo al área de texto. Por defecto es `Drop image to upload it.`.
    - **sbOnDrop**: Mensaje de estado mostrado cuando el usuario suelta un archivo en el área de texto. Por defecto es `Uploading images #images_names#`.
    - **sbProgress**: Mensaje de estado mostrado para mostrar el progreso de carga. Por defecto es `Uploading #file_name#: #progress#%`.
    - **sbOnUploaded**: Mensaje de estado mostrado cuando la imagen ha sido cargada. Por defecto es `Uploaded #image_name#`.
    - **sizeUnits**: Una lista separada por comas de unidades utilizadas para mostrar mensajes con tamaños de archivo legibles para humanos. Por defecto es ` B, KB, MB` (ejemplo: `218 KB`). Puedes usar `B,KB,MB` en su lugar si prefieres sin espacios (`218KB`).
- **errorMessages**: Errores mostrados al usuario, usando la opción `errorCallback`, donde `#image_name#`, `#image_size#` y `#image_max_size#` serán reemplazados por sus valores respectivos, que pueden usarse para personalización o internacionalización:
    - **noFileGiven**: El servidor no recibió ningún archivo del usuario. Por defecto es `You must select a file.`.
    - **typeNotAllowed**: El usuario envió un tipo de archivo que no coincide con la lista `imageAccept`, o el servidor devolvió este código de error. Por defecto es `This image type is not allowed.`.
- **fileTooLarge**: El tamaño de la imagen que se está importando es mayor que el `imageMaxSize`, o si el servidor devolvió este código de error. Por defecto es `Image #image_name# is too big (#image_size#).\nMaximum file size is #image_max_size#.`.
  - **importError**: Ocurrió un error inesperado al cargar la imagen. Por defecto es `Something went wrong when uploading the image #image_name#.`.
- **errorCallback**: Una función de callback utilizada para definir cómo mostrar un mensaje de error. Por defecto es `(errorMessage) => alert(errorMessage)`.
- **renderingConfig**: Ajusta la configuración para analizar el Markdown durante la vista previa (no la edición).
  - **codeSyntaxHighlighting**: Si se establece en `true`, resaltará usando [highlight.js](https://github.com/isagalaev/highlight.js). Por defecto es `false`. Para usar esta función, debes incluir highlight.js en tu página o pasarla usando la opción `hljs`. Por ejemplo, incluye el script y los archivos CSS así:<br>`<script src="https://cdn.jsdelivr.net/highlight.js/latest/highlight.min.js"></script>`<br>`<link rel="stylesheet" href="https://cdn.jsdelivr.net/highlight.js/latest/styles/github.min.css">`
  - **hljs**: Una instancia inyectable de [highlight.js](https://github.com/isagalaev/highlight.js). Si no quieres depender del espacio de nombres global (`window.hljs`), puedes proporcionar una instancia aquí. Por defecto es `undefined`.
  - **markedOptions**: Establece las [opciones](https://marked.js.org/#/USING_ADVANCED.md#options) del renderizador interno de Markdown. Otras opciones de `renderingConfig` tendrán prioridad.
  - **singleLineBreaks**: Si se establece en `false`, desactiva el análisis de saltos de línea simples de [GitHub Flavored Markdown](https://github.github.com/gfm/) (GFM). Por defecto es `true`.
  - **sanitizerFunction**: Función personalizada para sanear la salida HTML del renderizador de Markdown.
- **shortcuts**: Atajos de teclado asociados con esta instancia. Por defecto es la [matriz de atajos](#keyboard-shortcuts).
- **showIcons**: Una matriz de nombres de iconos para mostrar. Puede usarse para mostrar iconos específicos ocultos por defecto sin personalizar completamente la barra de herramientas.
- **spellChecker**: Si se establece en `false`, desactiva el corrector ortográfico. Por defecto es `true`. Opcionalmente, pasa una función compatible con CodeMirrorSpellChecker.
- **inputStyle**: `textarea` o `contenteditable`. Por defecto es `textarea` para escritorio y `contenteditable` para móvil. La opción `contenteditable` es necesaria para habilitar el corrector ortográfico nativo.
- **nativeSpellcheck**: Si se establece en `false`, desactiva el corrector ortográfico nativo. Por defecto es `true`.
- **sideBySideFullscreen**: Si se establece en `false`, permite la edición lado a lado sin entrar en pantalla completa. Por defecto es `true`.
- **status**: Si se establece en `false`, oculta la barra de estado. Por defecto es la matriz de elementos de la barra de estado integrados.
  - Opcionalmente, puedes establecer una matriz de elementos de la barra de estado para incluir, y en qué orden. Incluso puedes definir tus propios elementos de barra de estado personalizados.
- **styleSelectedText**: Si se establece en `false`, elimina la clase `CodeMirror-selectedtext` de las líneas seleccionadas. Por defecto es `true`.
- **syncSideBySidePreviewScroll**: Si se establece en `false`, desactiva la sincronización del desplazamiento en modo lado a lado. Por defecto es `true`.
- **tabSize**: Si se establece, personaliza el tamaño de tabulación. Por defecto es `2`.
- **theme**: Sobrescribe el tema. Por defecto es `easymde`.
- **toolbar**: Si se establece en `false`, oculta la barra de herramientas. Por defecto es la [matriz de iconos](#toolbar-icons).
- **toolbarTips**: Si se establece en `false`, desactiva las sugerencias de los botones de la barra de herramientas. Por defecto es `true`.
- **toolbarButtonClassPrefix**: Agrega un prefijo a las clases de botones de la barra de herramientas cuando se establece. Por ejemplo, un valor de `"mde"` resulta en `"mde-bold"` para el botón de negrita.
- **direction**: `rtl` o `ltr`. Cambia la dirección del texto para admitir idiomas de derecha a izquierda. Por defecto es `ltr`.
\~\~\~

### Ejemplo de opciones

La mayoría de las opciones demuestran el comportamiento no predeterminado:

```js
const editor = new EasyMDE({
    autofocus: true,
    autosave: {
        enabled: true,
        uniqueId: "MiIDUnico",
        delay: 1000,
        submit_delay: 5000,
        timeFormat: {
            locale: 'es-ES',
            format: {
                year: 'numeric',
                month: 'long',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            },
        },
        text: "Guardado automáticamente: "
    },
    blockStyles: {
        bold: "__",
        italic: "_",
    },
    unorderedListStyle: "-",
    element: document.getElementById("MiID"),
    forceSync: true,
    hideIcons: ["guide", "heading"],
    indentWithTabs: false,
    initialValue: "¡Hola mundo!",
    insertTexts: {
        horizontalRule: ["", "\n\n-----\n\n"],
        image: ["![](http://", ")"],
        link: ["[", "](https://)"],
        table: ["", "\n\n| Columna 1 | Columna 2 | Columna 3 |\n| -------- | -------- | -------- |\n| Texto     | Texto      | Texto     |\n\n"],
    },
    lineWrapping: false,
    minHeight: "500px",
    parsingConfig: {
        allowAtxHeaderWithoutSpace: true,
        strikethrough: false,
        underscoresBreakWords: true,
    },
    placeholder: "Escriba aquí...",

    previewClass: "mi-estilo-personalizado",
    previewClass: ["mi-estilo-personalizado", "más-estilo-personalizado"],

    previewRender: (plainText) => customMarkdownParser(plainText), // Devuelve HTML de un analizador personalizado
    previewRender: (plainText, preview) => { // Método asincrónico
        setTimeout(() => {
            preview.innerHTML = customMarkdownParser(plainText);
        }, 250);

        // Si devuelves null, el innerHTML de la vista previa no será
        // sobrescrito. Útil si controlas el contenido del nodo de vista previa mediante
        // diferenciación de vdom.
        // return null;

        return "Cargando...";
    },
    promptURLs: true,
    promptTexts: {
        image: "Solicitud personalizada para URL:",
        link: "Solicitud personalizada para URL:",
    },
    renderingConfig: {
        singleLineBreaks: false,
        codeSyntaxHighlighting: true,
        sanitizerFunction: (renderedHTML) => {
            // Usando DOMPurify y permitiendo solo etiquetas <b>
            return DOMPurify.sanitize(renderedHTML, {ALLOWED_TAGS: ['b']})
        },
    },
    shortcuts: {
        drawTable: "Cmd-Alt-T"
    },
    showIcons: ["code", "table"],
    spellChecker: false,
    status: false,
    status: ["autosave", "lines", "words", "cursor"], // Uso opcional
    status: ["autosave", "lines", "words", "cursor", {
        className: "keystrokes",
        defaultValue: (el) => {
            el.setAttribute('data-keystrokes', 0);
        },
        onUpdate: (el) => {
            const keystrokes = Number(el.getAttribute('data-keystrokes')) + 1;
            el.innerHTML = `${keystrokes} pulsaciones`;
            el.setAttribute('data-keystrokes', keystrokes);
        },
    }], // Otro uso opcional, con un elemento de barra de estado personalizado que cuenta las pulsaciones de teclas
    styleSelectedText: false,
    sideBySideFullscreen: false,
    syncSideBySidePreviewScroll: false,
    tabSize: 4,
    toolbar: false,
    toolbarTips: false,
    toolbarButtonClassPrefix: "mde",
});
```

### Iconos de la barra de herramientas

A continuación se muestran los iconos integrados en la barra de herramientas (solo algunos están habilitados por defecto), los cuales se pueden reorganizar como desees. "Nombre" es el nombre del icono, referenciado en el JavaScript. "Acción" es una función o una URL para abrir. "Clase" es la clase asignada al icono. "Tooltip" es la pequeña descripción que aparece mediante el atributo `title=""`. Ten en cuenta que las pistas de accesos directos se añaden automáticamente y reflejan la acción especificada si tiene una combinación de teclas asignada (es decir, con el valor de `action` establecido en `bold` y el de `tooltip` establecido en `Bold`, el texto final que verá el usuario sería "Bold (Ctrl-B)").

Además, puedes añadir un separador entre cualquier icono añadiendo `"|"` al array de la barra de herramientas.

Nombre | Acción | Tooltip<br>Clase
:--- | :----- | :--------------
bold | toggleBold | Negrita<br>fa fa-bold
italic | toggleItalic | Cursiva<br>fa fa-italic
strikethrough | toggleStrikethrough | Tachado<br>fa fa-strikethrough
heading | toggleHeadingSmaller | Título<br>fa fa-header
heading-smaller | toggleHeadingSmaller | Título más pequeño<br>fa fa-header
heading-bigger | toggleHeadingBigger | Título más grande<br>fa fa-lg fa-header
heading-1 | toggleHeading1 | Título grande<br>fa fa-header header-1
heading-2 | toggleHeading2 | Título medio<br>fa fa-header header-2
heading-3 | toggleHeading3 | Título pequeño<br>fa fa-header header-3
code | toggleCodeBlock | Código<br>fa fa-code
quote | toggleBlockquote | Cita<br>fa fa-quote-left
unordered-list | toggleUnorderedList | Lista genérica<br>fa fa-list-ul
ordered-list | toggleOrderedList | Lista numerada<br>fa fa-list-ol
clean-block | cleanBlock | Limpiar bloque<br>fa fa-eraser
link | drawLink | Crear enlace<br>fa fa-link
image | drawImage | Insertar imagen<br>fa fa-picture-o
upload-image | drawUploadedImage | Abrir ventana de archivos<br>fa fa-image
table | drawTable | Insertar tabla<br>fa fa-table
horizontal-rule | drawHorizontalRule | Insertar línea horizontal<br>fa fa-minus
preview | togglePreview | Alternar vista previa<br>fa fa-eye no-disable
side-by-side | toggleSideBySide | Alternar vista lado a lado<br>fa fa-columns no-disable no-mobile
fullscreen | toggleFullScreen | Alternar pantalla completa<br>fa fa-arrows-alt no-disable no-mobile
guide | [Este enlace](https://www.markdownguide.org/basic-syntax/) | Guía de Markdown<br>fa fa-question-circle
undo | undo | Deshacer<br>fa fa-undo
redo | redo | Rehacer<br>fa fa-redo

### Personalización de la barra de herramientas

Personaliza la barra de herramientas usando la opción `toolbar`.

Solo el orden de los botones existentes:

```js
const easyMDE = new EasyMDE({
    toolbar: ["bold", "italic", "heading", "|", "quote"]
});
```

Toda la información y/o añade tus propios iconos o texto

```js
const easyMDE = new EasyMDE({
    toolbar: [
        {
            name: "bold",
            action: EasyMDE.toggleBold,
            className: "fa fa-bold",
            title: "Negrita",
        },
        "italic", // atajo para botón pre-hecho
        {
            name: "custom",
            action: (editor) => {
                // Añade tu propio código
            },
            className: "fa fa-star",
            text: "Destacado",
            title: "Botón personalizado",
            attributes: { // para atributos personalizados
                id: "custom-id",
                "data-value": "valor personalizado" // Los atributos HTML5 data-* necesitan estar entre comillas (") debido al guion (-) en su nombre.
            }
        },
        "|" // Separador
        // [, ...]
    ]
});
```

Pon algunos botones en un menú desplegable

```js
const easyMDE = new EasyMDE({
    toolbar: [{
                name: "heading",
                action: EasyMDE.toggleHeadingSmaller,
                className: "fa fa-header",
                title: "Títulos",
            },
            "|",
            {
                name: "others",
                className: "fa fa-blind",
                title: "otros botones",
                children: [
                    {
                        name: "image",
                        action: EasyMDE.drawImage,
                        className: "fa fa-picture-o",
                        title: "Imagen",
                    },
                    {
                        name: "quote",
                        action: EasyMDE.toggleBlockquote,
                        className: "fa fa-percent",
                        title: "Cita",
                    },
                    {
                        name: "link",
                        action: EasyMDE.drawLink,
                        className: "fa fa-link",
                        title: "Enlace",
                    }
                ]
            },
        // [, ...]
    ]
});
```

### Atajos de teclado

EasyMDE viene con una serie de atajos de teclado predefinidos, pero se pueden alterar con una opción de configuración. La lista de los predeterminados es la siguiente:

Atajo (Windows / Linux) | Atajo (macOS) | Acción
:--- | :--- | :---
<kbd>Ctrl</kbd>-<kbd>'</kbd> | <kbd>Cmd</kbd>-<kbd>'</kbd> | "toggleBlockquote"
<kbd>Ctrl</kbd>-<kbd>B</kbd> | <kbd>Cmd</kbd>-<kbd>B</kbd> | "toggleBold"
<kbd>Ctrl</kbd>-<kbd>E</kbd> | <kbd>Cmd</kbd>-<kbd>E</kbd> | "cleanBlock"
<kbd>Ctrl</kbd>-<kbd>H</kbd> | <kbd>Cmd</kbd>-<kbd>H</kbd> | "toggleHeadingSmaller"
<kbd>Ctrl</kbd>-<kbd>I</kbd> | <kbd>Cmd</kbd>-<kbd>I</kbd> | "toggleItalic"
<kbd>Ctrl</kbd>-<kbd>K</kbd> | <kbd>Cmd</kbd>-<kbd>K</kbd> | "drawLink"
<kbd>Ctrl</kbd>-<kbd>L</kbd> | <kbd>Cmd</kbd>-<kbd>L</kbd> | "toggleUnorderedList"
<kbd>Ctrl</kbd>-<kbd>P</kbd> | <kbd>Cmd</kbd>-<kbd>P</kbd> | "togglePreview"
<kbd>Ctrl</kbd>-<kbd>Alt</kbd>-<kbd>C</kbd> | <kbd>Cmd</kbd>-<kbd>Alt</kbd>-<kbd>C</kbd> | "toggleCodeBlock"
<kbd>Ctrl</kbd>-<kbd>Alt</kbd>-<kbd>I</kbd> | <kbd>Cmd</kbd>-<kbd>Alt</kbd>-<kbd>I</kbd> | "drawImage"
<kbd>Ctrl</kbd>-<kbd>Alt</kbd>-<kbd>L</kbd> | <kbd>Cmd</kbd>-<kbd>Alt</kbd>-<kbd>L</kbd> | "toggleOrderedList"
<kbd>Shift</kbd>-<kbd>Ctrl</kbd>-<kbd>H</kbd> | <kbd>Shift</kbd>-<kbd>Cmd</kbd>-<kbd>H</kbd> | "toggleHeadingBigger"
<kbd>F9</kbd> | <kbd>F9</kbd> | "toggleSideBySide"
<kbd>F11</kbd> | <kbd>F11</kbd> | "toggleFullScreen"
<kbd>Ctrl</kbd>-<kbd>Alt</kbd>-<kbd>1</kbd> | <kbd>Cmd</kbd>-<kbd>Alt</kbd>-<kbd>1</kbd> | "toggleHeading1"
<kbd>Ctrl</kbd>-<kbd>Alt</kbd>-<kbd>2</kbd> | <kbd>Cmd</kbd>-<kbd>Alt</kbd>-<kbd>2</kbd> | "toggleHeading2"
<kbd>Ctrl</kbd>-<kbd>Alt</kbd>-<kbd>3</kbd> | <kbd>Cmd</kbd>-<kbd>Alt</kbd>-<kbd>3</kbd> | "toggleHeading3"
<kbd>Ctrl</kbd>-<kbd>Alt</kbd>-<kbd>4</kbd> | <kbd>Cmd</kbd>-<kbd>Alt</kbd>-<kbd>4</kbd> | "toggleHeading4"
<kbd>Ctrl</kbd>-<kbd>Alt</kbd>-<kbd>5</kbd> | <kbd>Cmd</kbd>-<kbd>Alt</kbd>-<kbd>5</kbd> | "toggleHeading5"
<kbd>Ctrl</kbd>-<kbd>Alt</kbd>-<kbd>6</kbd> | <kbd>Cmd</kbd>-<kbd>Alt</kbd>-<kbd>6</kbd> | "toggleHeading6"

Aquí te mostramos cómo puedes cambiar algunos, mientras dejas otros sin tocar:

```js
const editor = new EasyMDE({
    shortcuts: {
        "toggleOrderedList": "Ctrl-Alt-K", // altera el atajo para toggleOrderedList
        "toggleCodeBlock": null, // desasignar Ctrl-Alt-C
        "drawTable": "Cmd-Alt-T", // asignar Cmd-Alt-T a la acción drawTable, que no tiene un atajo predeterminado
    }
});
```

Los atajos se convierten automáticamente entre plataformas. Si defines un atajo como "Cmd-B", en PC ese atajo se cambiará a "Ctrl-B". Por el contrario, un atajo definido como "Ctrl-B" se convertirá en "Cmd-B" para usuarios de Mac.

La lista de acciones que se pueden vincular es la misma que la lista de acciones integradas disponibles para [botones de la barra de herramientas](#toolbar-icons).

## Uso avanzado

### Manejo de eventos

Puedes capturar la siguiente lista de eventos: https://codemirror.net/doc/manual.html#events

```js
const easyMDE = new EasyMDE();
easyMDE.codemirror.on("change", () => {
    console.log(easyMDE.value());
});
```

### Eliminar EasyMDE del área de texto

Puedes revertir al área de texto inicial llamando al método `toTextArea`. Ten en cuenta que esto borra el guardado automático (si está habilitado) asociado a él. El área de texto conservará cualquier texto de la instancia EasyMDE destruida.

```js
const easyMDE = new EasyMDE();
// ...
easyMDE.toTextArea();
easyMDE = null;
```

Si necesitas eliminar los event listeners registrados (cuando el editor ya no es necesario), llama a `easyMDE.cleanup()`.

### Métodos útiles

Los siguientes métodos autoexplicativos pueden ser de utilidad mientras desarrollas con EasyMDE.

```js
const easyMDE = new EasyMDE();
easyMDE.isPreviewActive(); // devuelve booleano
easyMDE.isSideBySideActive(); // devuelve booleano
easyMDE.isFullscreenActive(); // devuelve booleano
easyMDE.clearAutosavedValue(); // sin valor devuelto
```

## Cómo funciona

EasyMDE es una continuación de SimpleMDE.

SimpleMDE comenzó como una mejora del proyecto [Editor de lepture](https://github.com/lepture/editor), pero ahora ha tomado una identidad propia. Está empaquetado con [CodeMirror](https://github.com/codemirror/codemirror) y depende de [Font Awesome](http://fontawesome.io).

CodeMirror es la columna vertebral del proyecto y analiza gran parte de la sintaxis Markdown mientras se escribe. Esto nos permite añadir estilos al Markdown que se está escribiendo. Además, se ha añadido una barra de herramientas y una barra de estado en la parte superior e inferior, respectivamente. Las vistas previas se renderizan por [Marked](https://github.com/chjj/marked) usando Markdown con sabor a GitHub (GFM).

## Bifurcación de SimpleMDE

Originalmente hice este fork para implementar la compatibilidad con FontAwesome 5 en SimpleMDE. Cuando se completó, envié un [pull request](https://github.com/sparksuite/simplemde-markdown-editor/pull/666), que aún no ha sido aceptado. Esto, y el hecho de que el proyecto haya estado inactivo desde mayo de 2017, me llevó a hacer más cambios y tratar de darle nueva vida al proyecto.

Los cambios incluyen:
* Compatibilidad con FontAwesome 5
* El botón de guía funciona cuando el editor está en modo de vista previa
* Los enlaces ahora son `https://` por defecto
* Pequeños cambios de estilo
* Soporte para Node 8 y versiones posteriores
* Mucho código refactorizado
* Los enlaces en la vista previa se abrirán en una nueva pestaña por defecto
* Soporte para TypeScript

Mi intención es continuar el desarrollo de este proyecto, mejorarlo y mantenerlo vivo.

## Hackeando EasyMDE

Es posible que desees editar esta biblioteca para adaptar su comportamiento a tus necesidades. Esto se puede hacer en algunos pasos rápidos:

1. Sigue las [prerrequisitos](./CONTRIBUTING.md#prerequisites) y las instrucciones de [instalación](./CONTRIBUTING.md#installation) en la guía de contribución;
2. Haz tus cambios;
3. Ejecuta el comando `gulp`, que generará los archivos: `dist/easymde.min.css` y `dist/easymde.min.js`;
4. Copia y pega esos archivos en tu base de código, y listo.

## Contribuyendo

¿Quieres contribuir a EasyMDE? ¡Gracias! Tenemos una [guía de contribución](./CONTRIBUTING.md) solo para ti.

## Licencia

Este proyecto se publica bajo la [Licencia MIT](./LICENSE).

- derechos de autor (c) 2015 Sparksuite, Inc.
- derechos de autor (c) 2017 Jeroen Akkerman.
