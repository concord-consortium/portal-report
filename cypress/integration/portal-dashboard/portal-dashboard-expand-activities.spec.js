import { getByCypressTag } from "../../utils";

context("Portal Dashboard Activity Buttons",() =>{
    before(()=>{
        cy.visit("/?portal-dashboard");
    });

    it('verify we start with the the right number of open and closed activity buttons',() =>{
      // The first activity button should be expanded by default. Additional buttons should be collapsed.
      cy.get('[data-cy=expanded-activity-button]').should('have.length', 1);
      cy.get('[data-cy=collapsed-activity-button]').should('have.length', 1);
      cy.get('[data-cy=expanded-activity-button]').first().should("contain", "Activity 1: Report Test Activity 1");
      cy.get('[data-cy=collapsed-activity-button]').first().should("contain", "Report Test Activity 2");
    });

    it('verify we can click to open a collapsed activity button, and any already-expanded button collapses',() =>{
      cy.get('[data-cy=activity-question-button]').should('be.visible');
      cy.get('[data-cy=activity-question-button]').should('have.length', 7);
      cy.get('[data-cy=activity-question-button]').first().should("contain", "Q1");
      cy.get('[data-cy=collapsed-activity-button]').first().click();
      cy.get('[data-cy=collapsed-activity-button]').should('have.length', 1);
      cy.get('[data-cy=collapsed-activity-button]').first().should("contain", "Report Test Activity 1");
      cy.get('[data-cy=expanded-activity-button]').should('have.length', 1);
      cy.get('[data-cy=expanded-activity-button]').first().should("contain", "Activity 2: Report Test Activity 2");
      cy.get('[data-cy=activity-question-button]').should('be.visible');
      cy.get('[data-cy=activity-question-button]').should('have.length', 12);
      cy.get('[data-cy=activity-question-button]').first().should("contain", "Q1");
    });

    it('verify the preview (external link) buttons are working',() =>{
      // Preview buttons are only available when the activity button is collapsed. So we check the collapsed button first,
      // then we expand that button, and check the newly-collapsed button for its preview link.
      cy.get('[data-cy=collapsed-activity-button]')
        .first()
        .find('[data-cy=external-link-button]')
        .should('have.attr', 'href')
        .and('include', 'http://app.lara.docker/activities/9');

      cy.get('[data-cy=collapsed-activity-button]').first().click();

      cy.get('[data-cy=collapsed-activity-button]')
        .first()
        .find('[data-cy=external-link-button]')
        .should('have.attr', 'href')
        .and('include', 'http://activity-player.concord.org?activity=http://app.lara.docker/activities/10&preview');
    });
});
