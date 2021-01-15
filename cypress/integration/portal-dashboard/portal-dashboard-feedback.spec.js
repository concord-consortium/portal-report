context("Portal Dashboard Feedback Panel", () => {
  before(() => {
    cy.visit("/?portal-dashboard");
    cy.get('[data-cy=navigation-select]').click();
    cy.get('[data-cy="list-item-feedback-report"]').should('be.visible').click();
  });
  context('Feedback Info Area', ()=>{
    it('verify feedback info area is visible and contains the expected elements', ()=>{
      cy.get('[data-cy=feedbackInfo]').should('be.visible');
      cy.get('[data-cy=activityLevelFeedbackButton]').should('be.visible');
      cy.get('[data-cy=questionLevelFeedbackButton]').should('be.visible');
      cy.get('[data-cy=feedbackNoteToggle]').should('be.visible');
      cy.get('[data-cy=feedbackBadgeLegend]').should('be.visible');
    });
  });
  context('Feedback Level', () => {
    describe('verify feedback level toggles switch views', () => {
      it('show activity-level feedback', () => {
        cy.get('[data-cy=activityLevelFeedbackButton]').should('be.visible').click();
        cy.get('[data-cy=student-answer]').should('not.be.visible');
      });
      it("show question-level feedback", () => {
        cy.get('[data-cy=questionLevelFeedbackButton]').should('be.visible').click();
        cy.get('[data-cy=student-answer]').should('be.visible');
      });
    });
  });
  context('Class Nav Area', ()=>{
    it('verify class nav area is visible and contains the expected elements', ()=>{
      cy.get('[data-cy=class-nav]').should('be.visible');
      cy.get('[data-cy="num-Awaiting feedback"]').should('be.visible');
      cy.get('[data-cy=sort-feedback]').should('be.visible');
    });
  });
  context('View List By', () => {
    describe('verify list by toggles switch views', () => {
      it('list by question', () => {
        cy.get('[data-cy=list-by-questions-toggle]').should('be.visible').click();
        cy.get('[data-cy=response-panel] [data-cy=student-name]').should('be.visible').and('contain','Student:');
        cy.get('[data-cy=question-row] [data-cy=question-wrapper]').first().should("contain","Q1");
      });
      it("list by students", () => {
        cy.get('[data-cy=list-by-student-toggle]').should('be.visible').click();
        cy.get('[data-cy=response-panel] [data-cy=question-overlay-title]').should('be.visible').and('contain','Question #');
        cy.get('[data-cy=feedbackRow] [data-cy=student-name]').first().should("contain","Armstrong, Jenna");
      });
    });
  });
  context('Activity nav area', ()=>{
    it('verify activity navigation is visible', ()=>{
      cy.get('[data-cy=activity-navigator]').should('be.visible');
      cy.get('[data-cy=activity-navigator-previous-button]').should('be.visible');
      cy.get('[data-cy=activity-navigator-next-button]').should('be.visible');
      cy.get('[data-cy=activity-title]').should('be.visible');
    });
    it('verify activity nav buttons toggle activities', ()=>{
      cy.get('[data-cy=activity-title]').should('contain', "Activity #1");
      cy.get('[data-cy=activity-navigator-next-button]').click();
      cy.get('[data-cy=activity-title]').should('contain', "Activity #2");
      cy.get('[data-cy=activity-navigator-previous-button]').click();
      cy.get('[data-cy=activity-title]').should('contain', "Activity #1");
    });
    it('verify toggling activity goes to the first question of the activity', ()=>{
      cy.get('[data-cy=response-panel] [data-cy=question-overlay-title]').should('contain', "Question #1");
      cy.get('[data-cy=response-panel] [data-cy=question-navigator-next-button]').click();
      cy.get('[data-cy=response-panel] [data-cy=question-overlay-title]').should('contain', "Question #2");
      cy.get('[data-cy=activity-navigator-next-button]').click();
      cy.get('[data-cy=activity-title]').should('contain', "Activity #2");
      cy.get('[data-cy=response-panel] [data-cy=question-overlay-title]').should('contain', "Question #1");
    });
  });
});
