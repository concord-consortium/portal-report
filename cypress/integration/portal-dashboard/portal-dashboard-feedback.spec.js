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
        cy.get('[data-cy=feedback-note-toggle-button]').should('be.visible').click();
        cy.get('[data-cy=feedback-note-modal]')
          .should('be.visible')
          .should('contain', 'Activity-level Feedback')
          .should('contain', 'You may provide a student with written feedback at the activity level once the student has completed the activity.');
        cy.get('[data-cy=feedback-note-modal-close-button]').should('be.visible').click();
        cy.get('[data-cy=feedback-note-modal]').should('not.exist');
        cy.get('[data-cy=feedback-badge-legend]').should('contain', 'Activity-level Feedback Key');
        cy.get('[data-cy=feedback-badge-legend]').should('contain', 'Awaiting feedback');
        cy.get('[data-cy=feedback-badge-legend]').should('contain', 'Feedback given');
        cy.get('[data-cy=feedback-badge-legend]').should('not.contain', 'Student answer updated since feedback given');
        cy.get('[data-cy=student-answer]').should('not.exist');
      });
      it("show question-level feedback", () => {
        cy.get('[data-cy=question-level-feedback-button]').scrollIntoView().should('be.visible').click();
        cy.get('[data-cy=list-by-questions-toggle]').should('not.be.disabled');
        cy.get('[data-cy=feedback-note-toggle-button]').should('be.visible').click();
        cy.get('[data-cy=feedback-note-modal]')
          .should('be.visible')
          .should('contain', 'Question-level Feedback')
          .should('contain', 'You may provide a student with written feedback at the question level once an answer has been submitted.');
        cy.get('[data-cy=feedback-note-modal-close-button]').should('be.visible').click();
        cy.get('[data-cy=feedback-note-modal]').should('not.exist');
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
      cy.get('[data-cy=sort-feedbackreport]').should('be.visible');
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
        cy.get('[data-cy=student-answer]').first().should('contain', "test answer 2");
        cy.get('[data-cy=feedback-container]').first().should('not.be.empty');
      });
      it("list by students", () => {
        cy.get('[data-cy=list-by-student-toggle]').should('be.visible').click();
        cy.get('[data-cy=feedbackRow] [data-cy=feedback-badge]').should('be.visible');
      });
    });
  });
  context('Sort By', () => {
    describe('verify sort by toggle menu adjusts order of feedback rows', () => {
       it('is set to sort by Student Name by default', () => {
         cy.get('[data-cy=sort-feedbackreport]').should('be.visible').and('contain', 'Student Name');
         cy.get('[data-cy=student-name]').first().should('contain', 'Armstrong, Jenna');
         cy.get('[data-cy=student-name]').last().should('contain', 'Wu, Jerome');
       });
       it('can sort feedback rows by Awaiting Feedback', () => {
        cy.get('[data-cy=sort-feedbackreport]').click();
        cy.get('[data-cy=list-item-awaiting-feedback]').should('be.visible').and('contain', 'Awaiting Feedback');
        cy.get('[data-cy=list-item-awaiting-feedback]').click();
        cy.get('[data-cy=student-name]').first().should('contain', 'Jenkins, John');
        cy.get('[data-cy=feedback-container').first()
          .find('textarea[data-cy=feedback-textarea]')
          .should('have.attr', 'placeholder', 'Enter feedback');
        cy.get('[data-cy=student-name]').last().should('contain', 'Crosby, Kate');
        cy.get('[data-cy=feedback-container]').last()
          .find('textarea[data-cy=feedback-textarea]')
          .should('not.exist');
       });
       it('can sort feedback rows by Least Progress', () => {
        cy.get('[data-cy=sort-feedbackreport]').click();
        cy.get('[data-cy=list-item-least-progress]').should('be.visible').and('contain', 'Least Progress');
        cy.get('[data-cy=list-item-least-progress]').click();
        cy.get('[data-cy=student-name]').first().should('contain', 'Crosby, Kate');
        cy.get('[data-cy=student-answer]').first().should('contain', 'No response');
        cy.get('[data-cy=student-name]').last().should('contain', 'Jenkins, John');
        cy.get('[data-cy=feedback-container').last()
          .find('textarea[data-cy=feedback-textarea]')
          .should('have.attr', 'placeholder', 'Enter feedback');
       });
       it('can sort feedback rows by Most Progress', () => {
        cy.get('[data-cy=sort-feedbackreport]').click();
        cy.get('[data-cy=list-item-most-progress]').should('be.visible').and('contain', 'Most Progress');
        cy.get('[data-cy=list-item-most-progress]').click();
        cy.get('[data-cy=student-name]').first().should('contain', 'Jenkins, John');
        cy.get('[data-cy=feedback-container').first()
          .find('textarea[data-cy=feedback-textarea]')
          .should('have.attr', 'placeholder', 'Enter feedback');
        cy.get('[data-cy=student-name]').last().should('contain', 'Crosby, Kate');
        cy.get('[data-cy=student-answer]').last().should('contain', 'No response');
       });
       it('can sort by Student Name again', () => {
        cy.get('[data-cy=sort-feedbackreport]').click();
        cy.get('[data-cy=list-item-student-name]').should('be.visible').and('contain', 'Student Name');
        cy.get('[data-cy=list-item-student-name]').click();
        cy.get('[data-cy=student-name]').first().should('contain', 'Armstrong, Jenna');
        cy.get('[data-cy=student-name]').last().should('contain', 'Wu, Jerome');
      });
    });
  });
  context('Feedback Rows', () => {
    describe('verify activity-level feedback appear and accept input', () => {
      it('shows feedback textareas for students who have started an activity', () => {
        cy.get('[data-cy=activity-level-feedback-button]').click();
        cy.get('[data-cy=feedback-container]')
          .first()
          .should('contain', "This student hasn't started yet.")
          .children('[data-cy=feedback-textarea]')
          .should('not.exist');
        cy.get('[data-cy=feedback-badge]')
          .first()
          .should('be.empty');
        cy.get('[data-cy=feedback-text-and-score]')
          .eq(2)
          .children('[data-cy=feedback-textarea]')
          .should('be.visible')
          .type('This is activity-level feedback.');
        cy.wait(2100);
        cy.get('[data-cy=question-level-feedback-button]').click();
        cy.get('[data-cy=activity-level-feedback-button]').click();
        cy.get('[data-cy=feedback-text-and-score]')
          .eq(2)
          .children('[data-cy=feedback-textarea]')
          .should('contain', 'This is activity-level feedback.');
      });
      it('shows rubric feedback area', () => {
        cy.get('[data-cy=rubric-table]').should('be.visible');
      });
      it('rubric feedback can be given', () => {
        cy.get('[data-cy=rating-radio-button]').eq(0).click();
        cy.get('[data-cy=rating-radio-button] div').eq(0)
        .should('have.css', 'background-color')
        .and('eq', 'rgb(78, 161, 90)');
        // selecting only 1 of the 4 criteria does not trigger feedback complete
        cy.get('[data-cy=feedback-badge]').eq(2).find('circle')
          .should('have.attr', 'fill')
          .and('not.include', '#4EA15A');
        cy.get('[data-cy=rating-radio-button]').eq(2).click();
        cy.get('[data-cy=rating-radio-button] div').eq(2)
          .should('have.css', 'background-color')
          .and('eq', 'rgb(78, 161, 90)');
        // select all the other feedback
        cy.get('[data-cy=rating-radio-button]').eq(5).click();
        cy.get('[data-cy=rating-radio-button]').eq(8).click();
        // selecting all criteria does trigger feedback complete
        cy.get('[data-cy=feedback-badge]').eq(2).find('circle')
          .should('have.attr', 'fill')
          .and('include', '#4EA15A');
      });
      it('rubric feedback can be deselected', () => {
        cy.get('[data-cy=rating-radio-button]').eq(0).click();
        cy.get('[data-cy=rating-radio-button] div').eq(0)
          .should('have.css', 'background-color')
          .and('eq', 'rgb(255, 255, 255)');
        cy.get('[data-cy=feedback-badge]').eq(2).find('circle')
          .should('have.attr', 'fill')
          .and('not.include', '#4EA15A');
      });
    });
    describe('verify question-level feedback textareas appear and accept input', () => {
      it('shows feedback textareas for students who have answered a question', () => {
        cy.get('[data-cy=question-level-feedback-button]').click();
        cy.get('[data-cy=student-answer]').first().should('contain', "No response");
        cy.get('[data-cy=feedback-badge]')
          .first()
          .should('be.empty');
        cy.get('[data-cy=student-answer]').eq(2).should('contain', "test answer 2");
        cy.get('[data-cy=feedback-badge]')
          .eq(2)
          .find('circle')
          .should('have.attr', 'fill')
          .and('include', '#FFF');
        cy.get('[data-cy=feedback-container]')
          .eq(2)
          .children('[data-cy=feedback-textarea]')
          .should('be.visible')
          .type('This is question-level feedback entered while viewing list by student.');
        cy.wait(2100);
        cy.get('[data-cy=activity-level-feedback-button]').click();
        cy.get('[data-cy=question-level-feedback-button]').click();
        cy.get('[data-cy=feedback-badge]')
          .eq(2)
          .find('circle')
          .should('have.attr', 'fill')
          .and('include', '#4EA15A');
        cy.get('[data-cy=feedback-container]')
          .eq(2)
          .children('[data-cy=feedback-textarea]')
          .should('contain', 'This is question-level feedback entered while viewing list by student.');
      });
      it('shows feedback textareas for a question that has been answered by a student', () => {
        cy.get('[data-cy=list-by-questions-toggle]').click();
        cy.get('[data-cy=next-student-button]').click();
        cy.get('[data-cy=student-response]').first().should('contain', "test answer 1");
        cy.get('[data-cy=feedback-badge]')
          .first()
          .find('circle')
          .should('have.attr', 'fill')
          .and('include', '#FFF');
        cy.get('[data-cy=feedback-container]')
          .first()
          .children('[data-cy=feedback-textarea]')
          .should('be.visible')
          .type('This is question-level feedback entered when viewing list by question.');
        cy.wait(2100);
        cy.get('[data-cy=list-by-student-toggle]').click();
        cy.get('[data-cy=list-by-questions-toggle]').click();
        cy.get('[data-cy=feedback-badge]')
          .first()
          .find('circle')
          .should('have.attr', 'fill')
          .and('include', '#4EA15A');
        cy.get('[data-cy=feedback-container]')
          .first()
          .children('[data-cy=feedback-textarea]')
          .should('contain', 'This is question-level feedback entered when viewing list by question.');
      });
    });
  });
  context('Standalone Activity', () => {
    describe('verify activity navigator section behaves correctly for standalone activities', () => {
      it('does not exist when viewing question-level feedback', ()=>{
        cy.visit("/?portal-dashboard&resourceType=activity");
        cy.get('[data-cy=navigation-select]').click();
        cy.get('[data-cy="list-item-feedback-report"]').click();
        cy.get('[data-cy=question-level-feedback-button]').should('be.visible').click();
        cy.get('[data-cy=activity-navigator]').should('not.exist');
      });
      it('exists but does not include title when viewing activity-level feedback', ()=>{
        cy.get('[data-cy=activity-level-feedback-button]').click();
        cy.get('[data-cy=activity-title]').should('be.empty');
      });
    });
  });
});