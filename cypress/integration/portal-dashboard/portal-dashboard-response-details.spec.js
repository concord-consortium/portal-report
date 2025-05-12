context("Portal Dashboard Question Details Panel", () => {
  before(() => {
    cy.visit("/?portal-dashboard");
  });
  context('All Responses Header', () => {
    it('verify popup opens from question overlay', () => {
      cy.get('[data-cy=activity-question-button]').first().click();
      cy.get('[data-cy=question-overlay-header]').should('be.visible');
      cy.get('[data-cy=view-all-student-responses-button]').should('be.visible').click();
      cy.get('[data-cy=dashboard-header]').should('be.visible');
    });
  });
  context('View List By', () => {
    describe('verify by list by toggles switches views', () => {
      it('list by question', () => {
        cy.get('[data-cy=list-by-questions-toggle]').should('be.visible').click();
        cy.get('[data-cy=response-panel] [data-cy=student-name]').should('be.visible').and('contain','Student:');
        cy.get('[data-cy=popup-response-table] [data-cy=question-wrapper').first().should("contain","Q1");
        cy.get('[data-cy=response-details-container] [data-cy=num-Questions]').should('be.visible').and('contain', 'Questions: 7');
      });
      it("list by students", () => {
        cy.get('[data-cy=list-by-student-toggle]').should('be.visible').click();
        cy.get('[data-cy=response-panel] [data-cy=question-overlay-title]').should('be.visible').and('contain','Question #');
        cy.get('[data-cy=popup-response-table] [data-cy=student-name').first().should("contain","Armstrong, Jenna");
        cy.get('[data-cy=response-details-container] [data-cy=num-students]').should('be.visible').and('contain', '6 students');
      });
    });
  });
  context('Class nav area', () => {
    it('verify spotlight opens dialog when no student selected (default)', () => { //spotlight students is tested below
      cy.get('[data-cy=spotlight-toggle').should('be.visible').click();
      cy.get('[data-cy=spotlight-dialog]').should('be.visible');
      cy.get('[data-cy=spotlight-dialog-close-button]').should('be.visible').click();
      cy.get('[data-cy=spotlight-dialog]').should('not.exist');
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
    context("Student nav area", ()=>{
      before (()=>{
        cy.get('[data-cy=list-by-questions-toggle]').click();
        cy.get('[data-cy=activity-navigator-previous-button]').click();
      });
      it("verify student navigation", ()=>{
        cy.get('[data-cy=response-details-container] [data-cy=student-name]').should('be.visible').and('contain', "Armstrong, Jenna");
        cy.get('[data-cy=response-details-container] [data-cy=next-student-button]').should('be.visible').click();
        cy.get('[data-cy=response-details-container] [data-cy=student-name]').should('contain', 'Crosby, Kate');
        cy.get('[data-cy=response-details-container] [data-cy=next-student-button]').click();
        cy.get('[data-cy=response-details-container] [data-cy=student-name]').should('contain', 'Galloway, Amy');
        cy.get('[data-cy=response-details-container] [data-cy=previous-student-button]').click();
        cy.get('[data-cy=response-details-container] [data-cy=student-name]').should('contain', 'Crosby, Kate');
      });
      it('verify response section updates when student is navigated', ()=>{
        cy.get('[data-cy=popup-response-table] [data-cy=student-response]').should('be.visible').and('contain', "No response");
        cy.get('[data-cy=response-details-container] [data-cy=next-student-button]').click();
        cy.get('[data-cy=popup-response-table] [data-cy=student-response]').should('contain', "test answer 2");
        cy.get('[data-cy=response-details-container] [data-cy=previous-student-button]').click();
        cy.get('[data-cy=popup-response-table] [data-cy=student-response]').should('contain', "No response");
      });
    });
    after(()=>{
      cy.get('[data-cy=navigation-select]').should('be.visible').click();
      cy.get('[data-cy=list-item-progress-dashboard]').click();
    });
  });
  context('Question nav area',()=>{
    before( function() {
      // Start from a known location
      cy.visit("/?portal-dashboard");
      cy.get('[data-cy=activity-question-button]').eq(3).click();
      cy.get('[data-cy=question-overlay] [data-cy=question-overlay-title]').invoke('text').as('questionOverlayTitle');
      cy.get('[data-cy=question-overlay] [data-cy=question-title]').invoke('text').as('questionTitle');
      cy.get('[data-cy=question-overlay] [data-cy=question-content]').invoke('text').as('questionPrompt');
      cy.get('[data-cy=view-all-student-responses-button]').should('be.visible').click();
    });
    it('verify title is correct', function() {
      cy.get('[data-cy=response-details-container] [data-cy=question-overlay-title]').should('be.visible').invoke('text').should('contain',this.questionOverlayTitle);
      cy.get("[data-cy=question-navigator-previous-button]").should('be.visible');
      cy.get("[data-cy=question-navigator-next-button]").should('be.visible');
    });
    it('verify question text area is visible',function() {
      cy.get("[data-cy=response-details-container] [data-cy=question-title]").should('be.visible').invoke('text').should('contain',this.questionTitle);
      cy.get("[data-cy=response-details-container] [data-cy=question-content]").should('be.visible').invoke('text').should('contain',this.questionPrompt);
      cy.get("[data-cy=response-details-container] [data-cy=open-activity-button]").should('be.visible');
      cy.get("[data-cy=response-details-container] [data-cy=open-teacher-edition-button]").should('be.visible');
    });
    it('verify activity button opens activity page', function() {
      cy.get("[data-cy=response-details-container] [data-cy=open-activity-button]").should('have.attr', 'href')
      .and('include', "http://app.lara.docker/pages/25");
    });
    it('verify activity button opens teacher edition page', function() {
      cy.get("[data-cy=response-details-container] [data-cy=open-teacher-edition-button]").should('have.attr', 'href')
      .and('include', '?mode=teacher-edition');
    });
    context('Question nav of second activity with preview urls', ()=>{
      before( function() {
        // Start from a known location
        cy.visit("/?portal-dashboard");
        cy.get('[data-cy=collapsed-activity-button]').first().click();
        // open sidebar focused on the first question
        cy.get('[data-cy=activity-question-button]').first().click();
        // go into response details
        cy.get('[data-cy=view-all-student-responses-button]').should('be.visible').click();
      });
      it('verify activity button opens preview_url page', function() {
        cy.get("[data-cy=response-details-container] [data-cy=open-activity-button]").should('have.attr', 'href')
        .and('include', "http://activity-player.concord.org?activity=http://app.lara.docker/activities/10&page=1&preview");
      });
      it('verify activity button opens teacher edition page', function() {
        cy.get("[data-cy=response-details-container] [data-cy=open-teacher-edition-button]").should('have.attr', 'href')
        .and('include', "http://activity-player.concord.org?activity=http%3A%2F%2Fapp.lara.docker%2Factivities%2F10&mode=teacher-edition&page=1&preview");
      });
    });
  });
  context('Student list and responses area', () => {
    before( function() {
      // Start from a known location
      cy.visit("/?portal-dashboard");
      // open sidebar focused on the 4th question
      cy.get('[data-cy=activity-question-button]').eq(3).click();
      // go into response details
      cy.get('[data-cy=view-all-student-responses-button]').should('be.visible').click();
    });
    it('verify student names are listed',()=>{
      cy.get('[data-cy=student-name]').eq(0).should("contain", "Armstrong, Jenna");
      cy.get('[data-cy=student-name]').eq(1).should("contain", "Crosby, Kate");
      cy.get('[data-cy=student-name]').eq(2).should("contain", "Galloway, Amy");
      cy.get('[data-cy=student-name]').eq(3).should("contain", "Jenkins, John");
      cy.get('[data-cy=student-name]').eq(4).should("contain", "Ross, John");
      cy.get('[data-cy=student-name]').eq(5).should("contain", "Wu, Jerome");
    });
    it('verify responses',()=>{
      cy.get('[data-cy="response-details-container"] [data-cy=question-navigator-next-button]').click().click().click().click().click();
      // cy.get('[data-cy=student-response] [data-cy=student-answer] > div > div > a').should('have.attr','href');
      cy.get('[data-cy=question-navigator-previous-button]').click().click().click().click().click();
      cy.get('[data-cy=student-response]').eq(3).should("contain", "Play audio response");
    });
    describe("spotlight students",()=>{
      it("verify students with no answer cannot be selected",()=>{
        cy.get('[data-cy=spotlight-selection-checkbox]').eq(0).should("not.have.class","disabled");
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
      it('verify color change button',()=>{
        cy.get('[data-cy=selected-students-response-table] [data-cy=student-row]').eq(0)
          .children()
          .should('have.css', 'background-color', 'rgb(255, 255, 255)');
        cy.get('[data-cy=selected-students-response-table] [data-cy=spotlight-badge]').eq(0).click();
        cy.get('[data-cy=selected-students-response-table] [data-cy=student-row]').eq(0)
          .children()
          .should('have.css', 'background-color', 'rgb(255, 254, 191)');
      });
      it('verify deselect student',()=>{
        cy.get('[data-cy=selected-students-response-table] [data-cy=spotlight-selection-checkbox]').eq(0).click();
        cy.get('[data-cy=selected-students-response-table] [data-cy=student-row]').should('have.length', 1);
      });
      it('verify close spotlight',()=>{
        cy.get('[data-cy=close-spotlight-dialog-button]').should('be.visible').click();
        cy.get('[data-cy=spotlight-students-list-dialog]').should('not.exist');
      });
    });
    //TODO add tests for filtering when implemented
  });
});
