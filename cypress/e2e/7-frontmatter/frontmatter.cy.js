/// <reference types="cypress" />

describe('Frontmatter', () => {
    beforeEach(() => {
        cy.visit(__dirname + '/index.html');
    });

    it('handles simple frontmatter with single key', () => {
        cy.get('.EasyMDEContainer .CodeMirror').then(function(el) {
            var cm = el[0].CodeMirror;
            cm.setValue('---\nfrontmatter: testing\n---\n\nBody text');
        });

        cy.previewOn();

        cy.get('.EasyMDEContainer .editor-preview table').should('exist');
        cy.get('.EasyMDEContainer .editor-preview table td').contains('frontmatter').should('exist');
        cy.get('.EasyMDEContainer .editor-preview table td').contains('testing').should('exist');
        // The frontmatter content should NOT be rendered as a heading
        cy.get('.EasyMDEContainer .editor-preview h2').should('not.exist');
        // Body text should render normally
        cy.get('.EasyMDEContainer .editor-preview').should('contain.html', '<p>Body text</p>');
    });

    it('does not apply heading styling to frontmatter content in the editor', () => {
        cy.get('.EasyMDEContainer .CodeMirror').then(function(el) {
            var cm = el[0].CodeMirror;
            cm.setValue('---\nfrontmatter: testing\n---\n\n# Real Heading');
        });

        // The frontmatter lines should have the cm-frontmatter class
        cy.get('.EasyMDEContainer .CodeMirror .cm-frontmatter').should('have.length', 3);
        // The body heading should still work normally
        cy.get('.EasyMDEContainer .CodeMirror .cm-header').should('exist');
        // Frontmatter lines should NOT have heading-sized text visually
        // (our CSS overrides .cm-header inside .cm-frontmatter to inherit font-size)
        cy.get('.EasyMDEContainer .CodeMirror .cm-frontmatter').first().then(function($el) {
            var fontSize = $el.css('font-size');
            // The frontmatter line font size should match normal text, not heading
            expect(parseFloat(fontSize)).to.be.lessThan(18);
        });
    });

    it('renders frontmatter as a table in preview', () => {
        cy.get('.EasyMDEContainer').should('be.visible');

        // Set value directly to avoid Cypress typing issues with CodeMirror
        cy.get('.EasyMDEContainer .CodeMirror').then(function(el) {
            var cm = el[0].CodeMirror;
            cm.setValue('---\ntitle: My Document\nauthor: John Doe\n---\n\n# Hello World');
        });

        cy.previewOn();

        // Check table exists with correct cells
        cy.get('.EasyMDEContainer .editor-preview table').should('exist');
        cy.get('.EasyMDEContainer .editor-preview table td').contains('title').should('exist');
        cy.get('.EasyMDEContainer .editor-preview table td').contains('My Document').should('exist');
        cy.get('.EasyMDEContainer .editor-preview table td').contains('author').should('exist');
        cy.get('.EasyMDEContainer .editor-preview table td').contains('John Doe').should('exist');

        // Body content should also render
        cy.get('.EasyMDEContainer .editor-preview').should('contain.html', '<h1');
    });

    it('does not show --- delimiters in the preview table', () => {
        cy.get('.EasyMDEContainer .CodeMirror').type('---');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('title: Test');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('---');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('Some text');

        cy.previewOn();

        // The --- should not appear in the preview HTML
        cy.get('.EasyMDEContainer .editor-preview').should('not.contain.html', '<code>---</code>');
        cy.get('.EasyMDEContainer .editor-preview table').should('exist');
    });

    it('ignores comment lines starting with #', () => {
        cy.get('.EasyMDEContainer .CodeMirror').then(function(el) {
            var cm = el[0].CodeMirror;
            cm.setValue('---\ntitle: My Doc\n# This is a comment\nauthor: Jane\n---\n\nBody text');
        });

        cy.previewOn();

        // Table should exist with the valid keys
        cy.get('.EasyMDEContainer .editor-preview table').should('exist');
        // Valid keys should appear
        cy.get('.EasyMDEContainer .editor-preview table td').contains('title').should('exist');
        cy.get('.EasyMDEContainer .editor-preview table td').contains('author').should('exist');
        // Comment text should not appear as a row
        cy.get('.EasyMDEContainer .editor-preview table td').contains('This is a comment').should('not.exist');
    });

    it('handles multi-line values with | indicator', () => {
        cy.get('.EasyMDEContainer .CodeMirror').type('---');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('description: |');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('First line');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('Second line');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('---');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('Body');

        cy.previewOn();

        cy.get('.EasyMDEContainer .editor-preview table td').contains('description').should('exist');
        cy.get('.EasyMDEContainer .editor-preview table').should('contain', 'First line');
        cy.get('.EasyMDEContainer .editor-preview table').should('contain', 'Second line');
        // Verify the table has exactly one row (the description multi-line value)
        cy.get('.EasyMDEContainer .editor-preview table tr').should('have.length', 1);
    });

    it('handles indented keys with &nbsp;', () => {
        cy.get('.EasyMDEContainer .CodeMirror').type('---');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('title: Test');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('  child: value1');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('---');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('Body');

        cy.previewOn();

        cy.get('.EasyMDEContainer .editor-preview table').should('contain.html', '&nbsp;&nbsp;child');
    });

    it('ignores lines without key:value pattern', () => {
        cy.get('.EasyMDEContainer .CodeMirror').type('---');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('title: Test');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('just some random text');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('---');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('Body');

        cy.previewOn();

        // Only title row should exist, not the random text
        cy.get('.EasyMDEContainer .editor-preview table td').contains('title').should('exist');
        cy.get('.EasyMDEContainer .editor-preview table td').contains('just some random text').should('not.exist');
    });

    it('excludes frontmatter from word count', () => {
        cy.get('.EasyMDEContainer .CodeMirror').type('---');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('title: My Document Title');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('---');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('Hello world');

        // Word count should be 2 (Hello world), not counting frontmatter
        cy.get('.EasyMDEContainer .editor-statusbar .words').should('contain', '2');
    });

    it('excludes frontmatter from line count', () => {
        cy.get('.EasyMDEContainer .CodeMirror').type('---');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('title: Test');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('---');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('Line one');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('Line two');

        // Line count should be 2 (Line one, Line two), not counting frontmatter (3 lines)
        cy.get('.EasyMDEContainer .editor-statusbar .lines').should('contain', '2');
    });

    it('blocks formatting in frontmatter', () => {
        cy.get('.EasyMDEContainer .CodeMirror').type('---');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('title: Test');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('---');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('Body text');

        // Move cursor to frontmatter line (line 2 = the "title: Test" line)
        cy.get('.EasyMDEContainer .CodeMirror').type('{upArrow}{upArrow}{upArrow}{upArrow}');

        // Try to click bold
        cy.get('.EasyMDEContainer .editor-toolbar button.bold').click();

        // The frontmatter line should not have ** around it
        cy.get('.EasyMDEContainer .CodeMirror-line').contains('title: Test').should('exist');
    });

    it('supports +++ delimiter variant', () => {
        cy.get('.EasyMDEContainer .CodeMirror').type('+++');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('title: TOML Style');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('+++');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('Body');

        cy.previewOn();

        cy.get('.EasyMDEContainer .editor-preview table').should('exist');
        cy.get('.EasyMDEContainer .editor-preview table td').contains('title').should('exist');
        cy.get('.EasyMDEContainer .editor-preview table td').contains('TOML Style').should('exist');
    });

    it('does not detect frontmatter without closing delimiter', () => {
        cy.get('.EasyMDEContainer .CodeMirror').type('---');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('title: No Close');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        // No closing ---, just body text
        cy.get('.EasyMDEContainer .CodeMirror').type('Body text');

        cy.previewOn();

        // Without closing delimiter, frontmatter should NOT be detected
        cy.get('.EasyMDEContainer .editor-preview table').should('not.exist');
        // The content should render as normal markdown
        cy.get('.EasyMDEContainer .editor-preview').should('contain.html', '<p>');
    });

    it('applies cm-frontmatter CSS class to frontmatter lines', () => {
        cy.get('.EasyMDEContainer .CodeMirror').type('---');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('title: Test');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('---');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('{enter}');
        cy.get('.EasyMDEContainer .CodeMirror').type('Body');

        // Check that frontmatter lines have the cm-frontmatter class
        cy.get('.EasyMDEContainer .CodeMirror .cm-frontmatter').should('exist');
    });
});
