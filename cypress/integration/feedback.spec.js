/* global describe, it, beforeEach, cy, expect */
/* eslint-disable-next-line */
import React from "react";
// import fakeData from "../../js/data/report.json";
import sampleRubric from "../../public/sample-rubric";
import Feedback from "../support/elements/portal-report/feedback";

describe("Provide Feedback", function() {
  const feedback = new Feedback();

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

  it("Allows teacher to provide written feedback on a question", function() {
    cy.get(".question [data-cy=feedbackButton]").first().click();
    cy.get("#feedbackEnabled").click();
    feedback.getScoredStudentsCount().should("be.visible").and("contain", "0");
    cy.get(".feedback-row").first().within(() => {
      cy.get("[data-cy=feedbackBox]").type("Your answer was great!").blur();
      cy.get(".feedback-complete input").check();
    });
    feedback.getScoredStudentsCount().should("be.visible").and("contain", "1");
  });

  // with the switch to firestore this test needs to be updated
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
