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
        cy.get('[data-cy=activity-question-button]').eq(6).click({force: true});
        cy.get('[data-cy=question-overlay]').should("contain", "Question #7");
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
        cy.get('[data-cy=question-overlay]').should("contain", "Question #7");
      });
    });
    describe('footer elements',()=>{
      it('button should open all student responses popup',()=>{ //functionality is tested in the all-responses-popup.spec
        cy.get('[data-cy=view-all-student-responses-button]').should('be.visible');
      });
    });
    describe('Question area',()=>{
      before(()=>{
        cy.get('[data-cy=question-overlay-previous-button]').click().click();
      });
      it('verify question area is visible',()=>{
        cy.get('[data-cy=question-overlay] [data-cy=question-title]').should('be.visible');
        cy.get('[data-cy=question-overlay] [data-cy=question-content]').should('be.visible');
        cy.get("[data-cy=question-overlay] [data-cy=open-activity-button]").should('be.visible');
        cy.get("[data-cy=question-overlay] [data-cy=open-teacher-edition-button]").should('be.visible');
      });
      it('verify show/hide button behaves correctly',()=>{
        cy.get('[data-cy=question-overlay] [data-cy=show-hide-question-button]').should('be.visible').click();
        cy.get('[data-cy=question-overlay] [data-cy=question-title]').should('not.be.visible');
        cy.get('[data-cy=question-overlay] [data-cy=question-content]').should('not.be.visible');
        cy.get('[data-cy=question-overlay] [data-cy=show-hide-question-button]').should('be.visible').click();
        cy.get('[data-cy=question-overlay] [data-cy=question-title]').should('be.visible');
        cy.get('[data-cy=question-overlay] [data-cy=question-content]').should('be.visible');
      });
    });
});
