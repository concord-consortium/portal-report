import Header from "../support/elements/portal-report/header";
import ReportBody from "../support/elements/portal-report/report-body";
import Feedback from "../support/elements/portal-report/feedback";

context("Portal Report Smoke Test", () => {

    //const dashboard = new Dashboard;

    beforeEach(() => {
        cy.visit("/");
        cy.fixture("sequence-structure.json").as("sequenceData");
        cy.fixture("class-data.json").as("classData");
        cy.fixture("answers.json").as("answerData");
    });

    const header = new Header();
    const body = new ReportBody();
    const feedback = new Feedback();

    function getActivityData(sequenceData) {
        let activityData;

        activityData = sequenceData.children;
        if (activityData != null) {
            return activityData;
        } else {
            cy.log("There was no activity with this index");
        }
    }

    function getPageData(activityData) {
        let pageData;

        pageData = activityData.children[0].children;
        if (pageData != null) {
            return pageData;
        } else {
            cy.log("There was no activity page data");
        }
    }

    function getQuestionData(pageData) {
        let questionData;

        questionData = pageData.children;
        if (questionData != null) {
            return questionData;
        } else {
            cy.log("There was no question data");
        }
    }

    function getAnswerByQuestionType(answerData) {
        let answer;
        let questionType;
        questionType = answerData.type;

        if (answerData.type != null) {
            switch (questionType) {
                case ("Embeddable::MultipleChoice"):
                    answer = answerData.answer[0].choice;
                    break;
                case ("Embeddable::OpenResponse"):
                    answer = answerData.answer;
                    break;
                case ("Embeddable::ImageQuestion"):
                    answer = answerData.answer.image_url;
                    break;
                case ("Embeddable::Iframe"):
                    answer = answerData.answer;
                    break;
            }
            return answer;
        } else {
            cy.log("Could not find answer for question type " + questionType);
        }
    }

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
                    questionData = getQuestionData(pageData[i]);
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

        // This test is dying in the application code, perhaps it is something that got
        // fixed
        it.skip("Shows/Hides student names", () => { // Add into context
            cy.get("@classData").then((classData) => {
                const students = classData.students;
                let student;

                body.getResponseTable().should("not.exist");
                body.getActivities().eq(activityIndex).within(() => {
                    body.getShowResponses(questionIndex).should("exist").and("be.visible").click({ force: true });
                });
                body.getResponseTable().should("exist").and("be.visible");
                for (let i = 0; i < students.length; i++) {
                    student = students[i];
                    if (students[i].started_offering === true) {
                        body.checkForStudentNames(true, student[i].first_name);
                    }
                }
                header.getHideShowNames().should("be.visible").click({ force: true });
                for (let i = 0; i < students.length; i++) {
                    student = students[i];
                    if (students[i].started_offering === true) {
                        body.checkForStudentNames(false, student[i].first_name);
                    }
                }
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

                        for (let j = 0; j <= pages.length; j++){
                            currentPage = pages[j];
                            questions = getQuestionData(currentPage);

                            for (let k = 0; k < questions.length; k++) {
                                currentQuestion = questions[k];
                            }
                        }
                    }

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
                feedback.getScoredStudentsCount().should("be.visible").and("contain", "3");
                feedback.getStudentWaitingForFeedbackCount().should("be.visible").and("contain", "0");
                feedback.getNoAnswerStudentsCount().should("be.visible").and("contain", "2");
            });
        });

        // this will only work if there is a rubric for the activity, the current
        // test data doesn't seem to have that, but we should add one so this test can
        // run
        it.skip("check scoring options", () => {
            body.pullUpFeedbackForActivity(activityIndex);
            feedback.getRubricCheckbox().should("exist").and("be.visible").and("be.checked").check();
            feedback.getGiveScoreCheckbox().should("exist").and("be.visible").and("be.checked");
            feedback.getWrittenFeedbackCheckbox().should("exist").and("be.visible").and("be.checked");
            feedback.getManualScoringOption().should("exist").and("be.visible").and("be.checked");
            cy.root();
            feedback.getAutoScoringOption().should("exist").and("be.visible").and("not.be.checked");
            feedback.getRubricScoringOption().should("exist").and("be.visible").and("not.be.checked");
        });

        it("checks toggle for show all students", () => {
            cy.get("@classData").then((classData) => {
                let studentTotal = classData.students.length;

                body.pullUpFeedbackForActivity(activityIndex);
                feedback.getShowAllStudentsToggle().should("not.be.checked");
                feedback.getShowAllStudentsToggle().click();
                cy.get(".feedback-row").should("have.length", studentTotal);
            });
        });

        // The Feedback textarea is disabled because the report thinks the feedbback is
        // complete
        it.skip("selects a student from list and provides written feedback and score", () => {
            body.pullUpFeedbackForActivity(activityIndex);
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
            feedback.getShowAllStudentsToggle().click();
            feedback.getStudentWorkLink(studentIndex).should("be.visible").click({ force: true });
        });
    });
});
