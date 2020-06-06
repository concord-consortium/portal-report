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

    describe('paginating between questions', () =>{
      it('verify the the previous button is disabled on first question',()=>{
        // cy.get('[data-cy=collapsed-activity-button]').first().click();
        cy.get('[data-cy=activity-question-button]').first().click();
        cy.get('[data-cy=question-overlay-previous-button]').should('be.visible');
        cy.get('[data-cy=question-overlay-next-button]').should('be.visible');
        cy.get('[data-cy=question-overlay]').should("contain", "Question #1");
        cy.get('[data-cy=question-overlay-previous-button]').click();
        cy.get('[data-cy=question-overlay]').should("contain", "Question #1");
      });

      it('verify we can page to the second question',()=>{
        cy.get('[data-cy=question-overlay]').should("contain", "Question #1");
        cy.get('[data-cy=question-overlay-next-button]').click();
        cy.get('[data-cy=question-overlay]').should("contain", "Question #2");
      });

      it('verify we can page back to the first question',()=>{
        cy.get('[data-cy=question-overlay]').should("contain", "Question #2");
        cy.get('[data-cy=question-overlay-previous-button]').click();
        cy.get('[data-cy=question-overlay]').should("contain", "Question #1");
      });

      it('verify we can page first from last question of an activity',()=>{
        cy.get('[data-cy=expanded-activity-button]').first().should("contain", "Activity 1: Report Test Activity 1");
        cy.get('[data-cy=activity-question-button]').eq(5).click({force: true});
        cy.get('[data-cy=question-overlay]').should("contain", "Question #6");
        cy.get('[data-cy=question-overlay-next-button]').click();
        cy.get('[data-cy=expanded-activity-button]').first().should("contain", "Activity 2: Report Test Activity 2");
        cy.get('[data-cy=question-overlay]').should("contain", "Question #1");
      });

      it('verify the last question of the last activity is disabled',()=>{
        cy.get('[data-cy=activity-question-button]').eq(1).click({force: true});
        cy.get('[data-cy=expanded-activity-button]').first().should("contain", "Activity 2: Report Test Activity 2");
        cy.get('[data-cy=question-overlay]').should("contain", "Question #2");
        cy.get('[data-cy=question-overlay-next-button]').click();
        cy.get('[data-cy=question-overlay]').should("contain", "Question #2");
      });

      it('verify we can page back from the first question of a later activity',()=>{
        cy.get('[data-cy=activity-question-button]').eq(0).click({force: true});
        cy.get('[data-cy=expanded-activity-button]').first().should("contain", "Activity 2: Report Test Activity 2");
        cy.get('[data-cy=question-overlay]').should("contain", "Question #1");
        cy.get('[data-cy=question-overlay-previous-button]').click();
        cy.get('[data-cy=expanded-activity-button]').first().should("contain", "Activity 1: Report Test Activity 1");
        cy.get('[data-cy=question-overlay]').should("contain", "Question #6");
      });
    });
});