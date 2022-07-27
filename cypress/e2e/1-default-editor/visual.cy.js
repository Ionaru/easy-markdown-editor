/// <reference types="cypress" />

describe('Default editor', () => {
    beforeEach(() => {
        cy.visit(__dirname + '/index.html');
    });

    it('loads the editor with default settings', () => {
        cy.get('.EasyMDEContainer').should('be.visible');
        cy.get('#textarea').should('not.be.visible');

        cy.get('.EasyMDEContainer .editor-toolbar').should('be.visible');
        cy.get('.EasyMDEContainer .CodeMirror').should('be.visible');
        cy.get('.EasyMDEContainer .editor-preview').should('not.be.visible');
        cy.get('.EasyMDEContainer .editor-statusbar').should('be.visible');
    });
});
