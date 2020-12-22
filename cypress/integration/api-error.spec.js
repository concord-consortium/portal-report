context("Test api error", () => {
  context("when an invalid offering url is used", () => {
    before(() => {
      cy.visit("/?offering=http://example.com");
    });
    it('shows an error message to user', () => {
      cy.contains("Connection to server failed");
    });
  });
});
