import { getByCypressTag } from "../utils";

context("Portal Dashboard Question Details Panel",()=>{
    before(()=>{
        cy.visit("/?portal-dashboard");
    });

    describe('opening and closing the question details panel', () =>{
      it('verify we can click to open a question and see the question tab expanded',()=>{
        cy.get('[data-cy=question-overlay-header]').should('not.be.visible');
        cy.get('[data-cy=collapsed-activity-button]').first().click();
        cy.get('[data-cy=activity-question-button]').first().click();
        cy.get('[data-cy=question-overlay-header]').should('be.visible');
        cy.get('[data-cy=question-overlay]').should("contain", "Question #1");
      });

      it('verify we can click to open a second question',() =>{
        cy.get('[data-cy=question-overlay-header]').should('be.visible');
        cy.get('[data-cy=activity-question-button]').eq(1).click();
        cy.get('[data-cy=question-overlay-header]').should('be.visible');
        cy.get('[data-cy=question-overlay]').should("contain", "Question #2");
      });

      it('verify we can click to close the question details panel',() =>{
        cy.get('[data-cy=question-overlay-header]').first().click();
        cy.get('[data-cy=question-overlay-header]').should('not.be.visible');
      });
    });
});
