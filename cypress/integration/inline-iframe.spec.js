import React from "react";
import { getByCypressTag } from "../utils";
import ReportBody from "../support/elements/portal-report/report-body";

context("Iframe questions test", () => {

  beforeEach(() => {
      cy.visit("/");
      cy.fixture("sequence-structure.json").as("sequenceData");
      cy.fixture("small-class-data.json").as("classData");
      cy.fixture("answers.json").as("answerData");
  });

  const body = new ReportBody();

  it("shows the toggle and external links for an iframe with saved learner state", () => {
    body.openAnswersForQuestion("question-mw_interactive_19");
    cy.get(".iframe-answer").should("be.visible");
    cy.get(".iframe-answer").should("contain", "View Work");
    cy.get(".iframe-answer").should("contain", "Open in new tab");
    cy.get(".iframe-answer").should("not.contain", "View work in new tab");
  });

  it("can toggle the iframe visibility", () => {
    body.openAnswersForQuestion("question-mw_interactive_19");
    cy.get(".iframe-answer a[data-cy=toggleIframe]").first().click({force: true});
    cy.get(".iframe-answer iframe").should("be.visible")
      .and('have.attr', 'src', 'https://models-resources.concord.org/table-interactive/index.html');
  });

  it("has the correct url for the external link", () => {
    body.openAnswersForQuestion("question-mw_interactive_19");
    cy.get(".iframe-answer a[data-cy=standaloneIframe]").first().then((link) => {
      expect(link[0].href.indexOf("iframeQuestionId=mw_interactive_19&studentId=1")).to.be.above(-1);
    });
  });

  it("shows the external links for an iframe with saved learner url", () => {
    body.openAnswersForQuestion("question-mw_interactive_22");
    cy.get(".iframe-answer").should("be.visible");
    cy.get(".iframe-answer").should("contain", "View work in new tab");
  });

  it("has the correct url for the external link for a saved learner url", () => {
    body.openAnswersForQuestion("question-mw_interactive_22");
    cy.get(".iframe-answer a[data-cy=externalIframe]").first()
      .should('have.attr', 'href', 'https://codap.concord.org/releases/staging/static/dg/en/cert/index.html#file=lara:eyJyZWNvcmRpZCI6MzM3MDQsImFjY2Vzc0tleXMiOnsicmVhZE9ubHkiOiJhMDFmNzAxZWY3MDQ3YjczNDllODRkMjdiZWMwYzk5YzliZjg5ODM2In19');
  });
});
