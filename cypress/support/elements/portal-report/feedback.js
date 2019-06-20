import { getByCypressTag } from '../../../utils'

class Feedback {
    getActivityHeader() {
        return cy.get('.feedback-panel > .prompt')
    }
    // Student Counts
    getStudentWaitingForFeedbackCount() {
        return cy.get('.feedback-overview > :nth-child(1) > .value')
    }
    getScoredStudentsCount() {
        return cy.get('.feedback-overview > :nth-child(2) > .value')
    }
    getNoAnswerStudentsCount() {
        return cy.get('.feedback-overview > :nth-child(3) > .value')
    }

    // Rubric Options
    getRubricCheckbox() {
        return getByCypressTag('rubric-checkbox')
    }
    getWrittenFeedbackCheckbox() {
        return cy.get('#feedbackEnabled')
    }
    getGiveScoreCheckbox() {
        return cy.get('#giveScore')
    }

    // Scoring Options
    getGiveScoreOptions(option) {
        let idx
        switch (option) {
            case 'manual': idx = 0
            case 'auto': idx = 1
            case 'rubric': idx = 2
        }
        return cy.get('.score-options')
            .find(input).eq(idx)
    }

    // Toggle current visible students
    getShowStudentNeedingReviewToggle() {
        return cy.get('#needsReview')
    }
    getShowAllStudentsToggle() {
        return cy.get('#all')
    }
    getStudentSelection() {
        cy.get('select')
    }

}
export default Feedback;