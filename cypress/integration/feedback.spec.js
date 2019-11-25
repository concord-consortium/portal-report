/* global describe, it, beforeEach, cy, expect */
/* eslint-disable-next-line */
import React from "react";
// import fakeData from "../../js/data/report.json";
import sampleRubric from "../../public/sample-rubric";
import Feedback from "../support/elements/portal-report/feedback";
import * as firebase from "firebase";

describe("Provide Feedback", function() {
  const feedback = new Feedback();

  beforeEach(() => {
    // cypress currently doesn't handle window.fetch so:
    // disable browser's fetch this way the fetch polyfill is used which uses XHR
    cy.on("window:before:load", win => {
      win.fetch = null;
    });

    cy.on("window:load", win => {
      // expose firebase to the window to help with debugging tests
      win.firebase = firebase;
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
    cy.visit(`/?reportUrl=${encodeURIComponent(fakeServer)}` +
      "&enableFirestorePersistence=true&clearFirestorePersistence=true");
  });

  it("Is visible", function() {
    cy.get(".question [data-cy=feedbackButton]").should("be.visible");
  });

  it("Allows teacher to provide written feedback on the activity", function() {
    cy.get("[data-cy=feedbackButton]:contains('overall')").first().click();
    cy.get("#feedbackEnabled").click();
    feedback.getScoredStudentsCount().should("be.visible").and("contain", "0");
    cy.get(".feedback-row").first().within(() => {
      cy.get("[data-cy=feedbackBox]").type("Your work was great!").blur();
      cy.get(".feedback-complete input").check();
    });
    feedback.getScoredStudentsCount().should("be.visible").and("contain", "1");
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

  it("Shows student the feedback from the teacher", function() {
    cy.get("[data-cy=feedbackButton]:contains('overall')").first().click();
    cy.get("#feedbackEnabled").check();
    cy.get("#giveScore").check();
    feedback.getScoredStudentsCount().should("be.visible").and("contain", "0");
    cy.get(".feedback-row:contains('Galloway')").first().within(() => {
      cy.get("[data-cy=feedbackBox]").type("Your work was great!").blur();
      cy.get("input.score-input").clear().type("5");
      // TODO improve the feedbackBox so it doesn't wait a second before sending
      // the data to the store
      cy.wait(1000);
      cy.get(".feedback-complete input").check();
    });
    feedback.getScoredStudentsCount().should("be.visible").and("contain", "1");

    // Open the student page
    cy.visit("/?studentId=3&enableFirestorePersistence=true");
    cy.get(".act-feedback-panel").should("contain", "Your work was great!");
    cy.get(".studentScore").should("contain", "5");
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
