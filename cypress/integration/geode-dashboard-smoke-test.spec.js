import Dashboard from "../support/elements/dashboard.js"

context('Geode Dashboard Smoke Test', () => {

    describe('Student Names', function () {

        const dashboard = new Dashboard;

        beforeEach(() => {
            cy.visit('/?dashboard=true')
            cy.fixture('report-test-data.json').as('classData')
        })

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
                .click({force:true})
            dashboard.getStudentAnswersRow()
                .should('have.class', dashboard.answersOpen)
            dashboard.getOpenCloseStudents()
                .click({force:true})
            dashboard.getStudentAnswersRow()
                .should('not.have.class', dashboard.answersOpen)
        })
    })

    describe('Question section', () => {
        it('can expand activity questions', () => {

        })
        it('can scroll across the different activities', () => {

        })
        it('can contract activity questions', () => {

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