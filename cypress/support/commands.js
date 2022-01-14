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
