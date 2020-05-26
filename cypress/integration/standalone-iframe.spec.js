import React from "react";
import { getByCypressTag } from "../utils";

describe("Opening stand-alone iframe question with saved state", function() {
  beforeEach(() => {
    cy.visit("/?iframeQuestionId=mw_interactive_19&studentId=1");
  });

  it("should show an iframe with the base url", function() {
    getByCypressTag("standaloneIframe").should("be.visible");
    cy.get("iframe").should("exist")
      .and('have.attr', 'src', 'https://models-resources.concord.org/table-interactive/index.html');
  });
});

describe("Opening stand-alone iframe question with saved learner url", function() {
  beforeEach(() => {
    cy.visit("/?iframeQuestionId=mw_interactive_22&studentId=1");
  });

  it("should show an iframe with the saved url", function() {
    getByCypressTag("standaloneIframe").should("be.visible");
    cy.get("iframe").should("exist")
      .and('have.attr', 'src', 'https://codap.concord.org/releases/staging/static/dg/en/cert/index.html#file=lara:eyJyZWNvcmRpZCI6MzM3MDQsImFjY2Vzc0tleXMiOnsicmVhZE9ubHkiOiJhMDFmNzAxZWY3MDQ3YjczNDllODRkMjdiZWMwYzk5YzliZjg5ODM2In19');
  });
});

describe("Opening non-existant iframe question", function() {
  beforeEach(() => {
    cy.visit("/?iframeQuestionId=none&studentId=none");
  });

  it("should show an error", function() {
    getByCypressTag("dataError").should("be.visible");
    getByCypressTag("dataError").should("contain", "No data for question 'none' by student 'none'");
    cy.get("iframe").should("not.exist");
  });
});
