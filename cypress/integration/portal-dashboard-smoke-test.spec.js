
context("Portal Dashboard UI",()=>{
    before(()=>{
        cy.visit("/?portal-dashboard");
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
