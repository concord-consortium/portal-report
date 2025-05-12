context("Portal Dashboard Content Scrolling",() =>{
  before(()=>{
      cy.visit("/?portal-dashboard");
  });

  it('verify we scroll and display proper content',()=>{
    cy.viewport(750, 750);

    cy.get('[data-cy=progress-table]').scrollTo('right');

    cy.get('[data-cy=collapsed-activity-button]').first().should('be.visible');
    cy.get('[data-cy=collapsed-activity-button]').first().should("contain", "2 Report Test");

    cy.get('[data-cy=collapsed-activity-button]').first().click();
    cy.wait(1000);
    cy.get('[data-cy=progress-table]').scrollTo('left');
    cy.get('[data-cy=collapsed-activity-button]').first().should('be.visible');
    cy.get('[data-cy=collapsed-activity-button]').first().should("contain", "1 Report Test");
  });

});
