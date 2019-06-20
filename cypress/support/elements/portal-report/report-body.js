import { getByCypressTag } from '../../../utils'

class ReportBody {
    //
    //Titles
    //
    getClassName() {
        return getByCypressTag('class-name')
    }
    getModuleName() {
        return cy.get('.sticky-inner-wrapper > h2').eq(0)
    }
    getActivity() {
        return cy.get('.report-content').eq(0).find('.activity')
    }
    getActivityName(idx) {
        return cy.get('.activity').children('first').eq(idx)
    }
    //
    //Activity Level
    //
    getProvideOverallFeedback(aIdx) {
        return getByCypressTag('feedbackButton').eq(0)
    }
    getAverageScore() {
        return getByCypressTag('average-score')
    }
    //
    //Question Level
    //
    getQuestionText() {
        return getByCypressTag('question-text')
    }
    getQuestionCheckBox(aIdx, qIdx) {
        return getByCypressTag('question-checkbox')
    }
    getQuestionLink() {
        return getByCypressTag('question-link')
    }
    getQuestionTitle(idx) {
        return cy.get('.question').eq(idx).within(() => { cy.get('a').find('span') })
    }
    getProvideFeedback(aIdx, qIdx) {
        return getByCypressTag('feedback')
    }
    //
    //Question Response Level
    //
    getShowResponses(qIdx) {
        return cy.get('.question-header').eq(qIdx).contains('Show responses')
    }
    getResponseTable() {
        return cy.get('.answers-table')
    }
    getResponseStudentName(studentName) {
        return this.getResponseTable().contains(studentName)
    }
    //
    //Misc Actions
    //
    checkForStudentNames(status) {
        if(status === 'T')
            status = 'contain'
        else if(status === 'F')
            status = 'not.contain'

        return cy.get('@classData').then((classData) => {
            const students = classData.class.students
            let i = 0;
            for (i; i < students.length; i++) {
                let studentName = students[i].first_name
                cy.get('.report-content')
                    .should(status, studentName)
            }
        })
    }
    checkForStudentIDs(status) {
        if(status === 'T')
            status = 'contain'
        else if(status === 'F')
            status = 'not.contain'
            
        return cy.get('@classData').then((classData) => {
            const students = classData.class.students
            let i = 0;
            for (i; i < students.length; i++) {
                let studentID = students[i].student_id
                cy.get('.report-content')
                    .should(status, studentID)
            }
        })
    }
}

export default ReportBody;