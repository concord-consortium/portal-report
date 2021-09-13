context("Test api error", () => {
  context("when an invalid offering url is used", () => {
    before(() => {
      cy.visit("/?token=1234&offering=http://example.com");
    });
    it('shows an error message to user', () => {
      cy.contains("Connection to server failed");
    });
  });
  context("when the server returns an error status code", () => {
    before(() => {
      cy.intercept(/[^=]\/fakeOfferingPath/, {statusCode: 500, body: "Cypress Fake Error"});
      cy.visit("/?token=1234&offering=/fakeOfferingPath");
    });
    it('shows an error message to user', () => {
      cy.contains("Cypress Fake Error");
    });
  });
});
