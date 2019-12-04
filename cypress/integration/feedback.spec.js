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
    cy.get("#feedbackEnabled").check();
    feedback.getScoredStudentsCount().should("be.visible").and("contain", "0");
    cy.get(".feedback-row").first().within(() => {
      cy.get("[data-cy=feedbackBox]").type("Your answer was great!").blur();
      cy.get(".feedback-complete input").check();
    });
    feedback.getScoredStudentsCount().should("be.visible").and("contain", "1");
  });

  it("shows the same question level score after closing and opening the dialog", function() {
    // Note: I'm not using the feedback helper object. I'm not sure it is really worth it
    cy.get(".question [data-cy=feedbackButton]").first().click();
    cy.get("#giveScore").check();

    // Give Jenkins a score 10 on one question
    cy.get(".feedback-row:contains('Jenkins')").within(() => {
      cy.get("[data-cy=question-feedback-score] input").type("10");
      cy.get(".feedback-complete input").check();
    });
    cy.get("[data-cy=feedback-done-button]").click();

    // Open the feedback for a another question
    cy.get(".question [data-cy=feedbackButton]").eq(1).click();
    cy.get("#giveScore").check();
    cy.get("[data-cy=feedback-done-button]").click();

    cy.get(".question [data-cy=feedbackButton]").first().click();
    cy.get("#all").check();
    cy.get(".feedback-row:contains('Jenkins')").within(() => {
      cy.get("[data-cy=question-feedback-score] input").should("have.value", "10");
    });
  });

  it("shows the same max question score after closing and opening the dialog", function() {
    // Note: I'm not using the feedback helper object. I'm not sure it is really worth it
    cy.get(".question [data-cy=feedbackButton]").first().click();
    cy.get("#giveScore").check();
    cy.get(".max-score-input").should("have.value", "10");
    cy.get(".max-score-input").clear().type("11");
    cy.get("[data-cy=feedback-done-button]").click();

    // Open the feedback for a another question
    cy.get(".question [data-cy=feedbackButton]").eq(1).click();
    cy.get("#giveScore").check();
    cy.get(".max-score-input").clear().type("12");
    cy.get("[data-cy=feedback-done-button]").click();

    cy.get(".question [data-cy=feedbackButton]").first().click();
    cy.get(".max-score-input").should("have.value", "11");
  });

  it("shows the same activity level score after closing and opening the dialog", function() {
    // Note: I'm not using the feedback helper object. I'm not sure it is really worth it
    cy.get("[data-cy=feedbackButton]:contains('overall')").first().click();
    cy.get("#giveScore").check();

    // Give Jenkins a score 12 on activity 1
    cy.get(".feedback-row:contains('Jenkins')").within(() => {
      cy.get("[data-cy=question-feedback-score] input").type("12");
      cy.get(".feedback-complete input").check();
    });
    cy.get("[data-cy=feedback-done-button]").click();

    // Give Jenkins a score 13 on activity 2
    cy.get("[data-cy=feedbackButton]:contains('overall')").eq(1).click();
    cy.get("#giveScore").check();
    cy.get(".feedback-row:contains('Jenkins')").within(() => {
      cy.get("[data-cy=question-feedback-score] input").type("13");
      cy.get(".feedback-complete input").check();
    });
    cy.get("[data-cy=feedback-done-button]").click();

    // Check original score is remembered
    cy.get("[data-cy=feedbackButton]:contains('overall')").first().click();
    cy.get("#all").check();
    cy.get(".feedback-row:contains('Jenkins')").within(() => {
      cy.get("[data-cy=question-feedback-score] input").should("have.value", "12");
    });
  });

  it("shows the same max activity score after closing and opening the dialog", function() {
    // Note: I'm not using the feedback helper object. I'm not sure it is really worth it
    cy.get("[data-cy=feedbackButton]:contains('overall')").first().click();
    cy.get("#giveScore").check();
    cy.get("[data-cy=manual-score-option]").check();

    // for some reason the following clear fails sometimes in travis with a detached
    // element error. The clear should wait 4 seconds for the element to be 'actionable',
    // but that isn't working properly. So here is an explicit check to see if it helps
    // or reveals more infomration.
    cy.get(".max-score-input").should("be.enabled");
    cy.get(".max-score-input").clear().type("13");
    cy.get("[data-cy=feedback-done-button]").click();

    // Open the second activity feedback box, just to make sure they aren't sharing
    // data for some reason
    cy.get("[data-cy=feedbackButton]:contains('overall')").eq(1).click();
    cy.get("#giveScore").check();
    cy.get("[data-cy=manual-score-option]").check();
    cy.get(".max-score-input").clear().type("14");
    cy.get("[data-cy=feedback-done-button]").click();

    cy.get("[data-cy=feedbackButton]:contains('overall')").first().click();
    cy.get(".max-score-input").should("have.value", "13");
  });

  it("shows the max activity score based on the sum of question max scores", function() {
    // Note: I'm not using the feedback helper object. I'm not sure it is really worth it
    cy.get(".question [data-cy=feedbackButton]").eq(0).click();
    cy.get("#giveScore").check();
    cy.get(".max-score-input").clear().type("9");
    cy.get("[data-cy=feedback-done-button]").click();

    cy.get(".question [data-cy=feedbackButton]").eq(1).click();
    cy.get("#giveScore").check();
    cy.get(".max-score-input").clear().type("8");
    cy.get("[data-cy=feedback-done-button]").click();

    // Turn on automatic scoring at the activity Level
    cy.get("[data-cy=feedbackButton]").first().click();
    cy.get("#giveScore").check();
    cy.get("[data-cy=automatic-score-option]").check();
    cy.get(".max-score-input").should("have.value", "17").and("be.disabled");

    // Switch to manual scoring
    cy.get("[data-cy=manual-score-option]").check();
    // FIXME: specify what the max score should start out with
    cy.get(".max-score-input").should("be.enabled");
    cy.get(".max-score-input").clear().type("19");

    // Switch automatic scoring
    cy.get("[data-cy=automatic-score-option]").check();
    cy.get(".max-score-input").should("have.value", "17").and("be.disabled");

    // Switch to manual scoring
    cy.get("[data-cy=manual-score-option]").check();

    // TODO: It would be nice if the manually entered max score was remembered incase the user
    // clicks the automatic scoring option by mistake. However currently this doesn't
    // work
    // cy.get(".max-score-input").should("have.value", "19").and("be.enabled");

  });

  it("Allows teacher to use the sum of question scores as the activity score", function() {
    // Note: I'm not using the feedback helper object. I'm not sure it is really worth it
    cy.get(".question [data-cy=feedbackButton]").first().click();
    cy.get("#giveScore").check();

    // Give Jenkins a score 10 on one question
    cy.get(".feedback-row:contains('Jenkins')").within(() => {
      cy.get("[data-cy=question-feedback-score] input").type("10");
      cy.get(".feedback-complete input").check();
    });
    cy.get("[data-cy=feedback-done-button]").click();

    // Turn on automatic scoring at the activity Level
    cy.get("[data-cy=feedbackButton]").first().click();
    cy.get("#giveScore").check();
    cy.get("[data-cy=automatic-score-option]").check();

    // Make sure the score for the activity is 10
    cy.get(".feedback-row:contains('Jenkins')").first().within(() => {
      cy.get("[data-cy=question-feedback-score] input").should("have.value", "10");
    });
  });

  it("Shows student the feedback and manual score from the teacher", function() {
    cy.get("[data-cy=feedbackButton]:contains('overall')").first().click();
    cy.get("#feedbackEnabled").check();
    cy.get("#giveScore").check();
    // Without this 'be.enable' check,
    // the clear on the .max-score-input gets a 'detached from dom' error.
    // Cypress does retry the clear for 4 seconds waiting for the element to be actionable.
    // The documentation implies this is the same as adding checks with should(...),
    // but it seems like these internal checks do not requery the dom
    // for the element, they just use the first element found by the get(...) call.
    // But the should(...) call does seem to cause the get(...) to requery the dom.
    // This makes some sense because the 'actionable' checks by clear should be fast,
    // and it would be slower to re-run the dom query on each check.
    // This is still confusing though and should at least be documented by Cypress.
    cy.get(".max-score-input").should("be.enabled");
    cy.get(".max-score-input").clear().type("14");

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
    cy.get(".maxScore").should("contain", "14");
  });

  it("Shows student the feedback and automatic score from the teacher", function() {
    // Provide feedback on Question 1
    cy.get(".question [data-cy=feedbackButton]").eq(0).click();
    cy.get("#feedbackEnabled").check();
    cy.get("#giveScore").check();
    cy.get(".max-score-input").clear().type("9");
    feedback.getScoredStudentsCount().should("be.visible").and("contain", "0");
    cy.get(".feedback-row:contains('Jenkins')").first().within(() => {
      cy.get("[data-cy=feedbackBox]").type("Your work on Question 1 was great!").blur();
      cy.get("input.score-input").clear().type("3");
      // TODO improve the feedbackBox so it doesn't wait a second before sending
      // the data to the store
      cy.wait(1000);
      cy.get(".feedback-complete input").check();
    });
    feedback.getScoredStudentsCount().should("be.visible").and("contain", "1");
    cy.get("[data-cy=feedback-done-button]").click();

    // Provide feedback on Question 2
    cy.get(".question [data-cy=feedbackButton]").eq(1).click();
    cy.get("#feedbackEnabled").check();
    cy.get("#giveScore").check();
    cy.get(".max-score-input").clear().type("8");
    cy.get(".feedback-row:contains('Jenkins')").first().within(() => {
      cy.get("[data-cy=feedbackBox]").type("Your work on Question 2 was great!").blur();
      cy.get("input.score-input").clear().type("4");
      // TODO improve the feedbackBox so it doesn't wait a second before sending
      // the data to the store
      cy.wait(1000);
      cy.get(".feedback-complete input").check();
    });
    feedback.getScoredStudentsCount().should("be.visible").and("contain", "1");
    cy.get("[data-cy=feedback-done-button]").click();

    // Turn on automatic scoring and text feedback at the activity Level
    cy.get("[data-cy=feedbackButton]").first().click();
    cy.get("#feedbackEnabled").check();
    cy.get("#giveScore").check();
    cy.get("[data-cy=automatic-score-option]").check();

    // Provide activity level feedback
    feedback.getScoredStudentsCount().should("be.visible").and("contain", "0");
    cy.get(".feedback-row:contains('Jenkins')").first().within(() => {
      cy.get("[data-cy=feedbackBox]").type("Your work was great!").blur();
      cy.get(".feedback-complete input").check();
    });
    feedback.getScoredStudentsCount().should("be.visible").and("contain", "1");
    cy.get("[data-cy=feedback-done-button]").click();
    // We need to make sure the api call which saves the feedback actually is called
    // before the page changes. Ideally there'd be something on the page we could watch
    // Since I can't find anything a wait is necessary
    cy.wait(1000);

    // Open the student page
    cy.visit("/?studentId=1&enableFirestorePersistence=true");
    cy.get(".act-feedback-panel").should("contain", "Your work was great!");
    cy.get(".act-feedback-panel .studentScore").should("contain", "7");
    cy.get(".act-feedback-panel .maxScore").should("contain", "17");
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
