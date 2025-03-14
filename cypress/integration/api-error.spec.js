context("Test api error", () => {
  context("when an invalid offering url is used", () => {
    before(() => {
      cy.visit("/?token=1234&offering=http://example.com");
    });
    it('shows an error message to user', () => {
      cy.contains("Connection to server failed");
    });
  });
  /*

  disabled for now so we can get a build

  context("when the server returns an error status code", () => {
    before(() => {
      cy.intercept(/[^=]https:\/\/fakeOfferingPath/, {statusCode: 500, body: "Cypress Fake Error"});
      cy.visit("/?token=1234&offering=https://fakeOfferingPath");
    });
    it('shows an error message to user', () => {
      cy.contains("Cypress Fake Error");
    });
  });
  */
});
