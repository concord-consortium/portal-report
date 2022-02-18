import React from "react";
import { getByCypressTag } from "../utils";

// This spec does not hit Firestore for the answers
// Because there is no offering url parameter, then the fakeOfferingData is used.
// And the fakeOfferingData results in a sourceKey of fake.authoring.system
// and when that is the sourceKey then the fake answers are returned here by:
// actions/index.ts
// Most of the tests also do not hit Firestore for the feedback because feedback is disabled for
// the standalone iframe view. But there is one hacky test at the end which requests
// feedback because it is requesting the full student report.  See that test for more
// information.
//
// 2021-12-17 NP: Firestore will **also** be used if there is a `runKey` url param.
//  in order to test logic in the anonymous run previews in the IFrameStandaloneApp
//  an additional url parameter `_useFakeDataForTest`
//  see `js/actions/index.ts:77` for more info.


describe("Opening stand-alone iframe question with saved state", function() {
  beforeEach(() => {
    cy.visit("/?iframeQuestionId=mw_interactive_19&studentId=1");
  });

  it("should show an iframe with the base url", function() {
    getByCypressTag("standaloneIframe").should("be.visible");
    cy.get("iframe").should("exist")
      .and('have.attr', 'src', 'https://models-resources.concord.org/table-interactive/index.html?view=standalone');
  });
});

describe("Opening stand-alone open response answer", function() {
  describe("When specifying an student answer run via studentId", () => {
    beforeEach(() => {
      cy.visit("/?iframeQuestionId=open_response_60&studentId=1");
    });

    it("should show the text of the answer", function() {
      getByCypressTag("standaloneIframe")
        .should("be.visible")
        .should("have.text", "test answer 1");
    });
  });

  describe("When specifying an anonymous user answer run via runKey", () => {
    beforeEach(() => {
      cy.visit("/?iframeQuestionId=open_response_60&runKey=1&_useFakeDataForTest=true");
    });

    it("should show the text of the answer", function() {
      getByCypressTag("standaloneIframe")
        .should("be.visible")
        .should("have.text", "test answer 1");
    });
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
      .and('have.attr', 'src', 'https://codap.concord.org/releases/staging/static/dg/en/cert/index.html#file=lara:eyJyZWNvcmRpZCI6MzM3MDQsImFjY2Vzc0tleXMiOnsicmVhZE9ubHkiOiJhMDFmNzAxZWY3MDQ3YjczNDllODRkMjdiZWMwYzk5YzliZjg5ODM2In19?view=standalone');
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

describe("HACK: exercise code which queries firestore for another student's work", function() {
  // The portal report supports a mode where the studentId does not match the platformUserId
  // and the user type is a learner. In this mode it checks to see if the answers from studentId
  // have been shared with the context. This is done using a "sharedWith": "context" field in
  // answer documents.
  // This isn't easy to test with our current test setup. When there is no offering url parameter
  // we use fake answer data and do not hit the firestore apis to get the answers. So the code
  // which adds the sharedWith logic cannot be covered with the tests above.
  // However, when viewing a full student report the feedback to the student is still queried
  // from firestore apis. This feedback querying is done with the same bit of code.
  // So if we view a student report with a studentId that doesn't match the platformUserId then
  // the feedback for this student will be requested.  This is a hack because in real life
  // we wouldn't share a teachers feedback with another student.
  // An additional note here is that the firestore apis have networking disabled because there is
  // no offering, activity, or class url parameters. So these tests will not actually hit the
  // real firestore database
  beforeEach(() => {
    cy.visit("/?studentId=3&fakeUserType=learner&fakePlatformUserId=1");
  });

  it("should not show an error", function () {
    cy.contains("Amy Galloway");
  });
});
