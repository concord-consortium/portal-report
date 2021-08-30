context("Portal Dashboard Response Table",()=>{
  before(()=>{
      cy.visit("/?portal-dashboard");
  });

  it('verify we have the right number of student rows',()=>{
    cy.get('[data-cy=student-answers-row]').should('be.visible');
    cy.get('[data-cy=student-answers-row]').should('have.length', 6);
  });

  it('verify we display the correct student progress',()=>{
    cy.get('[data-cy=student-answers-row]')
      .eq(2)
      .should("contain", "2/7");
    cy.get('[data-cy=student-answers-row]')
      .eq(5)
      .should("contain", "5/7");
  });

  it('verify we display the correct student answer icons',()=>{
    cy.get('[data-cy=collapsed-activity-button]').first().click();

    cy.get('[data-cy=student-answers-row]')
      .eq(2)
      .get('[data-cy=student-answer]')
      .eq(0)
      .get('[data-cy=open-response-completed]').should('be.visible');
    cy.get('[data-cy=student-answers-row]')
      .eq(2)
      .get('[data-cy=student-answer]')
      .eq(1)
      .get('[data-cy=multiple-choice-nonscored-completed]').should('be.visible');
    cy.get('[data-cy=student-answers-row]')
      .eq(2)
      .get('[data-cy=student-answer]')
      .eq(2)
      .get('[data-cy=multiple-choice-scored-incorrect]').should('be.visible');
    cy.get('[data-cy=student-answers-row]')
      .eq(2)
      .get('[data-cy=student-answer]')
      .eq(3)
      .get('[data-cy=open-response-completed]').should('be.visible');
    cy.get('[data-cy=student-answers-row]')
      .eq(2)
      .get('[data-cy=student-answer]')
      .eq(4)
      .get('[data-cy=image-question-with-open-response-completed]').should('be.visible');
    cy.get('[data-cy=student-answers-row]')
      .eq(2)
      .get('[data-cy=student-answer]')
      .eq(4)
      .get('[data-cy=interactive-completed]').should('be.visible');
    cy.get('[data-cy=student-answers-row]')
      .eq(5)
      .get('[data-cy=student-answer]')
      .eq(2)
      .get('[data-cy=multiple-choice-scored-correct]').should('be.visible');
  });
  it('verify click on response icon opens question detail for student', ()=>{
    cy.get('[data-cy=open-response-completed]').eq(2).click();
    cy.get('[data-cy=openResponseText]').should('be.visible').and('contain', "test required answer 2");
    cy.get('[data-cy=student-name').should('contain', 'Jenkins, John');
    cy.get('[data-cy=multiple-choice-nonscored-completed]').eq(2).click();
    cy.get('[data-cy=multiple-choice-answers]').should('be.visible');
    cy.get('[data-cy=student-name').should('contain', 'Wu, Jerome');
    cy.get('[data-cy=question-overlay-header-button]').click();
  });
  it('verify click on student name opens response view with student answers', ()=>{
    cy.get('[data-cy=student-name]').contains('Galloway, Amy').click();
    cy.get('[data-cy=student-navigator] [data-cy=student-name]').should('contain','Galloway, Amy');
    cy.get('[data-cy=question-wrapper]').eq(0).should('contain', 'Q1');
    cy.get('[data-cy=student-response]').eq(0).should('contain', 'test answer 2');
  })
});

context("Feedback badges in response table", () => {
  before(()=>{
    cy.visit("/?portal-dashboard&enableFirestorePersistence=true&clearFirestorePersistence=true");
    cy.get("[data-cy=navigation-select]").click();
    cy.get("[data-cy=list-item-feedback-report]").click();
    cy.get("[data-cy=feedback-textarea]").eq(0).click().type("Good job!");
    cy.get("[data-cy=activity-level-feedback-button]").click();
    cy.get("[data-cy=feedback-textarea]").eq(0).click().type("Good job!");
    cy.get("[data-cy=navigation-select]").click();
    cy.get("[data-cy=list-item-progress-dashboard]").click();
  })

  it("Activity feedback badge appears in response table when there is feedback given", () => {
    cy.get("[data-cy=activity-feedback-badge]").should("be.visible");
  });
  it("Question feedback badge appears in response table when there is feedback given", () => {
    cy.get("[data-cy=collapsed-activity-button]").eq(0).click();
    cy.get("[data-cy=question-feedback-badge]").should("be.visible");
  });
});
