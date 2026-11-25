import React from "react";
import { getByCypressTag } from "../utils";

describe("Sort By dropdown", function() {
  beforeEach(() => {
    cy.visit("/?dashboard=true");
  });

  it("Is visible", function() {
    getByCypressTag("sortDropdown").should("be.visible");
  });
});
