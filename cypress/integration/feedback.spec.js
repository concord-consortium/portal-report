/* global describe, it, beforeEach, cy, expect */
/* eslint-disable-next-line */
import React from "react";
// import fakeData from "../../js/data/report.json";
import sampleRubric from "../../public/sample-rubric";

describe("Provide Feedback", function() {
  beforeEach(() => {
    // cypress currently doesn't handle window.fetch so:
    // disable browser's fetch this way the fetch polyfill is used which uses XHR
    cy.on("window:before:load", win => {
      win.fetch = null;
    });

    cy.server();

    // Return the fake report data
    // cy.route({
    //   method: "GET",
    //   url: "/",
    //   response: fakeData
    // });
    //
    // // Fake report data references sample-rubric.json file, so it has to be stubbed too
    // cy.route({
    //   method: "GET",
    //   url: "/sample-rubric.json",
    //   response: sampleRubric
    // });

    // On first load portal-report does a PUT request to save some report settings
    cy.route({
      method: "PUT",
      url: "/",
      response: {}
    }).as("putReportSettings");

    let fakeServer = "http://portal.test";
    cy.visit(`/?reportUrl=${encodeURIComponent(fakeServer)}`);
  });

  it("Is visible", function() {
    cy.get(".question [data-cy=feedbackButton]").should("be.visible");
  });

  it("Shows dialog when clicked", function() {
    cy.get(".question [data-cy=feedbackButton]").first().click();
    cy.get(".feedback-panel").should("be.visible");
  });

  it.skip("Sends feedback to the server", function() {
    // This is the first put that happens when the UI is initialized
    cy.wait("@putReportSettings");
    cy.get(".question [data-cy=feedbackButton]").first().click();
    cy.get("[data-cy=feedbackBox]").first().type("Your answer was great!").blur();
    // This is the second put that happens when the user finishes typing
    cy.wait("@putReportSettings");
    cy.get("@putReportSettings").should((xhr) => {
      // Newer versions of Chai have a 'nested' chained method that would simplify this
      expect(xhr.requestBody).to.have.property("feedback");
      expect(xhr.requestBody.feedback).to.have.property("feedback", "Your answer was great!");
    });
  });

  it.skip("Shows error if feedback fails to send", function() {
    // This is the first put that happens when the UI is initialized
    cy.wait("@putReportSettings");

    cy.route({
      method: "PUT",
      url: "/",
      status: 403,
      response: {}
    });

    cy.get(".question [data-cy=feedbackButton]").first().click();
    cy.get("[data-cy=feedbackBox]").first().type("Your answer was great!").blur();
    cy.contains("Connection to server failed");
  });
});
