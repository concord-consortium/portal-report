import { getByCypressTag } from '../../utils'

class Dashboard {

    answersOpen = 'dashboard--fullAnswers--1-gA5Yaq'

    //Sort, Help, and Open/Close Students
    getSortDropdown () {
        return getByCypressTag('sortDropdown')
    }
    getHelpPanel () {
        return getByCypressTag('helpPanel')
    }
    getOpenCloseStudents () {
        return getByCypressTag('openCloseStudents').find('a')
    }

    //Students
    getStudentNames () {
        return getByCypressTag('studentName')
    }
    getStudentAnswersRow () {
        return getByCypressTag('studentAnswersRow')
    }
    getProgressBar () {
        return getByCypressTag('progressBar')
    }
    getOpenResponseText () {
        return getByCypressTag('openResponseText')
    }

    getMultipleChoiceAnswers () {
        return getByCypressTag('multipleChoiceAnswers')
    }

    //Icons
    getOpenResponseIcon () {
        return getByCypressTag('openResponseIcon')
    }
    getMultipleChoiceIcon () {
        return getByCypressTag('multipleChoiceIcon')
    }
    
    //Expand Question
    getExpandedQuestionPanel() {
        return cy.get('div.modal-content')
    }
    getExpandQuestionDetails () {
        return getByCypressTag('expand-question-details')
    }
    getExpandedMCAnswerDetails() {
        return getByCypressTag('multiple-choice-details')
    }
    getExpandedMCAnswerTable() {
        return getByCypressTag('multiple-choice-answers-table')
    }
    getShowHideResponse() {
        return cy.get('.modal-body').find('.cc-button')
    }
    getCloseExpandedQuestion() {
        return cy.get('.modal-footer > .cc-button')
    }

    //Activity Info
    getActivityQuestions() {
        return getByCypressTag('activity-question-toggle')
    }
    getActivityQuestionsText() {
        return getByCypressTag('activityQuestionsText')
    }
    getActivityAnswers () {
        return getByCypressTag('activityAnswers')
    }
    getActivityName () {
        return getByCypressTag('activityName')
    }
    
}

export default Dashboard;