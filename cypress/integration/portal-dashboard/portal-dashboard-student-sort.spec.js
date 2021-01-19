context("Portal Dashboard Student Sort",() =>{
    before(()=>{
        cy.visit("/?portal-dashboard");
    });

    it('verify we start in normal sort mode',()=>{
      cy.get('[data-cy=student-name]').eq(0).should("contain", "Armstrong, Jenna");
      cy.get('[data-cy=student-name]').eq(1).should("contain", "Crosby, Kate");
      cy.get('[data-cy=student-name]').eq(2).should("contain", "Galloway, Amy");
      cy.get('[data-cy=student-name]').eq(3).should("contain", "Jenkins, John");
      cy.get('[data-cy=student-name]').eq(4).should("contain", "Ross, John");
      cy.get('[data-cy=student-name]').eq(5).should("contain", "Wu, Jerome");
    });

    it('verify we sort by most progress',()=>{
      cy.get('[data-cy=sort-students]').click();
      cy.get('[data-cy="list-item-most-progress"]').should('be.visible').click();
      cy.get('[data-cy=student-name]').eq(0).should("contain", "Jenkins, John");
      cy.get('[data-cy=student-name]').eq(1).should("contain", "Wu, Jerome");
      cy.get('[data-cy=student-name]').eq(2).should("contain", "Ross, John");
      cy.get('[data-cy=student-name]').eq(3).should("contain", "Armstrong, Jenna");
      cy.get('[data-cy=student-name]').eq(4).should("contain", "Crosby, Kate");
      cy.get('[data-cy=student-name]').eq(5).should("contain", "Galloway, Amy");
    });

    it('verify we sort by least progress',()=>{
      cy.get('[data-cy=sort-students]').click();
      cy.get('[data-cy="list-item-least-progress"]').should('be.visible').click();
      cy.get('[data-cy=student-name]').eq(0).should("contain", "Galloway, Amy");
      cy.get('[data-cy=student-name]').eq(1).should("contain", "Crosby, Kate");
      cy.get('[data-cy=student-name]').eq(2).should("contain", "Armstrong, Jenna");
      cy.get('[data-cy=student-name]').eq(3).should("contain", "Ross, John");
      cy.get('[data-cy=student-name]').eq(4).should("contain", "Wu, Jerome");
      cy.get('[data-cy=student-name]').eq(5).should("contain", "Jenkins, John");
    });

    it('verify we sort by awaiting feedback',()=>{
      cy.get('[data-cy=navigation-select]').click();
      cy.get('[data-cy="list-item-feedback-report"]').should('be.visible').click();
      cy.get('[data-cy=sort-feedback]').click();
      cy.get('[data-cy="list-item-awaiting-feedback"]').should('be.visible');
    });

});
