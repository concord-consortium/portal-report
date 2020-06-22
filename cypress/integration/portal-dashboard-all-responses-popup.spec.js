context("Portal Dashboard Question Details Panel", () => {
  before(() => {
    cy.visit("/?portal-dashboard");
  });
  context('All Responses Popup Header', () => {
    it('verify popup opens from question overlay', () => {
      cy.get('[data-cy=collapsed-activity-button]').first().click();
      cy.get('[data-cy=activity-question-button]').first().click();
      cy.get('[data-cy=question-overlay-header]').should('be.visible');
      cy.get('[data-cy=view-all-student-responses-button]').should('be.visible').click();
      cy.get('[data-cy=all-students-responses-toggle]').should('be.visible');
    });
    it('verify title is visible', () => {
      cy.get('[data-cy=popup-header-title]').should('be.visible');
      //TODO Verify title should match the sequence/activity name from dashboard
    });
    //TODO Feedback toggle opens feedback view and vice versa
    it('verify all responses/feedback toggle is visible', () => {
      cy.get('[data-cy=all-students-responses-toggle]').should('be.visible').then(($el) => {
        expect($el).to.have.css("width", "204px");
        cy.get('[data-cy=feedback-toggle]').should('be.visible').then(($el) => {
          expect($el).to.have.css("width", "35px");
          cy.wrap($el).click();
        });
        cy.get('[data-cy=feedback-toggle]').should('be.visible').then(($el) => {
          expect($el).to.have.css("width", "204px");
        });
        cy.get('[data-cy=all-students-responses-toggle]').should('be.visible').then(($el) => {
          expect($el).to.have.css("width", "35px");
          cy.wrap($el).click();
        });
        cy.get('[data-cy=all-students-responses-toggle]').should('be.visible').then(($el) => {
          expect($el).to.have.css("width", "204px");
        });
      });
    });
    it('verify close button closes popup', () => {
      cy.get('[data-cy=close-popup-button]').should('be.visible').click();
      cy.get('[data-cy=popup-header-title]').should('not.be.visible');
    });
  });
  context('Class nav area', () => {
    before(() => {
      cy.get('[data-cy=view-all-student-responses-button]').should('be.visible').click();
    });
    it('verify view list toggles are visible', () => { //TODO need to verify that list toggles correctly
      cy.get("[data-cy=list-by-student-toggle]").should('be.visible');
      cy.get("[data-cy=list-by-questions-toggle]").should('be.visible');
    });
    it('verify spotlight opens dialog when no student selected (default)', () => {
      cy.get('[data-cy=spotlight-toggle').should('be.visible').click();
      cy.get('[data-cy=spotlight-dialog]').should('be.visible');
      cy.get('[data-cy=spotlight-dialog-close-button]').should('be.visible').click();
      cy.get('[data-cy=spotlight-dialog]').should('not.be.visible');
    });
    after(()=>{
      cy.get('[data-cy=close-popup-button]').click();
    });
  });
  context('Question nav area',()=>{
    before( function() {
      cy.get('[data-cy=activity-question-button]').eq(3).click();
      cy.get('[data-cy=question-overlay] [data-cy=question-overlay-title]').invoke('text').as('questionOverlayTitle');
      cy.get('[data-cy=question-overlay] [data-cy=question-title]').invoke('text').as('questionTitle');
      cy.get('[data-cy=question-overlay] [data-cy=question-text]').invoke('text').as('questionPrompt');
      cy.get('[data-cy=view-all-student-responses-button]').should('be.visible').click();
    });
    it('verify title is correct', function() {
      cy.get('[data-cy=all-responses-popup-view] [data-cy=question-overlay-title]').should('be.visible').invoke('text').should('contain',this.questionOverlayTitle);
      cy.get("[data-cy=question-overlay-previous-button]").should('be.visible');
      cy.get("[data-cy=question-overlay-next-button]").should('be.visible');
    });
    it('verify question text area is visible',function() {
      cy.get("[data-cy=all-responses-popup-view] [data-cy=question-title]").should('be.visible').invoke('text').should('contain',this.questionTitle);
      cy.get("[data-cy=all-responses-popup-view] [data-cy=question-text]").should('be.visible').invoke('text').should('contain',this.questionPrompt);
      cy.get("[data-cy=all-responses-popup-view] [data-cy=open-activity-button]").should('be.visible');
      cy.get("[data-cy=all-responses-popup-view] [data-cy=open-teacher-edition-button]").should('be.visible');
    });
    //TODO need to add tests for open activity button and open teacher edition button functionality
  });
});
