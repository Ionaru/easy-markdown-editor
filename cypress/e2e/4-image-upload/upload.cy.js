/// <reference types="cypress" />

describe('Upload', () => {
    beforeEach(() => {
        cy.visit(__dirname + '/index.html');
    });

    it('upload an image should insert a mock image url', () => {
        cy.get('.EasyMDEContainer button.upload-image').click();
        cy.get('.EasyMDEContainer input[type=file]').selectFile({
            contents: Cypress.Buffer.from('', 'utf-8'),
            fileName: 'test.jpg',
            mimeType: 'image/jpeg'
        }, {
            action: 'drag-drop',
            force: true
        });
        cy.get('.EasyMDEContainer .CodeMirror').contains('![test.jpg](https://test.com/test.jpg)');
    });
});
