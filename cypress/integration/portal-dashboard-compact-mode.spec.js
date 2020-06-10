context("Portal Dashboard Compact Mode",() =>{
    before(()=>{
        cy.visit("/?portal-dashboard");
    });

    it('verify we start in non-compact response table mode',()=>{
      cy.get('[data-cy=student-answers-row]').should(($el) => {
        expect($el).to.have.css('height', "44px");
      });
    });

    it('verify we enter compact response table mode on menu item click',()=>{
        cy.get('[data-cy=header-menu]').click();
        cy.get('[data-cy="compact-menu-item"]').should('be.visible').click();

        cy.get('[data-cy=student-answers-row]').should(($el) => {
          expect($el).to.have.css('height', "32px");
        });
    });

});
