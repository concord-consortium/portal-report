import { getByCypressTag } from '../../../utils'

class Header {
    getRefreshButton() {
        return cy.get('[data-cy=time] > .cc-button')
    }

    getTime() {
        return getByCypressTag('time').find('span')
    }

    getShowSelectedButton() {
        return getByCypressTag('button').eq(0)
    }

    getShowAll() {
        return getByCypressTag('button').eq(2)
    }

    getHideShowNames() {
        return getByCypressTag('button').eq(3)
    }

    getPrintStudentReports() {
        return getByCypressTag('button').eq(4)
    }

    getCheckbox() {
        return getByCypressTag('checkbox')
    }
    getLogo() {
        return cy.get('.logo')
    }
}

export default Header;