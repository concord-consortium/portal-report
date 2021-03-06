import React from "react";
import { getByCypressTag } from "../utils";

describe("Open Students button", function() {
  let initialHeight = 0;
  beforeEach(() => {
    cy.visit("/?dashboard=true");
  });

  it("Expands students after click, and then closes them again", function() {
    getByCypressTag("studentName").first().then((row) => {
      initialHeight = row.height();
      cy.contains("Open Students").click();
      // There is an animation here, but cypress will automatically retry until they pass
      getByCypressTag("studentName").first().invoke("height").should("be.gt", initialHeight);
      getByCypressTag("studentName").last().invoke("height").should("be.gt", initialHeight);
      cy.contains("Close Students").click();
      // There is an animation here, but cypress will automatically retry until they pass
      getByCypressTag("studentName").first().invoke("height").should("be.eq", initialHeight);
      getByCypressTag("studentName").last().invoke("height").should("be.eq", initialHeight);
    });
  });
});
