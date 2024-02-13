import ReportBody from "../support/elements/portal-report/report-body";

describe("Compare or Project", function() {
  const body = new ReportBody();

  beforeEach(() => {
      cy.visit("/");
  });

  it("can open the compare dialog", () => {
    body.getShowResponses(0).click();
    // this should check everything (I hope)
    cy.get(".select-answer-column input").click({multiple: true});
    cy.get(".select-answer-column [data-cy='button']").first().click();
    cy.get(".compare-view").should("be.visible");
    cy.get(".compare-view").should("contain", "Amy Galloway");
    cy.get(".compare-view").should("contain", "John Jenkins");
  });
});
