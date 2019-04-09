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
}

export default Dashboard;