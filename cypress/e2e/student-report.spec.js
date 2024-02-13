import ReportBody from "../support/elements/portal-report/report-body";
import {
  getActivityData,
 } from "../utils";

 // This spec does not hit firestore for the answers
 // Because there is no offering url parameter, then the fakeOfferingData is used.
 // And the fakeOfferingData results in a sourceKey of fake.authoring.system
 // and when that is the sourceKey then the fake answers are returned by:
 // actions/index.ts

// However this spec does attempt to hit firestore for the feedback.
// Firestore queries are executed in the client side but the network is disabled because
// there is no "class", "offering", or "activity" url parmeters. See: db.ts

context("Student Report", () => {
  const body = new ReportBody();

  beforeEach(() => {
    cy.visit("/?studentId=3&fakeUserType=learner&fakePlatformUserId=3");
    cy.fixture("sequence-structure.json").as("sequenceData");

  });

  it("Shows the student's name", () => {
    cy.contains("Amy Galloway");
  });

  context("Module Details", () => {
    it("Verifies sequence name", () => {
      cy.get("@sequenceData").then((sequenceData) => {
        const moduleName = sequenceData.name;
        // There is some header content in a .report-content div which is hidden
        // until the user starts scrolling, so we have to explicitly select the unhidden div
        cy.get(".report-content:not(.hidden) h2").contains(moduleName).should("be.visible");
      });
    });
  });

  context("Activity Level", () => {
    const activityIndex = 0;

    it("Verifies activity Name", () => {
      cy.get("@sequenceData").then((sequenceData) => {
          const activityName = getActivityData(sequenceData)[activityIndex].name;
          cy.get(".report-content:not(.hidden) .activity").eq(activityIndex)
            .should("be.visible")
            .and("contain", activityName);
      });
    });

    it("Shows no feedback", () => {
      cy.get(".student-feedback-panel").contains("No feedback yet");
    });

    it("Shows the open response prompt", () => {
      cy.get(".prompt").contains("Open response question prompt");
    });
  });
});
