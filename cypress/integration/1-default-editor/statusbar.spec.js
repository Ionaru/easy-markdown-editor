/// <reference types="cypress" />

describe('Default statusbar', () => {
    beforeEach(() => {
        cy.visit(__dirname + '/index.html');
    });

    it('loads the editor with default statusbar', () => {
        cy.get('.EasyMDEContainer').should('be.visible');
        cy.get('.EasyMDEContainer .editor-statusbar').should('be.visible');

        cy.get('.EasyMDEContainer .editor-statusbar .autosave').should('be.empty');

        cy.get('.EasyMDEContainer .editor-statusbar .lines').before('content').should('contain', 'lines: ');
        cy.get('.EasyMDEContainer .editor-statusbar .lines').should('contain', '1');

        cy.get('.EasyMDEContainer .editor-statusbar .words').before('content').should('contain', 'words: ');
        cy.get('.EasyMDEContainer .editor-statusbar .words').should('contain', '0');

        cy.get('.EasyMDEContainer .editor-statusbar .cursor').should('contain', '1:1');
    });

    it('updates the statusbar when typing', () => {
        cy.get('.EasyMDEContainer').should('be.visible');
        cy.get('.EasyMDEContainer .editor-statusbar').should('be.visible');

        cy.get('.EasyMDEContainer .CodeMirror').type('Hello');

        cy.get('.EasyMDEContainer .editor-statusbar .autosave').should('be.empty');

        cy.get('.EasyMDEContainer .editor-statusbar .lines').should('contain', '1');
        cy.get('.EasyMDEContainer .editor-statusbar .words').should('contain', '1');
        cy.get('.EasyMDEContainer .editor-statusbar .cursor').should('contain', '1:6');

        cy.get('.EasyMDEContainer .CodeMirror').type(' World');

        cy.get('.EasyMDEContainer .editor-statusbar .lines').should('contain', '1');
        cy.get('.EasyMDEContainer .editor-statusbar .words').should('contain', '2');
        cy.get('.EasyMDEContainer .editor-statusbar .cursor').should('contain', '1:12');

        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');

        cy.get('.EasyMDEContainer .editor-statusbar .lines').should('contain', '2');
        cy.get('.EasyMDEContainer .editor-statusbar .words').should('contain', '2');
        cy.get('.EasyMDEContainer .editor-statusbar .cursor').should('contain', '2:1');

        cy.get('.EasyMDEContainer .CodeMirror').type('This is a sample text.{enter}We\'re testing the statusbar.{enter}Did it work?');

        cy.get('.EasyMDEContainer .editor-statusbar .autosave').should('be.empty');
        cy.get('.EasyMDEContainer .editor-statusbar .lines').before('content').should('contain', 'lines: ');
        cy.get('.EasyMDEContainer .editor-statusbar .lines').should('contain', '4');
        cy.get('.EasyMDEContainer .editor-statusbar .words').before('content').should('contain', 'words: ');
        cy.get('.EasyMDEContainer .editor-statusbar .words').should('contain', '15');
        cy.get('.EasyMDEContainer .editor-statusbar .cursor').should('contain', '4:13');
    });
});
