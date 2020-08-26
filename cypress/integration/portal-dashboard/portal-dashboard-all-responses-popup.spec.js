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
    // Removed for MVP:
    it.skip('verify all responses/feedback toggle is visible', () => {
      cy.get('[data-cy=all-students-responses-toggle]').should('be.visible').then(($el) => {
        expect($el).to.have.css("width", "204px");
        cy.get('[data-cy=feedback-toggle]').should('be.visible').then(($el) => {
          expect($el).to.have.css("width", "35px");
          cy.wrap($el).click();
          cy.wait(500);
        });
        cy.get('[data-cy=feedback-toggle]').should('be.visible').then(($el) => {
          expect($el).to.have.css("width", "204px");
        });
        cy.get('[data-cy=all-students-responses-toggle]').should('be.visible').then(($el) => {
          expect($el).to.have.css("width", "35px");
          cy.wrap($el).click();
          cy.wait(500);
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
      cy.get('[data-cy=question-overlay] [data-cy=question-content]').invoke('text').as('questionPrompt');
      cy.get('[data-cy=view-all-student-responses-button]').should('be.visible').click();
    });
    it('verify title is correct', function() {
      cy.get('[data-cy=all-responses-popup-view] [data-cy=question-overlay-title]').should('be.visible').invoke('text').should('contain',this.questionOverlayTitle);
      cy.get("[data-cy=question-navigator-previous-button]").should('be.visible');
      cy.get("[data-cy=question-navigator-next-button]").should('be.visible');
    });
    it('verify question text area is visible',function() {
      cy.get("[data-cy=all-responses-popup-view] [data-cy=question-title]").should('be.visible').invoke('text').should('contain',this.questionTitle);
      cy.get("[data-cy=all-responses-popup-view] [data-cy=question-content]").should('be.visible').invoke('text').should('contain',this.questionPrompt);
      cy.get("[data-cy=all-responses-popup-view] [data-cy=open-activity-button]").should('be.visible');
      cy.get("[data-cy=all-responses-popup-view] [data-cy=open-teacher-edition-button]").should('be.visible');
    });
    //TODO need to add tests for open activity button and open teacher edition button functionality
  });
  context('Student list and responses area', () => {
    it('verify student names are listed',()=>{
      cy.get('[data-cy=student-name]').eq(0).should("contain", "Armstrong, Jenna");
      cy.get('[data-cy=student-name]').eq(1).should("contain", "Crosby, Kate");
      cy.get('[data-cy=student-name]').eq(2).should("contain", "Galloway, Amy");
      cy.get('[data-cy=student-name]').eq(3).should("contain", "Jenkins, John");
      cy.get('[data-cy=student-name]').eq(4).should("contain", "Ross, John");
      cy.get('[data-cy=student-name]').eq(5).should("contain", "Wu, Jerome");
    });
    it('verify responses',()=>{
      cy.get('[data-cy="all-responses-popup-view"] [data-cy=question-navigator-next-button]').click().click().click();

      cy.get('[data-cy=student-response] [data-cy=student-answer] > div > div > a').should('have.attr','href');
    });
    //TODO add tests for filtering when implemented
  });
});
