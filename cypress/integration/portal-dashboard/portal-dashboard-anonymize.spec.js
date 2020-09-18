context("Portal Dashboard Anonymous Mode",() =>{
    before(()=>{
        cy.visit("/?portal-dashboard");
    });

    it('verify we start in normal mode',()=>{
      cy.get('[data-cy=student-name]').eq(0).should("contain", "Armstrong, Jenna");
      cy.get('[data-cy=student-name]').eq(1).should("contain", "Crosby, Kate");
      cy.get('[data-cy=student-name]').eq(2).should("contain", "Galloway, Amy");
      cy.get('[data-cy=student-name]').eq(3).should("contain", "Jenkins, John");
      cy.get('[data-cy=student-name]').eq(4).should("contain", "Ross, John");
      cy.get('[data-cy=student-name]').eq(5).should("contain", "Wu, Jerome");
    });

    it('verify we enter anonymous mode',()=>{
      cy.get('[data-cy=anonymize-students]').eq(0).within(() => {
        cy.get('[data-cy=toggle-control]').click();
      });
      cy.get('[data-cy=student-name]')
        .each(function(student, i) {
          cy.get(student).should("contain", "Student");
        });
    });

    it('verify we return to normal mode',()=>{
      cy.get('[data-cy=anonymize-students]').eq(0).within(() => {
        cy.get('[data-cy=toggle-control]').click();
      });
      cy.get('[data-cy=student-name]').eq(0).should("contain", "Armstrong, Jenna");
      cy.get('[data-cy=student-name]').eq(1).should("contain", "Crosby, Kate");
      cy.get('[data-cy=student-name]').eq(2).should("contain", "Galloway, Amy");
      cy.get('[data-cy=student-name]').eq(3).should("contain", "Jenkins, John");
      cy.get('[data-cy=student-name]').eq(4).should("contain", "Ross, John");
      cy.get('[data-cy=student-name]').eq(5).should("contain", "Wu, Jerome");
    });

});
