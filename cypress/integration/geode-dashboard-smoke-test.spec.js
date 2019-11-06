import Dashboard from "../support/elements/geode-dashboard/dashboard";

context("Geode Dashboard Smoke Test", () => {

    const dashboard = new Dashboard();
    const studentsToTest = ["", "", ""];

    beforeEach(() => {
        cy.visit("/?dashboard=true");
        cy.fixture("class-data.json").as("classData");
        cy.fixture("sequence-structure.json").as("sequenceStructure");
    });

    function getStudentName(classData, id) {
        let students;

        students = classData.students;
        for (let i = 0; i < students.length; i++) {
            if (students[i].id === id) {
                let student = students[i];
                return student.name;
            } else {
                cy.log("No student with this ID found in class");
            }
        }
    }

    function getActivityData(structure) {
        let activityData;

        activityData = structure.children;
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

    function getPageQuestionData(pageData) {
        let questionData;

        questionData = pageData.children;
        if (questionData != null) {
            return questionData;
        } else {
            cy.log("There was no question data");
        }
    }

    function getActivityQuestionData(activityData) {
        let questionData = [];

        let pageData = getPageData(activityData) || [];
        pageData.forEach(page => {
          questionData = questionData.concat(getPageQuestionData(page) || []);
        });
        if (questionData.length > 0) {
            return questionData;
        } else {
            cy.log("There was no question data");
        }
    }

    function getAnswerData(questionData) {
        let allAnswers;

        allAnswers = questionData.answers;
        if (allAnswers != null) {
            return allAnswers;
        }
    }

    function getStudentAnswer(answerData, studentID) {
        for (let i = 0; i < answerData.length; i++) {
            let answer;

            let studentAnswerData = answerData[i];
            if (studentAnswerData.student_id === studentID) {
                answer = getAnswerType(studentAnswerData);
                return answer;
            }
        }
    }

    function getAnswerType(answerData) {
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

    describe("Verifies setting functionality", () => {
        it("can sort by least progress", () => {
            dashboard.getSortDropdown()
                .select("Least Progress")
                .should("be.visible");
            dashboard.getStudentNames().eq(0)
                .should("contain", "Armstrong, Jenna" );
            dashboard.getStudentAnswersRow().eq(0)
                .within(() => {
                    dashboard.getProgressBar()
                        .should("not.be.visible");
                });
        });
        it("can sort by most progress", () => {
            dashboard.getSortDropdown()
                .select("Most Progress")
                .should("be.visible");
            dashboard.getStudentNames().eq(0)
                .should("contain", "Jenkins, John");
            dashboard.getStudentAnswersRow().eq(0)
                .within(() => {
                    dashboard.getProgressBar().eq(0)
                        .should("be.visible")
                        .and("have.attr", "style", "width: 100%;");
                });
        });
        it("can sort by student name", () => {
            dashboard.getSortDropdown()
                .should("be.visible")
                .select("Student Name");
            dashboard.getStudentNames().eq(0)
                .should("contain", "Armstrong, Jenna");
        });
        it("can open and close student list", () => {
            dashboard.getStudentAnswersRow()
                .should("not.have.class", dashboard.answersOpen);
            dashboard.getOpenCloseStudents()
                .should("exist")
                .and("be.visible")
                .click({ force: true });
            dashboard.getStudentAnswersRow()
                .should("have.class", dashboard.answersOpen);
            dashboard.getOpenCloseStudents()
                .click({ force: true });
            dashboard.getStudentAnswersRow()
                .should("not.have.class", dashboard.answersOpen);
        });
        it("can scroll across the different activities", () => {
            dashboard.getOpenCloseStudents()
                .click({ force: true });
            dashboard.getActivityNames().last()
                .scrollIntoView({ duration: 2000 });
        });
    });

    describe("Verifies for Activity/Seq data", function() {

        it("Checks for activity names", () => {
            cy.get("@sequenceStructure").then((structure) => {
                const activities = structure.children;

                dashboard.getActivityNames()
                    .should("have.length", activities.length);

                for (let i = 0; i < activities.length; i++) {
                    let activity = activities[i];
                    dashboard.getActivityNames()
                        .should("contain", activity.name);
                }
            });
        });
        it("can expand activity questions", () => {
            cy.get("@sequenceStructure").then((structure) => {
                const activityData = getActivityData(structure)[0];

                let questionData = getActivityQuestionData(activityData);
                let questionTotal = questionData.length;
                let currentQuestionPrompt;

                dashboard.getExpandQuestionDetails()
                    .should("not.exist");
                dashboard.getOpenCloseStudents()
                    .click({ force: true });
                dashboard.getExpandQuestionDetails()
                    .should("exist")
                    .and("be.visible")
                    .and("have.length", questionTotal);

                for (let i = 0; i < questionTotal; i++) {
                    // strip html chars from the prompt
                    currentQuestionPrompt = Cypress.$(questionData[i].prompt).text();
                    dashboard.getActivityQuestionsText()
                        .should("contain", currentQuestionPrompt);
                }

                dashboard.getExpandedMCAnswerDetails()
                    .should("not.be.visible")
                    .and("not.exist");

                // This is assuming the 2nd question is a multiple choice question
                dashboard.getExpandQuestionDetails().eq(1)
                    .click({ force: true });
                dashboard.getExpandedQuestionPanel()
                    .should("be.visible");
                dashboard.getExpandedMCAnswerDetails()
                    .should("be.visible")
                    .and("exist");
                dashboard.getCloseExpandedQuestion()
                    .should("exist")
                    .click({ force: true });
                dashboard.getExpandedQuestionPanel()
                    .should("not.be.visible");
            });
        });
        it("can expand activities to show questions", () => {
            dashboard.getActivityNames().eq(0)
                .click({ force: true });
            cy.get("@sequenceStructure").then((structure) => {
                const questionData = getActivityQuestionData(getActivityData(structure)[0]);

                dashboard.getActivityQuestions().eq(0).within(() => {
                  dashboard.getActivityQuestionToggle()
                  .should("exist")
                  .and("have.length", questionData.length);
                });
            });
            dashboard.getActivityQuestionsText()
                .should("not.be.visible");
            dashboard.getActivityQuestionToggle().eq(0)
                .click({ force: true });
            dashboard.getActivityQuestionsText()
                .should("be.visible");
            dashboard.getActivityQuestionsText().eq(0)
                .click({ force: true });
            dashboard.getActivityQuestionsText()
                .should("not.be.visible");
        });

        // it.only('Checks for one students data', () => {
        //     cy.get('@classData').then((classData) => {
        //         const activities = classData.report.children
        //         const students = classData.class.students
        //         let studentID;
        //         let activityAnswers;
        //         let answerText;
        //         let answerID;

        //         // for (let i=0; i<students.length;i++) {
        //         //     studentID = students[i].id
        //         //     dashboard.getStudentNames().eq(i)
        //         //         .click({force:true}) make sure this block is commented out after I put it back

        //         studentID = 14//students[0].id
        //         dashboard.getStudentNames().eq(0)
        //             .click({force:true})

        //         for (let j=0; j<activities.length;j++) {
        //             activityAnswers = activities[j].children[0].children[0].children[0].answers
        //             cy.log(activityAnswers)
        //             for (let k=0; k<activityAnswers.length;k++) {
        //                 answerID = activityAnswers[k].student_id

        //                 if(answerID === studentID) {
        //                     if (activityAnswers[k].answer) {
        //                         answerText = activityAnswers[k].answer
        //                     }
        //                     dashboard.getStudentAnswersRow().eq(0)
        //                         .should('contain', answerText)
        //                     }
        //                 }

        //             dashboard.getStudentNames().eq(0)
        //                 .click({force:true})
        //         }
        //     })
        // })
    });

    describe("Student Data", () => {

        it("Checks for student names", () => {
            cy.get("@classData").then((classData) => {
                const students = classData.students;

                dashboard.getStudentNames()
                    .should("have.length", students.length);

                for (let i = 0; i < students.length; i++) {
                    let student = students[i];
                    dashboard.getStudentNames()
                        .should("contain", student.last_name + ", " + student.first_name);
                }
            });
        });
        it("show responses", () => {
            const multipleChoiceQuestionIndex = 1;

            dashboard.getOpenCloseStudents()
                .click({ force: true });
            dashboard.getExpandQuestionDetails().eq(multipleChoiceQuestionIndex)
                .click({ force: true });
            cy.get("@sequenceStructure").then((structure) => {
                const questionData = getActivityQuestionData(getActivityData(structure)[0])[multipleChoiceQuestionIndex];

                dashboard.getExpandedMCAnswerDetails()
                    .should("exist")
                    .and("contain", questionData.choices[0].content)
                    .and("contain", "No response");

                dashboard.getExpandedMCAnswers()
                    .should("not.exist")
                    .and("not.be.visible");
                dashboard.getShowHideResponse()
                    .should("exist")
                    .click({ force: true })
                    .then(() => {
                        dashboard.getExpandedMCAnswers()
                            .should("exist")
                            // FIXME: this seems to be an error in the code student names
                            // should always be shown in the dashboard
                            .and("contain", "Student 1");
                    });
            });
            dashboard.getCloseExpandedQuestion()
                .should("exist")
                .click({ force: true });
            dashboard.getExpandedQuestionPanel()
                .should("not.be.visible");
        });
        it("hide responses", () => {
            dashboard.getOpenCloseStudents()
                .click({ force: true });
            dashboard.getExpandedMCAnswers()
                .should("not.be.visible")
                .and("not.exist");
            dashboard.getExpandQuestionDetails().eq(1)
                .click({ force: true });
            dashboard.getShowHideResponse()
                .should("exist")
                .click({ force: true });
            dashboard.getExpandedMCAnswers()
                .should("exist")
                // Student 1 has an answer of b
                .and("contain", "b");
            dashboard.getShowHideResponse()
                .should("exist")
                .click({ force: true });
            dashboard.getExpandedMCAnswers()
                .should("not.exist");
        });
        it("shows MC question response", () => {
            dashboard.getOpenCloseStudents()
                .click({ force: true });
            dashboard.getExpandQuestionDetails().eq(1)
                .click({ force: true });
            dashboard.getExpandedMCAnswerDetails()
                .should("exist")
                .and("contain", "b")
                .and("contain", "No response");
            dashboard.getExpandedMCAnswers()
                .should("not.exist")
                .and("not.be.visible");
            dashboard.getShowHideResponse()
                .should("exist")
                .click({ force: true });
            dashboard.getExpandedMCAnswers()
                .should("exist")
                // FIXME should be a real student name here
                .and("contain", "Student 1");
            dashboard.getCloseExpandedQuestion()
                .should("exist")
                .click({ force: true });
            dashboard.getExpandedQuestionPanel()
                .should("not.be.visible");
        });

    });

});
