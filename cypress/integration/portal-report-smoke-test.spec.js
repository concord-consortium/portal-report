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

    function getAnswerByQuestionType(answersData) {
        let answer;
        let questionType;
        questionType = answersData.type;

        if (answersData.type != null) {
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

        // it("Refreshes the page", () => {
        //     header.getRefreshButton().should("be.visible").and("exist").click({ force: true });
        // });

        // it("Verifies the time is accurate", () => {
        //     header.getTime().should("contain", "Last updated at");
        // });

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

        it("Shows/Hides student names", () => { // Add into context
            body.getResponseTable().should("not.exist");
            body.getActivities().eq(activityIndex).within(() => {
                body.getShowResponses(questionIndex).should("exist").and("be.visible").click({ force: true });
            });
            body.getResponseTable().should("exist").and("be.visible");
            body.checkForStudentNames("T");
            header.getHideShowNames().should("be.visible").click({ force: true });
            body.checkForStudentNames("F");
        });

        it("Shows activity 1 responses for students with answers", () => {
            body.getShowResponses(questionIndex).should("be.visible").click({ force: true });
            body.checkForStudentNames("T");
            body.getHideResponses(questionIndex).click({ force: true });
        });
    });

    context("Activity Level Feedback", () => {
        const activityIndex = 0;
        const studentIndex = 0;
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
                feedback.getScoredStudentsCount().should("be.visible").and("contain", "1");
                feedback.getStudentWaitingForFeedbackCount().should("be.visible").and("contain", "3");
                feedback.getNoAnswerStudentsCount().should("be.visible").and("contain", "1");
            });
        });

        it("check scoring options", () => {
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

        it("selects a student from list and provides written feedback and score", () => {
            body.pullUpFeedbackForActivity(activityIndex);
            feedback.getShowAllStudentsToggle().click();
            feedback.getStudentSelection().select((studentIndex + 1).toString());
            feedback.getWrittenFeedbackTextarea(studentIndex).focus();
            feedback.getWrittenFeedbackTextarea(studentIndex).type(writtenFeedbackText);
            feedback.getStudentScoreInput(studentIndex).clear();
            feedback.getStudentScoreInput(studentIndex).type(studentScore);
            feedback.getCompleteStudentFeedback(studentIndex).click();
        });
        // This should work when testing in Firestore
        //
        // it('Checks student report for feedback', () => {
        //     feedback.getStudentWorkLink(studentIndex).should('be.visible').click({force:true})
        // })
    });
});

    // function getStudentAnswer(answerData, studentID) {
    //     for (let i = 0; i < allAnswers.length; i++) {
    //         let answerData = allAnswers[i]
    //         let answer;

    //         if (answerData.student_id === studentID) {
    //             answer = getAnswerType(answerData)
    //             return answer
    //         }
    //     }
    // }

        // function getStudentName(classData, id) {
    //     let students;

    //     students = classData.class.students
    //     for (let i = 0; i < students.length; i++) {
    //         if (students[i].id === id) {
    //             let student = students[i]
    //             return student.name
    //         } else {
    //             cy.log('No student with this ID found in class')
    //         }
    //     }
    // }
