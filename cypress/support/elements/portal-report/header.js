import { getByCypressTag } from '../../../utils'

class Header {
    getRefreshButton() {
        return cy.get('[data-cy=time] > .cc-button')
    }

    getTime() {
        return getByCypressTag('time').find('span')
    }

    getShowSelectedButton() {
        return cy.get('.report-content').not('.hidden')
            .within(() => {
                cy.get('.controls').eq(0).children().eq(0)
            })
    }

    getShowAll() {
        return cy.get('.report-content').not('.hidden')
            .within(() => {
                cy.get('.controls').eq(0).children().eq(1)
            })
    }

    getHideShowNames() {
        return cy.get('.report-content').not('.hidden')
            .within(() => {
                cy.get('.controls').eq(0).children().eq(2)
            })
    }

    getPrintStudentReports() {
        return cy.get('.report-content').not('.hidden')
        .within(() => {
            cy.get('.controls').eq(0).children().eq(3)
        })    }

    getCheckbox(i) {
        return cy.get('.report-content')
            .not('.hidden').within(() => {
                cy.get('.question-header').eq(i)
                    .children().eq(0)
            })
    }
    getLogo() {
        return cy.get('.logo')
    }
}

export default Header;