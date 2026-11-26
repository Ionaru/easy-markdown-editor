/// <reference types="cypress" />

describe('Image upload', () => {
    beforeEach(() => {
        cy.visit(__dirname + '/index.html');
    });

    it('must upload an image only once after a cancelled file selection', () => {
        // The first click opens the file browser and is cancelled: no change event is fired.
        cy.get('button.upload-image').click();

        // The second click selects a file.
        cy.get('button.upload-image').click();
        cy.get('input.imageInput').selectFile({
            contents: Cypress.Buffer.from('image'),
            fileName: 'image.png',
            mimeType: 'image/png',
        }, {force: true});

        cy.window().its('uploadedFiles').should('deep.equal', ['image.png']);
    });
});
