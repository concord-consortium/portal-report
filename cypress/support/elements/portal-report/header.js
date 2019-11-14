import { getByCypressTag } from "../../../utils";

class Header {
    getRefreshButton() {
        return cy.get("[data-cy=time] > .cc-button");
    }

    getTime() {
        return getByCypressTag("time").find("span");
    }

    getShowSelectedButton() {
        return cy.contains(".report-content .controls a", /show selected/i);
    }

    getShowAll() {
        return cy.contains(".report-content .controls a", /show all/i);
    }

    getHideShowNames() {
        return cy.contains(".report-content .controls a", /names/i);
    }

    getPrintStudentReports() {
        return cy.contains(".report-content .controls a", /print/i);
    }

    getCheckbox(i) {
        return cy.get(".report-content")
            .not(".hidden").within(() => {
                cy.get(".question-header").eq(i)
                    .children().eq(0);
            });
    }
    getLogo() {
        return cy.get(".logo");
    }
}

export default Header;
