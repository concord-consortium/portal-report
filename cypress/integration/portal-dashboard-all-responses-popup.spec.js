context("Portal Dashboard Question Details Panel",()=>{
    before(()=>{
        cy.visit("/?portal-dashboard");
    });
    context('All Responses Popup Header',()=>{
        it('verify popup opens from question overlay',()=>{
            cy.get('[data-cy=collapsed-activity-button]').first().click();
            cy.get('[data-cy=activity-question-button]').first().click();
            cy.get('[data-cy=question-overlay-header]').should('be.visible');
            cy.get('[data-cy=view-all-student-responses-button]').should('be.visible').click();
            cy.get('[data-cy=all-students-responses-toggle]').should('be.visible');
        });
        it('verify title is visible',()=>{
            cy.get('[data-cy=popup-header-title]').should('be.visible');
            //TODO Verify title should match the sequence/activity name from dashboard
        });
        //TODO Feedback toggle opens feedback view and vice versa
        it('verify close button closes popup',()=>{
            cy.get('[data-cy=close-popup-button]').should('be.visible').click();
            cy.get('[data-cy=popup-header-title]').should('not.be.visible');
        });
    });
});
