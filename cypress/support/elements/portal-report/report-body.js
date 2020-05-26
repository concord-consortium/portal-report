import { getByCypressTag } from "../../../utils";

class ReportBody {
    //
    //Titles
    //
    getClassName() {
        return getByCypressTag("class-name");
    }
    getModuleName() {
        return cy.get(".sticky-inner-wrapper > h2").eq(0);
    }
    getActivityName(idx) {
        return cy.get(".activity").children("first").eq(idx);
    }
    //
    //Activity Level
    //
    getProvideOverallFeedback(aIdx) {
        return cy.get(".activity").eq(aIdx).within(() => {
            getByCypressTag("feedbackButton").eq(0);
        });
    }
    getActivities() {
        return cy.get('div [data-cy = "activity"]');
    }

    getAverageScore() {
        return getByCypressTag("average-score");
    }
    //
    //Question Level
    //
    getQuestionText() {
        return getByCypressTag("question-text");
    }
    getQuestionCheckBox() {
        return getByCypressTag("question-checkbox");
    }
    getQuestionLink() {
        return getByCypressTag("question-link");
    }
    getQuestionTitle(idx) {
        return cy.get(".question").eq(idx).within(() => { cy.get("a").find("span"); });
    }
    getProvideFeedback(aIdx, qIdx) {
        return getByCypressTag("feedback");
    }
    //
    //Question Response Level
    //
    getShowResponses(qIdx) {
        return cy.get(".answers-toggle").eq(qIdx).contains("Show responses");
    }
    getHideResponses(qIdx) {
        return cy.get(".answers-toggle").eq(qIdx).contains("Hide responses");

    }
    getResponseTable() {
        return cy.get(".answers-table");
    }
    getResponseStudentName(studentName) {
        return this.getResponseTable().contains(studentName);
    }
    //
    //Misc Actions
    //
    checkForStudentNames(status, studentName) {
        if (status === true) {
            status = "contain";
        }
        else if (status === false) {
            status = "not.contain";
        }

        return cy.get(".report-content").should(status, studentName);
    }

    pullUpFeedbackForActivity(idx) {
        this.getProvideOverallFeedback(idx)
            .should("be.visible")
            .click({ force: true });
    }

    openAnswersForQuestion(questionId) {
        cy.get(`[data-cy=${questionId}] .answers-toggle`).click({force: true})
    }
}

export default ReportBody;
