/// <reference types="cypress" />

describe('Default editor', () => {
    it('table', () => {
        cy.visit(__dirname + '/index-no-prefix.html');

        cy.get('button.table').should('be.visible');
        cy.get('button.table').invoke('outerWidth').should('not.equal', 30);
    });

    it('loads the editor with default settings', () => {
        cy.visit(__dirname + '/index.html');

        cy.get('button.mde-table').should('be.visible');
        cy.get('button.mde-table').invoke('outerWidth').should('equal', 30);
    });
});
