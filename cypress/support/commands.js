/// <reference types="cypress" />

const unquote = (str) => str.replace(/(^")|("$)/g, '');

Cypress.Commands.add(
    'before',
    {
        prevSubject: 'element',
    },
    (element, property) => {
        const win = element[0].ownerDocument.defaultView;
        const before = win.getComputedStyle(element[0], 'before');
        return unquote(before.getPropertyValue(property));
    },
);

Cypress.Commands.add('previewOn' , () => {
    cy.get('.EasyMDEContainer .editor-preview').should('not.be.visible');
    cy.get('.EasyMDEContainer .editor-toolbar button.preview').should('not.have.class', 'active');
    cy.get('.EasyMDEContainer .editor-toolbar button.preview').click();
    cy.get('.EasyMDEContainer .editor-toolbar button.preview').should('have.class', 'active');
    cy.get('.EasyMDEContainer .editor-preview').should('be.visible');
});

Cypress.Commands.add('previewOff' , () => {
    cy.get('.EasyMDEContainer .editor-preview').should('be.visible');
    cy.get('.EasyMDEContainer .editor-toolbar button.preview').should('have.class', 'active');
    cy.get('.EasyMDEContainer .editor-toolbar button.preview').click();
    cy.get('.EasyMDEContainer .editor-toolbar button.preview').should('not.have.class', 'active');
    cy.get('.EasyMDEContainer .editor-preview').should('not.be.visible');
});
