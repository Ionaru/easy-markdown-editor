/// <reference types="cypress" />

describe('Image rendering', () => {

    const imageUrl = 'https://picsum.photos/id/237/150';

    beforeEach(() => {
        cy.visit(__dirname + '/index.html');
        cy.intercept('GET', imageUrl).as('image');
    });

    it('must render an image inside the editor', () => {
        cy.get('.EasyMDEContainer').should('be.visible');
        cy.get('#textarea').should('not.be.visible');

        cy.get('.EasyMDEContainer .CodeMirror').type(imageUrl);
        cy.get('.EasyMDEContainer .CodeMirror').type('{home}![Dog!]({end})');

        cy.wait('@image');

        cy.get(`.EasyMDEContainer [data-img-src="${imageUrl}"]`).should('be.visible');

        cy.previewOn();

        cy.get('.EasyMDEContainer .editor-preview').should('contain.html', `<p><img src="${imageUrl}" alt="Dog!"></p>`);
    });

    it('must be able to handle parentheses inside image alt text', () => {
        cy.get('.EasyMDEContainer').should('be.visible');
        cy.get('#textarea').should('not.be.visible');

        cy.get('.EasyMDEContainer .CodeMirror').type(imageUrl);
        cy.get('.EasyMDEContainer .CodeMirror').type('{home}![Dog! (He\'s a good boy!)]({end})');

        cy.wait('@image');

        cy.get(`.EasyMDEContainer [data-img-src="${imageUrl}"]`).should('be.visible');

        cy.previewOn();

        cy.get('.EasyMDEContainer .editor-preview').should('contain.html', `<p><img src="${imageUrl}" alt="Dog! (He's a good boy!)"></p>`);
    });
});
