/// <reference types="cypress" />

describe('URL prompts', () => {
    beforeEach(() => {
        cy.visit(__dirname + '/index.html');
    });

    it('must show the correct text for a link prompt', () => {
        cy.get('.EasyMDEContainer').should('be.visible');
        cy.get('#textarea').should('not.be.visible');

        cy.window().then(($win) => {
            const stub = cy.stub($win, 'prompt');
            cy.get('button.link').click().then(() => {
                expect(stub).to.be.calledWith('URL for the link:', 'https://');
            });
        });
    });

    it('must show the correct text for an image prompt', () => {
        cy.get('.EasyMDEContainer').should('be.visible');
        cy.get('#textarea').should('not.be.visible');

        cy.window().then(($win) => {
            const stub = cy.stub($win, 'prompt');
            cy.get('button.image').click().then(() => {
                expect(stub).to.be.calledWith('URL of the image:', 'https://');
            });
        });
    });

    it('must enter a link correctly through a prompt', () => {
        cy.get('.EasyMDEContainer').should('be.visible');
        cy.get('#textarea').should('not.be.visible');

        cy.window().then(($win) => {
            cy.stub($win, 'prompt').returns('https://example.com');
            cy.get('button.link').click();
        });
        cy.get('.EasyMDEContainer .CodeMirror').contains('[](https://example.com)');
        cy.get('.EasyMDEContainer .CodeMirror').type('{home}{rightarrow}Link to a website!');

        cy.previewOn();

        cy.get('.EasyMDEContainer .editor-preview').should('contain.html', '<p><a href="https://example.com" target="_blank">Link to a website!</a></p>');
    });

    it('can use the prompt multiple times', () => {
        cy.get('.EasyMDEContainer').should('be.visible');
        cy.get('#textarea').should('not.be.visible');

        cy.window().then(($win) => {
            const stub = cy.stub($win, 'prompt');
            stub.returns('https://example.com');
            cy.get('button.link').click().then(() => {
                expect(stub).to.be.calledWith('URL for the link:', 'https://');
                stub.restore();
            });
        });
        cy.get('.EasyMDEContainer .CodeMirror').contains('[](https://example.com)');
        cy.get('.EasyMDEContainer .CodeMirror').type('{home}{rightarrow}Link to a website!{end}{enter}');

        cy.window().then(($win) => {
            const stub = cy.stub($win, 'prompt');
            stub.returns('https://example.eu');
            cy.get('button.link').click().then(() => {
                expect(stub).to.be.calledWith('URL for the link:', 'https://');
                stub.restore();
            });
        });
        cy.get('.EasyMDEContainer .CodeMirror').contains('[](https://example.eu)');
        cy.get('.EasyMDEContainer .CodeMirror').type('{home}{rightarrow}Link to a second website!');

        cy.get('.EasyMDEContainer .CodeMirror').contains('[Link to a website!](https://example.com)');
        cy.get('.EasyMDEContainer .CodeMirror').contains('[Link to a second website!](https://example.eu)');

        cy.previewOn();

        cy.get('.EasyMDEContainer .editor-preview').should(
            'contain.html',
            '<p><a href="https://example.com" target="_blank">Link to a website!</a><br><a href="https://example.eu" target="_blank">Link to a second website!</a></p>',
        );
    });

    it('must be able to deal with parameters in links', () => {
        cy.get('.EasyMDEContainer').should('be.visible');
        cy.get('#textarea').should('not.be.visible');

        cy.window().then(($win) => {
            cy.stub($win, 'prompt').returns('https://example.com?some=param&moo=cow');
            cy.get('button.link').click();
        });
        cy.get('.EasyMDEContainer .CodeMirror').contains('[](https://example.com?some=param&moo=cow)');
        cy.get('.EasyMDEContainer .CodeMirror').type('{home}{rightarrow}Link to a website!');

        cy.previewOn();

        cy.get('.EasyMDEContainer .editor-preview').should('contain.html', '<p><a href="https://example.com?some=param&amp;moo=cow" target="_blank">Link to a website!</a></p>');
    });

    it('must be able to deal with brackets in links', () => {
        cy.get('.EasyMDEContainer').should('be.visible');
        cy.get('#textarea').should('not.be.visible');

        cy.window().then(($win) => {
            cy.stub($win, 'prompt').returns('https://example.com?some=[]param');
            cy.get('button.link').click();
        });
        cy.get('.EasyMDEContainer .CodeMirror').contains('[](https://example.com?some=%5B%5Dparam)');
        cy.get('.EasyMDEContainer .CodeMirror').type('{home}{rightarrow}Link to a website!');

        cy.previewOn();

        cy.get('.EasyMDEContainer .editor-preview').should('contain.html', '<p><a href="https://example.com?some=%5B%5Dparam" target="_blank">Link to a website!</a></p>');
    });

    it('must be able to deal with parentheses in links', () => {
        cy.get('.EasyMDEContainer').should('be.visible');
        cy.get('#textarea').should('not.be.visible');

        cy.window().then(($win) => {
            cy.stub($win, 'prompt').returns('https://example.com?some=(param)');
            cy.get('button.link').click();
        });
        cy.get('.EasyMDEContainer .CodeMirror').contains('[](https://example.com?some=\\(param\\))');
        cy.get('.EasyMDEContainer .CodeMirror').type('{home}{rightarrow}Link to a website!');

        cy.previewOn();

        cy.get('.EasyMDEContainer .editor-preview').should('contain.html', '<p><a href="https://example.com?some=(param)" target="_blank">Link to a website!</a></p>');
    });

    it('must be able to deal with parentheses in links (multiple)', () => {
        cy.get('.EasyMDEContainer').should('be.visible');
        cy.get('#textarea').should('not.be.visible');

        cy.window().then(($win) => {
            cy.stub($win, 'prompt').returns('https://example.com?some=(param1,param2)&more=(param3,param4)&end=true');
            cy.get('button.link').click();
        });
        cy.get('.EasyMDEContainer .CodeMirror').contains('[](https://example.com?some=\\(param1,param2\\)&more=\\(param3,param4\\)&end=true)');
        cy.get('.EasyMDEContainer .CodeMirror').type('{home}{rightarrow}Link to a website!');

        cy.previewOn();

        cy.get('.EasyMDEContainer .editor-preview').should('contain.html', '<p><a href="https://example.com?some=(param1,param2)&amp;more=(param3,param4)&amp;end=true" target="_blank">Link to a website!</a></p>');
    });

    it('must be able to deal with unbalanced parentheses in links (opening)', () => {
        cy.get('.EasyMDEContainer').should('be.visible');
        cy.get('#textarea').should('not.be.visible');

        cy.window().then(($win) => {
            cy.stub($win, 'prompt').returns('https://example.com?some=(param');
            cy.get('button.link').click();
        });
        cy.get('.EasyMDEContainer .CodeMirror').contains('[](https://example.com?some=\\(param)');
        cy.get('.EasyMDEContainer .CodeMirror').type('{home}{rightarrow}Link to a website!');

        cy.previewOn();

        cy.get('.EasyMDEContainer .editor-preview').should('contain.html', '<p><a href="https://example.com?some=(param" target="_blank">Link to a website!</a></p>');
    });

    it('must be able to deal with unbalanced parentheses in links (closing)', () => {
        cy.get('.EasyMDEContainer').should('be.visible');
        cy.get('#textarea').should('not.be.visible');

        cy.window().then(($win) => {
            cy.stub($win, 'prompt').returns('https://example.com?some=)param');
            cy.get('button.link').click();
        });
        cy.get('.EasyMDEContainer .CodeMirror').contains('[](https://example.com?some=\\)param)');
        cy.get('.EasyMDEContainer .CodeMirror').type('{home}{rightarrow}Link to a website!');

        cy.previewOn();

        cy.get('.EasyMDEContainer .editor-preview').should('contain.html', '<p><a href="https://example.com?some=)param" target="_blank">Link to a website!</a></p>');
    });

    it('must be able to deal with inequality symbols in links', () => {
        cy.get('.EasyMDEContainer').should('be.visible');
        cy.get('#textarea').should('not.be.visible');

        cy.window().then(($win) => {
            cy.stub($win, 'prompt').returns('https://example.com?some=<param');
            cy.get('button.link').click();
        });
        cy.get('.EasyMDEContainer .CodeMirror').contains('[](https://example.com?some=%3Cparam');
        cy.get('.EasyMDEContainer .CodeMirror').type('{home}{rightarrow}Link to a website!');

        cy.previewOn();

        cy.get('.EasyMDEContainer .editor-preview').should('contain.html', '<p><a href="https://example.com?some=%3Cparam" target="_blank">Link to a website!</a></p>');
    });

    it('must be able to deal with emoji in links', () => {
        cy.get('.EasyMDEContainer').should('be.visible');
        cy.get('#textarea').should('not.be.visible');

        cy.window().then(($win) => {
            cy.stub($win, 'prompt').returns('https://example.com?some=👷‍♂️');
            cy.get('button.link').click();
        });
        cy.get('.EasyMDEContainer .CodeMirror').contains('[](https://example.com?some=%F0%9F%91%B7%E2%80%8D%E2%99%82%EF%B8%8F');
        cy.get('.EasyMDEContainer .CodeMirror').type('{home}{rightarrow}Link to a 👌 website!');

        cy.previewOn();

        cy.get('.EasyMDEContainer .editor-preview').should('contain.html', '<p><a href="https://example.com?some=%F0%9F%91%B7%E2%80%8D%E2%99%82%EF%B8%8F" target="_blank">Link to a 👌 website!</a></p>');
    });

    it('must be able to deal with spaces in links', () => {
        cy.get('.EasyMDEContainer').should('be.visible');
        cy.get('#textarea').should('not.be.visible');

        cy.window().then(($win) => {
            cy.stub($win, 'prompt').returns('https://example.com?some=very special param');
            cy.get('button.link').click();
        });
        cy.get('.EasyMDEContainer .CodeMirror').contains('[](https://example.com?some=very%20special%20param');
        cy.get('.EasyMDEContainer .CodeMirror').type('{home}{rightarrow}Link to a website!');

        cy.previewOn();

        cy.get('.EasyMDEContainer .editor-preview').should('contain.html', '<p><a href="https://example.com?some=very%20special%20param" target="_blank">Link to a website!</a></p>');
    });
});
