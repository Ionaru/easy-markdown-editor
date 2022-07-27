/// <reference types="cypress" />

describe('Preview', () => {
    beforeEach(() => {
        cy.visit(__dirname + '/index.html');
    });

    it('can show a preview of markdown text', () => {
        cy.get('.EasyMDEContainer').should('be.visible');
        cy.get('.EasyMDEContainer .editor-preview').should('not.be.visible');

        // Enter markdown text.
        cy.get('.EasyMDEContainer .CodeMirror').type('# My Big Title');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('This is some **important** text!');

        cy.get('.EasyMDEContainer .CodeMirror-line').should('contain', '# My Big Title');
        cy.get('.EasyMDEContainer .cm-header.cm-header-1').should('contain', '#');
        cy.get('.EasyMDEContainer .cm-header.cm-header-1').should('contain', 'My Big Title');

        cy.get('.EasyMDEContainer .CodeMirror-line').should('contain', 'This is some **important** text!');
        cy.get('.EasyMDEContainer .cm-strong').should('contain', '**');
        cy.get('.EasyMDEContainer .cm-strong').should('contain', 'important');

        cy.previewOn();

        // Check preview window for rendered markdown.
        cy.get('.EasyMDEContainer .editor-preview').should('contain.html', '<h1 id="my-big-title">My Big Title</h1>');
        cy.get('.EasyMDEContainer .editor-preview').should('contain.html', '<p>This is some <strong>important</strong> text!</p>');
    });
});
