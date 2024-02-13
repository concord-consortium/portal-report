import Header from "../support/elements/portal-report/header";
import ReportBody from "../support/elements/portal-report/report-body";
import Feedback from "../support/elements/portal-report/feedback";
import {
  getAnswerByQuestionType,
  getPageQuestionData,
  getActivityData,
  getPageData,
  getActivityQuestionData
} from "../utils";

context("Portal Report Sequence Smoke Test", () => {

  //const dashboard = new Dashboard;

  // It might be good to have an afterEach:
  // firebase.firestore().terminate();
  // firebase.firestore().clearPersistence();
  // However it seems firestore is clearing any cached information on each test
  // run, so this doesn't seem necessary.

  beforeEach(() => {
    cy.visit(`/?token=12345`);
    cy.fixture("sequence-structure.json").as("sequenceData");
    cy.fixture("small-class-data.json").as("classData");
    cy.fixture("answers.json").as("answerData");
  });

  const header = new Header();
  const body = new ReportBody();
  const feedback = new Feedback();

  context("Header components", () => {
    it("Verifies the logo appears correctly", () => {
      header.getLogo().should("exist").and("have.length", 1).and("be.visible");
    });
  });

  context("Module Details", () => {
    it("Verifies sequence name", () => {
      cy.get("@sequenceData").then((sequenceData) => {
        const moduleName = sequenceData.name;
        body.getModuleName().should("be.visible").and("contain", moduleName);
      });
    });
  });

  context("Activity Level", () => {
    const activityIndex = 0;

    it("Verifies activity Name", () => {
      cy.get("@sequenceData").then((sequenceData) => {
        const activityName = getActivityData(sequenceData)[activityIndex].name;
        cy.get(".activity").eq(activityIndex).should("be.visible").and("contain", activityName);
      });
    });

    it("Checks Provide overall feedback button", () => {
      body.getProvideOverallFeedback(activityIndex).should("be.visible").and("contain", "overall").click({ force: true });
      cy.get(".feedback-panel").should("exist").and("be.visible");
      cy.get(".footer").find("a").click({ force: true });
    });

    it('handles MC questions without choices', () => {
      body.openAnswersForQuestion('question-multiple_choice_without_choices');
      cy.get('.answers-table').should('be.visible');
      cy.get('.answers-table').should('contain', '[the selected choice has been deleted by question author]');
    });

    it('handles image questions including invalid ones', () => {
      body.openAnswersForQuestion('question-image_question_2');
      cy.get('.answers-table').should('be.visible');
      cy.get('.answers-table').should('contain', 'Error');
    });
  });

  context("Portal Report Settings", () => {
    const activityIndex = 0;
    const questionIndex = 0;

    it("Selects questions and shows selected (Activity 1)", () => {
      cy.get("@sequenceData").then((sequenceData) => {
        let pageData = getPageData(getActivityData(sequenceData)[activityIndex]);
        let checkboxCount = 0;
        let questionData;
        // Get unhidden report, for each page check each question header for checkbox then check
        for (let i = 0; i < pageData.length; i++) {
          questionData = getPageQuestionData(pageData[i]);
          for (let j = 0; j < questionData.length; j++) {
            header.getCheckbox(checkboxCount).check().should("be.checked");
            checkboxCount++;
          }
        }
        header.getShowSelectedButton().should("be.visible").click({ force: true });
      });
      body.getActivities().eq(activityIndex).should("not.have.class", "hidden");
      body.getActivities().eq(activityIndex + 1).should("have.class", "hidden");
    });

    function checkStudentNames(students, contains) {
      students.forEach(student => {
        body.checkForStudentNames(contains, student.first_name);
      });
    }

    it("Shows/Hides student names", () => { // Add into context
      cy.get("@classData").then((classData) => {
        const students = classData.students;

        body.getResponseTable().should("not.exist");
        body.getActivities().eq(activityIndex).within(() => {
          body.getShowResponses(questionIndex).should("exist").and("be.visible").click({ force: true });
        });
        body.getResponseTable().should("exist").and("be.visible");
        checkStudentNames(students, true);
        header.getHideShowNames().should("be.visible").click({ force: true });
        checkStudentNames(students, false);
      });
    });

    // This test looks incomplete
    it.skip("Shows activity 1 responses for students with answers", () => {
      cy.get("@sequenceData").then((sequenceData) => {
        let activityData = getActivityData(sequenceData);

        cy.get("@answerData").then((answerData) => {
          let pages;
          let questions;
          let answers = answerData;

          let currentActivity;
          let currentPage;
          let currentQuestion;

          for (let i = 0; i <= activityData.length; i++) {
            currentActivity = activityData[i];
            pages = getPageData(currentActivity);

            for (let j = 0; j <= pages.length; j++) {
              currentPage = pages[j];
              questions = getPageQuestionData(currentPage);

              for (let k = 0; k < questions.length; k++) {
                currentQuestion = questions[k];
              }
            }
          }
          // eslint-disable-next-line no-undef
          body.getActivities().should("have.length", activityNum);
          body.getShowResponses(questionIndex).should("be.visible").click({ force: true });
          /**
           * i = 1
           * cy.get the sequence data
           * for each i
           * get question_number i
           */
          body.getHideResponses(questionIndex).click({ force: true });
          cy.wait(10000);
        });
      });
    });
  });

  context("Activity Level Feedback", () => {
    const activityIndex = 0;
    const studentIndex = 2;
    const writtenFeedbackText = "Testing Testing 1 2 3...";
    const studentScore = "8";

    it("checks for activity name in Feedback", () => {
      cy.get("@sequenceData").then((sequenceData) => {
        const activityName = getActivityData(sequenceData)[activityIndex].name;

        body.pullUpFeedbackForActivity(activityIndex);
        feedback.getActivityHeader().should("be.visible").and("contain", activityName);
      });
    });

    //Update this to use better data for student counts
    it("checks student response status counts", () => {
      cy.get("@sequenceData").then((sequenceData) => {
        body.pullUpFeedbackForActivity(activityIndex);
        feedback.getGiveScoreCheckbox().click();
        feedback.getScoredStudentsCount().should("be.visible").and("contain", "0");
        feedback.getStudentWaitingForFeedbackCount().should("be.visible").and("contain", "4");
        feedback.getNoAnswerStudentsCount().should("be.visible").and("contain", "2");
      });
    });

    it("check scoring options", () => {
      body.pullUpFeedbackForActivity(activityIndex);
      feedback.getRubricCheckbox().should("exist").and("be.visible").and("not.be.checked").check();
      feedback.getGiveScoreCheckbox().should("exist").and("be.visible").and("not.be.checked");
      feedback.getWrittenFeedbackCheckbox().should("exist").and("be.visible").and("not.be.checked");
      feedback.getManualScoringOption().should("exist").and("be.visible").and("not.be.checked");
      cy.root();
      feedback.getAutoScoringOption().should("exist").and("be.visible").and("not.be.checked");
      feedback.getRubricScoringOption().should("exist").and("be.visible").and("not.be.checked");
    });

    it("checks toggle for show all students", () => {
      cy.get("@classData").then((classData) => {
        let studentTotal = classData.students.length;

        body.pullUpFeedbackForActivity(activityIndex);
        feedback.getGiveScoreCheckbox().click();
        feedback.getShowAllStudentsToggle().should("not.be.checked");
        feedback.getShowAllStudentsToggle().click();
        cy.get(".feedback-row").should("have.length", studentTotal);
      });
    });

    it("selects a student from list and provides written feedback and score", () => {
      body.pullUpFeedbackForActivity(activityIndex);
      feedback.getWrittenFeedbackCheckbox().click();
      feedback.getGiveScoreCheckbox().click();
      feedback.getShowAllStudentsToggle().click();
      feedback.getStudentSelection().select((studentIndex + 1).toString());
      feedback.getWrittenFeedbackTextarea(studentIndex).focus();
      feedback.getWrittenFeedbackTextarea(studentIndex).type(writtenFeedbackText);
      feedback.getStudentScoreInput(studentIndex).clear();
      feedback.getStudentScoreInput(studentIndex).type(studentScore);
      feedback.getCompleteStudentFeedback(studentIndex).click();
    });

    // This will open a new tab with a view of this student's work
    it("Checks student report for feedback", () => {
      body.pullUpFeedbackForActivity(activityIndex);
      feedback.getGiveScoreCheckbox().click();
      feedback.getShowAllStudentsToggle().click();
      feedback.getStudentWorkLink(studentIndex).should("be.visible")
        .then(($studentWorkLink) => {
          // remove target=_blank so the link opens in the same window
          $studentWorkLink.attr("target", null);
        }).click();
      cy.contains("Amy Galloway");
    });
  });
});

context("Portal Report Activity Smoke Test", () => {
  beforeEach(() => {
    cy.visit(`/?resourceType=activity`);
    cy.fixture("activity-structure.json").as("activityData");
    cy.fixture("small-class-data.json").as("classData");
    cy.fixture("activity-answers.json").as("answerData");
  });

  const header = new Header();
  const body = new ReportBody();

  describe("Report shows activity data", () => {
    it("verifies activity title", () => {
      cy.get("@activityData").then((activityData) => {
        const activityName = activityData.name;
        body.getActivityName(0).should("be.visible").and("contain", activityName);
      });
    });
  });
  describe("Report does not crash when image question does not have a prompt", () => {
    it("Question 3 missing prompt, verify report loads", () => {
      cy.get("[data-cy=question-image_question_3] .question-summary").should("not.exist");
    });
  });
});
