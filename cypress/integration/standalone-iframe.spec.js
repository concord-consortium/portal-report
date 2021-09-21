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

describe("Opening stand-alone open response answer", function() {
  beforeEach(() => {
    cy.visit("/?iframeQuestionId=open_response_60&studentId=1");
  });

  it("should show the text of the answer", function() {
    getByCypressTag("standaloneIframe")
      .should("be.visible")
      .should("have.text", "test answer 1");
  });
});

describe("Opening stand-alone multiple choice answer", function() {
  beforeEach(() => {
    cy.visit("/?iframeQuestionId=multiple_choice_19&studentId=1");
  });

  it("should show the text of the answer", function() {
    getByCypressTag("standaloneIframe")
      .should("be.visible")
      .should("have.text", "b");
  });
});

describe("Opening stand-alone image question answer", function() {
  beforeEach(() => {
    cy.visit("/?iframeQuestionId=image_question_2&studentId=1");
  });

  it("should show the the answer", function() {
    getByCypressTag("standaloneIframe")
      .should("be.visible")
      .find("img")
      .should("have.attr", "src", "https://ccshutterbug.s3.amazonaws.com/1559832112573-671081.png");

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
