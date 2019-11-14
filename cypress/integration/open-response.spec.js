/* global describe, it, beforeEach, cy */
/* eslint-disable-next-line */
import React from "react";
import { getByCypressTag } from "../utils";

describe("Open response questions", function() {
  beforeEach(() => {
    cy.visit("/?dashboard=true");
  });

  it("Initially show a text icon", function() {
    cy.get(".icomoon-file-text").should("not.exist");
    getByCypressTag("activityName").first().click();
    cy.get(".icomoon-file-text").should("exist");
  });

  it("Expand to show full answer text", function() {
    cy.contains("test answer 2").should("not.exist");
    getByCypressTag("studentName").eq(2).click();
    cy.contains("test answer 2").should("exist");
  });
});
