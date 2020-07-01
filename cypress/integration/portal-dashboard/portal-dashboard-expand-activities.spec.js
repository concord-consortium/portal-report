import { getByCypressTag } from "../../utils";

context("Portal Dashboard Activity Buttons",() =>{
    before(()=>{
        cy.visit("/?portal-dashboard");
    });

    it('verify we start with the the right number of closed activity buttons',() =>{
      cy.get('[data-cy=collapsed-activity-button]').should('be.visible');
      cy.get('[data-cy=collapsed-activity-button]').should('have.length', 2);
    });

    describe('when clicking on activity buttons', () =>{
      it('verify we can click to open an activity button and see it expanded',() =>{
        cy.get('[data-cy=collapsed-activity-button]').first().click();
        cy.get('[data-cy=expanded-activity-button]').should('have.length', 1);
        cy.get('[data-cy=expanded-activity-button]').first().should("contain", "Activity 1: Report Test Activity 1");
        cy.get('[data-cy=collapsed-activity-button]').should('have.length', 1);
        cy.get('[data-cy=activity-question-button]').should('be.visible');
        cy.get('[data-cy=activity-question-button]').should('have.length', 8);
        cy.get('[data-cy=activity-question-button]').first().should("contain", "Q1");
      });

      it('verify we can click to open the other activity button and the first collapses',() =>{
        cy.get('[data-cy=collapsed-activity-button]').first().click();
        cy.get('[data-cy=expanded-activity-button]').should('have.length', 1);
        cy.get('[data-cy=expanded-activity-button]').first().should("contain", "Activity 2: Report Test Activity 2");
        cy.get('[data-cy=collapsed-activity-button]').should('have.length', 1);
        cy.get('[data-cy=activity-question-button]').should('be.visible');
        cy.get('[data-cy=activity-question-button]').should('have.length', 3);
      });
    });
});
