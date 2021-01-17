context("Portal Dashboard Feedback Panel", () => {
  before(() => {
    cy.visit("/?portal-dashboard");
    cy.get('[data-cy=navigation-select]').click();
    cy.get('[data-cy="list-item-feedback-report"]').should('be.visible').click();
  });
  context('Feedback Info Area', ()=>{
    it('verify feedback info area is visible and contains the expected elements', ()=>{
      cy.get('[data-cy=feedback-info]').should('be.visible');
      cy.get('[data-cy=activity-level-feedback-button]').should('be.visible');
      cy.get('[data-cy=question-level-feedback-button]').should('be.visible');
      cy.get('[data-cy=feedback-note-toggle]').should('be.visible');
      cy.get('[data-cy=feedback-badge-legend]').should('be.visible');
    });
  });
  context('Feedback Level', () => {
    describe('verify feedback level toggles switch views', () => {
      it('show activity-level feedback', () => {
        cy.get('[data-cy=activity-level-feedback-button]').should('be.visible').click();
        cy.get('[data-cy=list-by-questions-toggle]').should('be.disabled');
        cy.get('[data-cy=feedback-badge-legend]').should('contain', 'Activity-level Feedback Key');
        cy.get('[data-cy=feedback-badge-legend]').should('contain', 'Awaiting feedback');
        cy.get('[data-cy=feedback-badge-legend]').should('contain', 'Feedback given');
        cy.get('[data-cy=feedback-badge-legend]').should('not.contain', 'Student answer updated since feedback given');
        cy.get('[data-cy=student-answer]').should('not.exist');
      });
      it("show question-level feedback", () => {
        cy.get('[data-cy=question-level-feedback-button]').should('be.visible').click();
        cy.get('[data-cy=list-by-questions-toggle]').should('not.be.disabled');
        cy.get('[data-cy=feedback-badge-legend]').should('contain', 'Question-level Feedback Key');
        cy.get('[data-cy=feedback-badge-legend]').should('contain', 'Awaiting feedback');
        cy.get('[data-cy=feedback-badge-legend]').should('contain', 'Feedback given');
        cy.get('[data-cy=feedback-badge-legend]').should('contain', 'Student answer updated since feedback given');
        cy.get('[data-cy=student-answer]').should('be.visible');
        cy.get('[data-cy=student-answer]')
           .contains('No response')
           .parents('[class^=feedback-rows--studentResponse]')
           .next('[data-cy=feedback-container]')
           .should('be.empty');
        cy.get('[data-cy=student-answer]')
          .contains('test answer')
          .parents('[class^=feedback-rows--studentResponse]')
          .next('[data-cy=feedback-container]')
          .children('[data-cy=feedback-textarea]')
          .should('exist');
      });
    });
  });
  context('Class Nav Area', ()=>{
    it('verify class nav area is visible and contains the expected elements', ()=>{
      cy.get('[data-cy=class-nav]').should('be.visible');
      cy.get('[data-cy="num-Awaiting feedback"]').should('be.visible');
      cy.get('[data-cy=item-number').should('contain', '3');
      cy.get('[data-cy=sort-feedback]').should('be.visible');
    });
  });
  context('View List By', () => {
    describe('verify list by toggles switch views', () => {
      it('list by question', () => {
        cy.get('[data-cy=list-by-questions-toggle]').should('be.visible').click();
        cy.get('[data-cy=question-row] [data-cy=question-wrapper] [data-cy=feedback-badge]').should('be.visible');
        cy.get('[data-cy=student-answer]').first().should('contain', "No response");
        cy.get('[data-cy=feedback-container]').first().should('be.empty');
        cy.get('[data-cy=next-student-button]').click().click();
        cy.get('[data-cy=student-answer]').first().should('contain', "test answer");
        cy.get('[data-cy=feedback-container]').first().should('not.be.empty');
      });
      it("list by students", () => {
        cy.get('[data-cy=list-by-student-toggle]').should('be.visible').click();
        cy.get('[data-cy=feedbackRow] [data-cy=feedback-badge]').should('be.visible');
      });
    });
  });
});