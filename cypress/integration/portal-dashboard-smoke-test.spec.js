import { getByCypressTag } from "../utils";

context("Portal Dashboard UI",()=>{
    before(()=>{
        cy.visit("/?portal-dashboard");
    });
    describe('header',()=>{
        it('verify header loads',()=>{
            cy.get('[data-cy=dashboard-header]').should('be.visible');
        });
    });
    describe('level viewer',()=>{
        it('verify level viewer loads',()=>{
            cy.get('[data-cy=level-viewer]').should('be.visible');
        });
    });
    describe('class nav',()=>{
        it('verify class nav loads',()=>{
            cy.get('[data-cy=class-nav]').should('be.visible');
            cy.get('[data-cy=choose-class]').should('be.visible');
            cy.get('[data-cy=sort-students]').should('be.visible');
            cy.get('[data-cy=anonymize-students]').should('be.visible');
            cy.get('[data-cy=anonymize-students]').within(() => {
                cy.get('[data-cy=toggle-control]').click();
            });
            cy.get('[data-cy=student-name]')
                .each(function(student, i){
                    cy.get(student).should("contain", "Student");
                });
            cy.get('[data-cy=students-feedback]').should('be.visible');
            cy.get('[data-cy=students-feedback]').within(() => {
                cy.get('[data-cy=toggle-control]').click();
            });
        });
    });
    describe('student list',()=>{
        it('verify student list loads',()=>{
            cy.get('[data-cy=student-list]').should('be.visible');
        });
    });
    describe('progress',()=>{
        it('verify progress legend loads',()=>{
            const progress=["Completed","In-progress", "Not-yet-started"];
            cy.get('[data-cy=progress-legend]').should('be.visible');
            progress.forEach((prog)=>{
                cy.get('[data-cy="'+prog+'-legend"]').should('be.visible');
            });
        });
    });
    describe('Number of students in class',()=>{
        let numStudents = 6; //TODO: it would be better if numStudents is not hard coded.
        it('verify number of students in a class loads',()=>{
            getByCypressTag('num-students').should('be.visible').and('contain', numStudents+ ' students');
        });
    });
    describe('header area',()=>{
        it('verify menu is visible',()=>{
            cy.get('[data-cy=header-menu]').should('be.visible');
        });
        it('verify user name is visible',()=>{
            const teacher = 'Kristen Teachername';
            cy.get('[data-cy=account-owner').should('be.visible').and('contain',teacher);
        });
        it('verify menu opens on click',()=>{
            cy.get('[data-cy=header-menu]').click();
            cy.get('[data-cy="menu-list"]').should('be.visible');
        });
    });
});
