import { getByCypressTag } from "../utils";

context("Portal Dashboard Activity Buttons",()=>{
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
        .should("contain", "1/6");
      cy.get('[data-cy=student-answers-row]')
        .eq(5)
        .should("contain", "5/6");
    });

    it('verify we display the correct student answer icons',()=>{
      cy.get('[data-cy=collapsed-activity-button]').first().click();

      cy.get('[data-cy=student-answers-row]')
        .eq(2)
        .get('[data-cy=student-answer]')
        .eq(0)
        .get('[data-cy=open-response-complete]').should('be.visible');
      cy.get('[data-cy=student-answers-row]')
        .eq(2)
        .get('[data-cy=student-answer]')
        .eq(1)
        .get('[data-cy=multiple-choice-non-scored]').should('be.visible');
      cy.get('[data-cy=student-answers-row]')
        .eq(2)
        .get('[data-cy=student-answer]')
        .eq(2)
        .get('[data-cy=multiple-choice-incorrect]').should('be.visible');
      cy.get('[data-cy=student-answers-row]')
        .eq(2)
        .get('[data-cy=student-answer]')
        .eq(3)
        .get('[data-cy=open-response-complete]').should('be.visible');
      cy.get('[data-cy=student-answers-row]')
        .eq(2)
        .get('[data-cy=student-answer]')
        .eq(4)
        .get('[data-cy=image-open-response-complete]').should('be.visible');
      cy.get('[data-cy=student-answers-row]')
        .eq(2)
        .get('[data-cy=student-answer]')
        .eq(4)
        .get('[data-cy=interactive-complete]').should('be.visible');

      cy.get('[data-cy=student-answers-row]')
        .eq(5)
        .get('[data-cy=student-answer]')
        .eq(2)
        .get('[data-cy=multiple-choice-correct]').should('be.visible');
    });
});
