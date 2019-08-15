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
    getActivityName(idx) {
        return cy.get('.activity').children('first').eq(idx)
    }
    //
    //Activity Level
    //
    getProvideOverallFeedback(aIdx) {
        return cy.get('.activity').eq(aIdx).within( () => {
            getByCypressTag('feedbackButton').eq(0)
        })
    }
    getActivities() {
        return cy.get('div [data-cy = "activity"]')
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
    getQuestionCheckBox() {
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
        return cy.get('.answers-toggle').eq(qIdx).contains('Show responses')
    }
    getHideResponses(qIdx) {
        return cy.get('.answers-toggle').eq(qIdx).contains('Hide responses')

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
                if(students[i].started_offering == true) {
                    let studentName = students[i].first_name
                    cy.get('.report-content')
                        .should(status, studentName)
                }
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
                let studentID = students[i].id
                cy.get('.report-content')
                    .should(status, studentID)
            }
        })
    }
    pullUpFeedbackForActivity(idx) {
        this.getProvideOverallFeedback(idx)
            .should('be.visible')
            .click({force:true})
    }
}

export default ReportBody;