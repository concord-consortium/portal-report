context("Test anonymous user report", () => {
    before(() => {
        cy.fixture("sequence-structure.json").as("sequenceData");
        cy.visit("/?runKey=12345&answerSource=localhost");
    });
    describe("test anonymous user can open their own report", () => {
        it('Test correct user is shown', () => {
            cy.contains("Anonymous");
        });
    });
});
