import { getByCypressTag } from "../../../utils";

class Feedback {
    getActivityHeader() {
        return cy.get(".feedback-panel")
            .find(".prompt");
    }
    // Student Counts
    getStudentWaitingForFeedbackCount() {
        return cy.get(".feedback-overview > :nth-child(1) > .value");
    }
    getScoredStudentsCount() {
        return cy.get(".feedback-overview > :nth-child(2) > .value");
    }
    getNoAnswerStudentsCount() {
        return cy.get(".feedback-overview > :nth-child(3) > .value");
    }

    // Rubric Options
    getRubricCheckbox() {
        return getByCypressTag("rubric-checkbox");
    }
    getWrittenFeedbackCheckbox() {
        return cy.get("#feedbackEnabled");
    }
    getGiveScoreCheckbox() {
        return cy.get("#giveScore");
    }
    // Options: manual, auto, rubric
    getManualScoringOption() {
        return cy.get(".score-options").find("input").eq(0);
    }
    getManualMaxScore() {
        return cy.get(".score-options").find("input").eq(1);
    }
    getAutoScoringOption() {
        return cy.get(".score-options").find("input").eq(2);
    }
    getRubricScoringOption() {
        return cy.get(".score-options").find("input").eq(3);
    }

    // Toggle current visible students
    getShowStudentNeedingReviewToggle() {
        return cy.get("#needsReview");
    }
    getShowAllStudentsToggle() {
        return cy.get("input#all");
    }
    getStudentSelection() {
        return cy.get("select");
    }

    //Feedback Student Row
    getStudentWorkLink(stuIdx) {
        return cy.get(".feedback-row").eq(stuIdx).find("a");
    }
    getWrittenFeedbackTextarea(stuIdx) {
        return cy.get(".feedback-row").eq(stuIdx).find("textarea");
    }
    getStudentScoreInput(stuIdx) {
        return cy.get(".feedback-row").eq(stuIdx).within(() => {
            cy.get(".score").find("input");
        });
    }
    getCompleteStudentFeedback(stuIdx) {
        return cy.get(".feedback-row").eq(stuIdx).within(() => {
            cy.get(".feedback-complete").find("input");
        });
    }

    getStudentsAwaitingFeedbackCount(answersData) {
        let studentsAwaitingFeedbackCount = 0;

        for (i = 0; i < answersData.length; i++) {
            let feedbackStatus = answersData[i].feedbacks[0].has_been_reviewed;

            if (feedbackStatus !== true) {
                studentsAwaitingFeedbackCount += 1;
            }
        }
        return studentsAwaitingFeedbackCount;
    }

    getStudentsProvidedFeedback(answersData) {
        let studentsProvidedFeedbackCount = 0;

        for (i = 0; i < answersData.length; i++) {
            let feedbackStatus = answersData[i].feedbacks[0].has_been_reviewed;

            if (feedbackStatus === true) {
                studentsProvidedFeedbackCount += 1;
            }
        }
        return studentsProvidedFeedbackCount;
    }

}
export default Feedback;
