import { getByCypressTag } from "../../utils";

context("Portal Dashboard UI",()=>{
  before(()=>{
      cy.visit("/?portal-dashboard");
  });
  it('Portal Dashboard UI',()=>{
    cy.log("verify header loads");
    cy.get('[data-cy=dashboard-header]').should('be.visible');

    cy.log("verify level viewer loads");
    cy.get('[data-cy=level-viewer]').should('be.visible');
    
    cy.log("verify class nav loads");
    cy.get('[data-cy=class-nav]').should('be.visible');
    cy.get('[data-cy=choose-class]').should('be.visible');
    cy.get('[data-cy=sort-students]').should('be.visible');
    cy.get('[data-cy=anonymize-students]').should('be.visible');
    // Removed for MVP:
    // cy.get('[data-cy=students-feedback]').should('be.visible');
    // cy.get('[data-cy=students-feedback]').within(() => {
    //     cy.get('[data-cy=toggle-control]').click();
    // });

    cy.log("verify student list loads");
    cy.get('[data-cy=student-list]').should('be.visible');

    cy.log("verify progress legend loads");
    const progress=["Completed","In-progress", "Not-started"];
    cy.get('[data-cy=progress-legend]').should('be.visible');
    progress.forEach((prog)=>{
        cy.get('[data-cy="'+prog+'-legend"]').should('be.visible');
    });

    let numStudents = 6; //TODO: it would be better if numStudents is not hard coded.
    cy.log("verify number of students in a class loads");
    getByCypressTag('num-students').should('be.visible').and('contain', numStudents+ ' students');

    cy.log("verify menu is visible");
    cy.get('[data-cy=header-menu]').should('be.visible');

    cy.log("verify user name is visible");
    cy.get('[data-cy=account-owner').should('be.visible').and('not.be.empty');

    cy.log("verify menu opens on click");
    cy.get('[data-cy=header-menu]').click();
    cy.get('[data-cy="menu-list"]').should('be.visible');
  });
  it.skip('verify assignment dropdown is present',()=>{ //disabled the feature
    const assignment="report-test-sequence";
    cy.get("[data-cy=choose-assignment]").should('be.visible').click();
    cy.get("[data-cy=list-item-"+assignment+"]").should('be.visible');
  });
});