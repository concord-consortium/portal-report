context("Test api error", () => {
  context("when an invalid offering url is used", () => {
    before(() => {
      cy.visit("/?token=1234&offering=http://example.com");
    });
    it('shows an error message to user', () => {
      cy.contains("Connection to server failed");
    });
  });
});
