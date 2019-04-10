import Dashboard from "../support/elements/dashboard.js"

context('Geode Dashboard Smoke Test', () => {

    const dashboard = new Dashboard;

    beforeEach(() => {
        cy.visit('/?dashboard=true')
        cy.fixture('report-test-data.json').as('classData')
    })

    describe('Student Names', function () {

        it('Clicks on a student name', () => {
            dashboard.getStudentNames()
                .should('exist')
                .and('have.length', 5)
            dashboard.getMultipleChoiceAnswers()
                .should('not.exist')
            dashboard.getStudentNames().eq(0)
                .click({ force: true })
            cy.get('@classData').then((classData) => {
                const student = classData.class.students[0]
                dashboard.getMultipleChoiceAnswers()
                    .should('exist')
                    .and('contain', student.A1Q1Answer)
                    .and('be.visible')
            })
            dashboard.getMultipleChoiceAnswers()
                .should('be.visible')
                .and('have.length', 1)
        })

        it('can sort by least progress', () => {
            dashboard.getSortDropdown()
                .select('Least Progress')
                .should('be.visible')
            cy.get('@classData').then((classData) => {
                const student = classData.class.students[4]
                dashboard.getStudentNames().eq(0)
                    .should('contain', student.name)
                dashboard.getStudentAnswersRow().eq(0)
                    .within(() => {
                        dashboard.getProgressBar()
                            .should('not.be.visible')
                    })
            })
        })
        it('can sort by most progress', () => {
            dashboard.getSortDropdown()
                .select('Most Progress')
                .should('be.visible')
            cy.get('@classData').then((classData) => {
                const student = classData.class.students[0]
                dashboard.getStudentNames().eq(0)
                    .should('contain', student.name)
                dashboard.getStudentAnswersRow().eq(0)
                    .within(() => {
                        dashboard.getProgressBar().eq(0)
                            .should('be.visible')
                            .and('have.attr', 'style', 'width: 100%;')
                    })
            })
        })
        it('can sort by student name', () => {
            dashboard.getSortDropdown()
                .should('be.visible')
                .select('Student Name')
            cy.get('@classData').then((classData) => {
                const student = classData.class.students[1]
                dashboard.getStudentNames().eq(0)
                    .should('contain', student.name)
            })
        })
        it('can close student list', () => {
            dashboard.getStudentAnswersRow()
                .should('not.have.class', dashboard.answersOpen)
            dashboard.getOpenCloseStudents()
                .should('exist')
                .and('be.visible')
                .click({ force: true })
            dashboard.getStudentAnswersRow()
                .should('have.class', dashboard.answersOpen)
            dashboard.getOpenCloseStudents()
                .click({ force: true })
            dashboard.getStudentAnswersRow()
                .should('not.have.class', dashboard.answersOpen)
        })
    })

    describe('Question section', () => {
        it('can expand activity questions', () => {
            dashboard.getExpandQuestionDetails()
                .should('not.exist')
            dashboard.getOpenCloseStudents()
                .click({ force: true })
            cy.get('@classData').then((classData) => {
                const activity = classData.class.activity
                const a1q1Text = activity.questions[0].Q1
                const a1q2Text = activity.questions[1].Q2
                const a1QuestionTotal = activity.questionTotal
                const correctTotal = activity.questionTotal
                const studentScore = activity.questions[0].studentScore
                dashboard.getExpandQuestionDetails()
                    .should('exist')
                    .and('be.visible')
                    .and('have.length', a1QuestionTotal)
                dashboard.getActivityQuestions()
                    .should('contain', a1q1Text)
                dashboard.getActivityQuestions()
                    .should('contain', a1q2Text)
                dashboard.getMultipleChoiceAnswerDetails()
                    .should('not.be.visible')
                    .and('not.exist')
                dashboard.getExpandQuestionDetails().eq(0)
                    .click({ force: true })
                dashboard.getMultipleChoiceAnswerDetails()
                    .should('be.visible')
                    .and('exist')
                    .and('contain', correctTotal)
                dashboard.getMultipleChoiceAnswerTable()
                    .should('not.exist')
                    .and('not.be.visible')
                dashboard.getShowHideResponse()
                    .should('exist')
                    .click({ force: true })
                    .then(() => {
                        dashboard.getMultipleChoiceAnswerTable()
                            .should('exist')
                            .and('contain', studentScore)
                    })
                dashboard.getCloseExpandedQuestion()
                    .should('exist')
                    .click({ force: true })
                dashboard.getExpandedQuestionPanel()
                    .should('not.be.visible')
            })

        })
        it('can scroll across the different activities', () => {
            dashboard.getOpenCloseStudents()
                .click({force:true})
            dashboard.getActivityName().last()
                .scrollIntoView({ duration: 2000 })
                
        })
        it('can contract activity questions', () => {
            dashboard.getProgressBar()
                .should('be.visible')
            dashboard.getOpenCloseStudents()
                .click({force:true})
            dashboard.getProgressBar()
                .should('not.be.visible')
            dashboard.getActivityName().eq(0)
                .click({force:true})
            dashboard.getActivityQuestions()
                .should('not.exist')
            dashboard.getProgressBar()
                .should('be.visible')

        })
        it('can expand question', () => {

        })
    })

    describe('Expanded Question dialog', () => {
        it('show responses', () => {

        })
        it('hide responses', () => {

        })
        it('close dialog', () => {

        })
    })
})