/// <reference types="cypress" />

describe('Marked options', () => {
    beforeEach(() => {
        cy.visit(__dirname + '/index.html');
    });

    it('must apply the markedOptions to the markdown parser', () => {
        cy.get('.EasyMDEContainer').should('be.visible');
        cy.get('#textarea').should('not.be.visible');

        cy.get('.EasyMDEContainer .CodeMirror').type('# Title{enter}');

        cy.previewOn();

        cy.get('.EasyMDEContainer .editor-preview').should('contain.html', '<h1 id="header-prefix-title">Title</h1>');
    });
});
