import { getByCypressTag } from '../../utils'

class Dashboard {

    answersOpen = 'dashboard--fullAnswers--1-gA5Yaq'

    //Every answer
    getActivityAnswers () {
        return getByCypressTag('activityAnswers')
    }
    //Every activity title
    getActivityName () {
        return getByCypressTag('activityName')
    }
    //Every expand icon for student answers
    getExpandQuestionDetails () {
        return getByCypressTag('expand-question-details')
    }
    getMultipleChoiceAnswerDetails() {
        return getByCypressTag('multiple-choice-details')
    }
    getMultipleChoiceAnswerTable() {
        return getByCypressTag('multiple-choice-answers-table')
    }
    getActivityQuestions() {
        return getByCypressTag('activityQuestions')
    }
    getShowHideResponse() {
        return cy.get('.modal-body').find('.cc-button')
    }
    //Every Student Row
    getStudentAnswersRow () {
        return getByCypressTag('studentAnswersRow')
    }
    //Sort dropdown button/menu
    getSortDropdown () {
        return getByCypressTag('sortDropdown')
    }
    //Every student name
    getStudentNames () {
        return getByCypressTag('studentName')
    }

    getFeedbackBox () {
        return getByCypressTag('feedbackBox')
    }

    getFeedbackButton () {
        return getByCypressTag('feedbackButton')
    }

    getProgressBar () {
        return getByCypressTag('progressBar')
    }

    getOpenResponseIcon () {
        return getByCypressTag('openResponseIcon')
    }

    getOpenResponseText () {
        return getByCypressTag('openResponseText')
    }

    getMultipleChoiceIcon () {
        return getByCypressTag('multipleChoiceIcon')
    }

    getMultipleChoiceAnswers () {
        return getByCypressTag('multipleChoiceAnswers')
    }

    getHelpPanel () {
        return getByCypressTag('helpPanel')
    }

    getOpenCloseStudents () {
        return getByCypressTag('openCloseStudents').find('a')
    }
    getCloseExpandedQuestion() {
        return cy.get('.modal-footer > .cc-button')
    }
    getExpandedQuestionPanel() {
        return cy.get('div.modal-content')
    }
}

export default Dashboard;