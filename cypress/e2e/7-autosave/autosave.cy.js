/// <reference types="cypress" />

describe('Autosave status', () => {
    beforeEach(() => {
        cy.visit(__dirname + '/index.html');
    });

    it('updates each editor status independently', () => {
        cy.window().then((win) => {
            const firstStatus = win.document.querySelectorAll('.autosave')[0];
            const secondStatus = win.document.querySelectorAll('.autosave')[1];
            const initialSecondText = secondStatus.textContent;
            win.editors.first.value('First text');
            win.editors.first.autosave();
            expect(firstStatus.textContent).to.contain('First saved: ');
            expect(secondStatus.textContent).to.equal(initialSecondText);
            const firstSavedText = firstStatus.textContent;

            win.editors.second.value('Second text');
            win.editors.second.autosave();
            expect(secondStatus.textContent).to.contain('Second saved: ');
            expect(firstStatus.textContent).to.equal(firstSavedText);
            expect(firstStatus.id).to.equal('autosaved-first');
            expect(secondStatus.id).to.equal('autosaved-second');
            expect(win.localStorage.getItem('smde_first')).to.equal('First text');
            expect(win.localStorage.getItem('smde_second')).to.equal('Second text');
        });
    });

    it('does not update another editor when the autosave status item is omitted', () => {
        cy.window().then((win) => {
            const statuses = win.document.querySelectorAll('.autosave');
            win.editors.first.autosave();
            const initialText = Array.from(statuses, (status) => status.textContent);
            win.editors.withoutStatus.value('Saved without a status item');
            win.editors.withoutStatus.autosave();
            expect(win.localStorage.getItem('smde_without-status')).to.equal('Saved without a status item');
            expect(Array.from(statuses, (status) => status.textContent)).to.deep.equal(initialText);
            expect(statuses[2].hasAttribute('id')).to.equal(false);
        });
    });

    it('keeps saving and clearing values for a single editor', () => {
        cy.window().then((win) => {
            const firstStatus = win.document.querySelector('.autosave');
            win.editors.first.value('Saved text');
            win.editors.first.autosave();
            expect(win.localStorage.getItem('smde_first')).to.equal('Saved text');
            expect(firstStatus.textContent).to.contain('First saved: ');
            win.editors.first.value('');
            win.editors.first.autosave();
            expect(win.localStorage.getItem('smde_first')).to.equal(null);
        });
    });
});
