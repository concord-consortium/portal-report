context("Portal Dashboard Response Table",()=>{
  before(()=>{
      cy.visit("/?portal-dashboard");
  });

  it('verify we have the right number of student rows',()=>{
    cy.get('[data-cy=student-answers-row]').should('be.visible');
    cy.get('[data-cy=student-answers-row]').should('have.length', 6);
  });

  it('verify we display the correct student progress',()=>{
    cy.get('[data-cy=student-answers-row]')
      .eq(2)
      .should("contain", "1/7");
    cy.get('[data-cy=student-answers-row]')
      .eq(5)
      .should("contain", "5/7");
  });

  it('verify we display the correct student answer icons',()=>{
    cy.get('[data-cy=collapsed-activity-button]').first().click();

    cy.get('[data-cy=student-answers-row]')
      .eq(2)
      .get('[data-cy=student-answer]')
      .eq(0)
      .get('[data-cy=open-response-completed]').should('be.visible');
    cy.get('[data-cy=student-answers-row]')
      .eq(2)
      .get('[data-cy=student-answer]')
      .eq(1)
      .get('[data-cy=multiple-choice-nonscored-completed]').should('be.visible');
    cy.get('[data-cy=student-answers-row]')
      .eq(2)
      .get('[data-cy=student-answer]')
      .eq(2)
      .get('[data-cy=multiple-choice-scored-incorrect]').should('be.visible');
    cy.get('[data-cy=student-answers-row]')
      .eq(2)
      .get('[data-cy=student-answer]')
      .eq(3)
      .get('[data-cy=open-response-completed]').should('be.visible');
    cy.get('[data-cy=student-answers-row]')
      .eq(2)
      .get('[data-cy=student-answer]')
      .eq(4)
      .get('[data-cy=image-question-with-open-response-completed]').should('be.visible');
    cy.get('[data-cy=student-answers-row]')
      .eq(2)
      .get('[data-cy=student-answer]')
      .eq(4)
      .get('[data-cy=interactive-completed]').should('be.visible');

    cy.get('[data-cy=student-answers-row]')
      .eq(5)
      .get('[data-cy=student-answer]')
      .eq(2)
      .get('[data-cy=multiple-choice-scored-correct]').should('be.visible');
  });
});