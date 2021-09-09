context("Portal Dashboard Question Details Panel", () => {
  before(() => {
    cy.visit("/?portal-dashboard");
  });

  describe('opening and closing the question details panel', () => {
    it('verify we can click to open a question and see the question tab expanded', () => {
      cy.get('[data-cy=question-overlay-header]').should('not.exist');
      cy.get('[data-cy=collapsed-activity-button]').first().click();
      cy.get('[data-cy=activity-question-button]').first().click();
      cy.get('[data-cy=question-overlay-header]').should('be.visible');
      cy.get('[data-cy=question-overlay]').should("contain", "Question #1");
    });

    it('verify we can click to open a second question', () => {
      cy.get('[data-cy=question-overlay-header]').should('be.visible');
      cy.get('[data-cy=activity-question-button]').eq(1).click();
      cy.get('[data-cy=question-overlay-header]').should('be.visible');
      cy.get('[data-cy=question-overlay]').should("contain", "Question #2");
    });

    it('verify we can click to close the question details panel', () => {
      cy.get('[data-cy=question-overlay-header-button]').first().click();
      cy.get('[data-cy=question-overlay-header]').should('not.exist');
    });
  });

  describe('paginating between questions', () => {
    it('verify the the previous button is disabled on first question', () => {
      // cy.get('[data-cy=collapsed-activity-button]').first().click();
      cy.get('[data-cy=activity-question-button]').first().click();
      cy.get('[data-cy=question-navigator-previous-button]').should('be.visible');
      cy.get('[data-cy=question-navigator-next-button]').should('be.visible');
      cy.get('[data-cy=question-overlay]').should("contain", "Question #1");
      cy.get('[data-cy=question-navigator-previous-button]').click();
      cy.get('[data-cy=question-overlay]').should("contain", "Question #1");
    });

    it('verify we can page to the second question', () => {
      cy.get('[data-cy=question-overlay]').should("contain", "Question #1");
      cy.get('[data-cy=question-navigator-next-button]').click();
      cy.get('[data-cy=question-overlay]').should("contain", "Question #2");
    });

    it('verify we can page back to the first question', () => {
      cy.get('[data-cy=question-overlay]').should("contain", "Question #2");
      cy.get('[data-cy=question-navigator-previous-button]').click();
      cy.get('[data-cy=question-overlay]').should("contain", "Question #1");
    });

    it('verify we can page first from last question of an activity', () => {
      cy.get('[data-cy=expanded-activity-button]').first().should("contain", "Activity 1: Report Test Activity 1");
      cy.get('[data-cy=activity-question-button]').eq(6).click({ force: true });
      cy.get('[data-cy=question-overlay]').should("contain", "Question #7");
      cy.get('[data-cy=question-navigator-next-button]').click();
      cy.get('[data-cy=expanded-activity-button]').first().should("contain", "Activity 2: Report Test Activity 2");
      cy.get('[data-cy=question-overlay]').should("contain", "Question #1");
    });

    it('verify the last question of the last activity is disabled', () => {
      cy.get('[data-cy=activity-question-button]').eq(8).click({ force: true });
      cy.get('[data-cy=expanded-activity-button]').first().should("contain", "Activity 2: Report Test Activity 2");
      cy.get('[data-cy=question-overlay]').should("contain", "Question #9");
      cy.get('[data-cy=question-navigator-next-button]').click();
      cy.get('[data-cy=question-overlay]').should("contain", "Question #9");
    });

    it('verify we can page back from the first question of a later activity', () => {
      cy.get('[data-cy=activity-question-button]').eq(0).click({ force: true });
      cy.get('[data-cy=expanded-activity-button]').first().should("contain", "Activity 2: Report Test Activity 2");
      cy.get('[data-cy=question-overlay]').should("contain", "Question #1");
      cy.get('[data-cy=question-navigator-previous-button]').click();
      cy.get('[data-cy=expanded-activity-button]').first().should("contain", "Activity 1: Report Test Activity 1");
      cy.get('[data-cy=question-overlay]').should("contain", "Question #7");
    });
  });
  describe('header elements', () => {
    it('button should open all student responses popup', () => { //functionality is tested in the all-responses-popup.spec
      cy.get('[data-cy=view-all-student-responses-button]').should('be.visible');
    });
  });
  describe('Question area', () => {
    before(() => {
      cy.get('[data-cy=question-navigator-previous-button]').click().click().click();
    });
    it('verify question area is visible', () => {
      cy.get('[data-cy=question-overlay] [data-cy=question-title]').should('be.visible');
      cy.get('[data-cy=question-overlay] [data-cy=question-content]').should('be.visible');
      cy.get("[data-cy=question-overlay] [data-cy=open-activity-button]").should('be.visible');
      cy.get("[data-cy=question-overlay] [data-cy=open-teacher-edition-button]").should('be.visible');
    });
    it('verify open activity button is logged', () => {
      cy.window().its("store").then(store => {
        cy.spy(store, "dispatch").as("dispatch");
      })
      cy.get("[data-cy=question-overlay] [data-cy=open-activity-button]")
        // This prevents the navigation,
        .then(($button) => {$button.click(event => event.preventDefault()) })
        // The click here should trigger a log event
        .click();
      // TODO: trying to monitor if track event was called, but this approach isn't working
      // cy.get("@dispatch").should("be.called");
    });
    it('verify show/hide button behaves correctly', () => {
      cy.get('[data-cy=question-overlay] [data-cy=show-hide-question-button]').should('be.visible').click();
      cy.get('[data-cy=question-overlay] [data-cy=question-title]').should('not.be.visible');
      cy.get('[data-cy=question-overlay] [data-cy=question-content]').should('not.be.visible');
      cy.get('[data-cy=question-overlay] [data-cy=show-hide-question-button]').should('be.visible').click();
      cy.get('[data-cy=question-overlay] [data-cy=question-title]').should('be.visible');
      cy.get('[data-cy=question-overlay] [data-cy=question-content]').should('be.visible');
    });
  });
  // Removed for MVP:
  describe.skip('Class Response Area', () => {
    it('verify class response area is visible', () => {
      cy.get('[data-cy=overlay-class-response-area]').should('be.visible');
    });
    it('verify show/hide button behaves correctly', () => {
      cy.get('[data-cy=overlay-class-response-area] [data-cy=show-hide-class-response-button]').should('be.visible').click();
      cy.get('[data-cy=overlay-class-response-area] [data-cy=class-response-content]').should('not.exist');
      cy.get('[data-cy=overlay-class-response-area] [data-cy=show-hide-class-response-button]').should('be.visible').click();
      cy.get('[data-cy=overlay-class-response-area] [data-cy=class-response-title]').should('be.visible');
      cy.get('[data-cy=overlay-class-response-area] [data-cy=class-response-content]').should('be.visible');
    });
  });
  describe('Student Response area', () => {
    it('verify student response area is visible', () => {
      cy.get('[data-cy=open-response-completed]').eq(0).click();
      cy.get('[data-cy=previous-student-button]').click();
      cy.get('[data-cy=previous-student-button]').click();
      cy.get('[data-cy=overlay-student-response-area]').should('be.visible');
      cy.get('[data-cy=overlay-student-response-area] [data-cy=student-answer]').should('be.visible').and('contain', "No response");
    });
    it('verify previous student button is disabled if first student',()=>{
      cy.get('[data-cy=student-name]').should('contain','Armstrong, Jenna');
      cy.get('[data-cy=previous-student-button]').click({force: true}); //Can't verify if button is disabled
      cy.get('[data-cy=student-name]').should('contain','Armstrong, Jenna');
    });
    it('verify changing students', () => {
      cy.get('[data-cy=next-student-button]').click();
      cy.get('[data-cy=student-name').should('contain','Crosby, Kate');
      cy.get('[data-cy=next-student-button]').click();
      cy.get('[data-cy=next-student-button]').click();
      cy.get('[data-cy=student-name]').should('contain','Jenkins, John');
      cy.get('[data-cy=overlay-student-response-area] [data-cy=student-answer]').should('be.visible').and('contain', "test answer 1");
    });
    it('verify next button is disabled when end of list is reached',()=>{
      cy.get('[data-cy=next-student-button]').click();
      cy.get('[data-cy=next-student-button]').click();
      cy.get('[data-cy=student-name]').should('contain','Wu, Jerome');
      cy.get('[data-cy=next-student-button]').click({force: true});//Can't verify if button is disabled
      cy.get('[data-cy=student-name]').should('contain','Wu, Jerome');
    });
    it('verify student name is anonymize when toggle is on and vice versa',()=>{
      cy.get('[data-cy="anonymize-students"] [data-cy=toggle-control]').click();
      cy.get('[data-cy=student-name]').should('contain','Student 6');
      cy.get('[data-cy="anonymize-students"] [data-cy=toggle-control]').click();
      cy.get('[data-cy=student-name]').should('contain','Wu, Jerome');
    });
    it('verify multiple choice choice texts are visible',()=>{
      cy.get('[data-cy="activity-question-button"]').eq(2).click();
      cy.get('[data-cy=multiple-choice-choice-text]').eq(0).should('contain','a');
    });
    it('verify image answer',()=>{
      cy.get('[data-cy="activity-question-button"]').eq(5).click();
      cy.get('[data-cy="answer-image"]').should('be.visible');
    });
    it('verify image lightbox of image answer', ()=>{
      cy.get('[data-cy="magnify-answer"]').should('be.visible').click();
      cy.get('[data-cy="answer-lightbox"]').should('be.visible');
      cy.get('[data-cy="modal-header"]').should('contain', "Wu, Jerome");
      cy.get('[data-cy="answer-lightbox"] [data-cy="answer-image"]').should('be.visible');
    });
    it('verify close lightbox',()=>{
      cy.get('[data-cy="modal-header"] [data-cy="close-button"]').should('be.visible').click();
      cy.get('[data-cy="answer-lightbox"]').should('not.exist');
    });
    it('verify invalid image answer',()=>{
      cy.get('[data-cy=previous-student-button]').click();
      cy.get('[data-cy=previous-student-button]').click();
      cy.get('[data-cy=previous-student-button]').click();
      cy.get('[data-cy=student-answer]').should('contain', "Error");
    });
    it('verify invalid answer type',()=>{
      // collapse the student answer pane just to make sure the cell we want to click on
      // is visible
      cy.get('[data-cy=question-overlay-header-button]').click();
      cy.get('[data-cy=collapsed-activity-button]').first().click();
      cy.get('[data-cy=student-answers-row]')
        .eq(0)
        .find('[data-cy=interactive-completed]')
        .last()
        .click();
      cy.get('[data-cy=student-answer]').should('contain', "Answer type not supported");
    });
  });
});
