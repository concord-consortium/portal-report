context("Portal Dashboard Question Details Panel", () => {
  before(() => {
    cy.visit("/?portal-dashboard");
  });
  context('All Responses Header', () => {
    it('verify popup opens from question overlay', () => {
      cy.get('[data-cy=collapsed-activity-button]').first().click();
      cy.get('[data-cy=activity-question-button]').first().click();
      cy.get('[data-cy=question-overlay-header]').should('be.visible');
      cy.get('[data-cy=view-all-student-responses-button]').should('be.visible').click();
      cy.get('[data-cy=dashboard-header]').should('be.visible');
    });
    after(()=>{
      cy.get('[data-cy=navigation-select]').last().click();
      cy.get('[data-cy="list-item-progress-dashboard"]').last().should('be.visible').click();
    });
  });
  context('Class nav area', () => {
    before(() => {
      cy.get('[data-cy=view-all-student-responses-button]').should('be.visible').click();
    });
    it('verify spotlight opens dialog when no student selected (default)', () => { //spotlight students is tested below
      cy.get('[data-cy=spotlight-toggle').should('be.visible').click();
      cy.get('[data-cy=spotlight-dialog]').should('be.visible');
      cy.get('[data-cy=spotlight-dialog-close-button]').should('be.visible').click();
      cy.get('[data-cy=spotlight-dialog]').should('not.be.visible');
    });
    after(()=>{
      cy.get('[data-cy=navigation-select]').last().click();
      cy.get('[data-cy="list-item-progress-dashboard"]').last().should('be.visible').click();
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
    it('verify activity button opens activity page', function() {
      cy.get("[data-cy=all-responses-popup-view] [data-cy=open-activity-button]").should('have.attr', 'href')
      .and('include', "http://app.lara.docker/activities/9");
    });
    it('verify activity button opens teacher edition page', function() {
      cy.get("[data-cy=all-responses-popup-view] [data-cy=open-teacher-edition-button]").should('have.attr', 'href')
      .and('include', '?mode=teacher-edition');
    });
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
      cy.get('[data-cy="all-responses-popup-view"] [data-cy=question-navigator-next-button]').click().click().click().click().click();
      cy.get('[data-cy=student-response] [data-cy=student-answer] > div > div > a').should('have.attr','href');
    });
    describe("spotlight students",()=>{
      it("verify students with no answer cannot be selected",()=>{
        cy.get('[data-cy=spotlight-selection-checkbox]').eq(0).attribute("class").should("contain","disabled");
      });
      it("verify spotlight students dialog is opened when students are selected and spotlight is clicked",()=>{
        cy.get('[data-cy=spotlight-selection-checkbox]').should('have.length', 6);
        cy.get('[data-cy=spotlight-selection-checkbox]').eq(3).click();
        cy.get('[data-cy=spotlight-selection-checkbox]').eq(5).click();
        cy.get('[data-cy=spotlight-toggle]').click();
        cy.get('[data-cy=spotlight-students-list-dialog]').should('be.visible');
      });
      it('verify spotlight dialog elements',()=>{
        cy.get('[data-cy=spotlight-dialog-header-title]').should('be.visible');  //TODO Verify title should match the sequence/activity name from dashboard
        cy.get('[data-cy=select-students-header] [data-cy=anonymize-students]').should('be.visible');
        cy.get('[data-cy=select-students-header] [data-cy=question-prompt]').should('be.visible');
        cy.get('[data-cy=select-students-header] [data-cy=question-prompt]').should('be.visible');
        cy.get('[data-cy=selected-students-response-table]').should('be.visible');
        cy.get('[data-cy=selected-students-response-table] [data-cy=student-row]').should('have.length', 2);
      });
      it('verify deselect student',()=>{
        cy.get('[data-cy=selected-students-response-table] [data-cy=spotlight-selection-checkbox]').eq(0).click();
        cy.get('[data-cy=selected-students-response-table] [data-cy=student-row]').should('have.length', 1);
      });
      it('verify close spotlight',()=>{
        cy.get('[data-cy=close-spotlight-dialog-button]').should('be.visible').click();
        cy.get('[data-cy=spotlight-students-list-dialog]').should('not.be.visible');
      });
    });
    //TODO add tests for filtering when implemented
  });
});
