import React from "react";
import { getByCypressTag } from "../utils";

describe("Multiple choice questions", function() {
  beforeEach(() => {
    cy.visit("/?dashboard=true");
  });

  it("Initially show a checkmark icon", function() {
    cy.get(".icomoon-checkmark2").should("not.exist");
    getByCypressTag("activityName").first().click();
    cy.get(".icomoon-checkmark2").should("exist");
  });

  it("Expand to show full answer text", function() {
    cy.contains("student's response").should("not.exist");
    getByCypressTag("studentName").eq(3).click(); // Jenkins, John
    cy.contains("bstudent's response").should("exist"); // b .... student's response
  });

  describe("when the question has all the choices deleted", function () {
    it("Expand to show full answer text", function() {
      cy.contains("student's response").should("not.exist");
      getByCypressTag("studentName").eq(4).click(); // Ross, John
      cy.contains("Question doesn't have any choices").should("exist");
    });
  });
});
