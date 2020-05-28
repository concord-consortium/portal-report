
context("Portal Dashboard UI",()=>{
    before(()=>{
        cy.visit("/?portal-dashboard");
    });
    describe('header',()=>{
        it('verify header loads',()=>{
            cy.get('[data-test=dashboard-header]').should('be.visible');
        });
    });
    describe('level viewer',()=>{
        it('verify level viewer loads',()=>{
            cy.get('[data-test=level-viewer]').should('be.visible');
        });
    });
    describe('class nav',()=>{
        it('verify class nav loads',()=>{
            cy.get('[data-test=class-nav]').should('be.visible');
            cy.get('[data-test=sort-students]').should('be.visible');
        });
    });
    describe('student list',()=>{
        it('verify student list loads',()=>{
            cy.get('[data-test=student-list]').should('be.visible');
        });
    });
    describe('progress',()=>{
        it('verify progress legend loads',()=>{
            const progress=["Completed","In progress", "Not yet started"];
            cy.get('[data-test=progress-legend]').should('be.visible');
            progress.forEach((prog)=>{
                cy.get('[data-test="'+prog+'-legend"]').should('be.visible');
            });
        });
    });
});
