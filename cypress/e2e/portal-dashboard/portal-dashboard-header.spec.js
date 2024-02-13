context("Portal Dashboard Header", () => {
  before(() => {
    cy.visit("/?portal-dashboard", {
      onBeforeLoad(win) {
        cy.stub(win, "open");
      }
    });
  });

  context("Header menu items", () => {
    describe("Test header menu items", () => {
      it("Header menu items", () => {
        cy.log("verify help menu item goes to help page");
        cy.get("[data-cy=header-menu]").click();
        cy.get("[data-cy=help-menu-item").click();
        cy.window().its("open").should("be.called");

        cy.log("verify we start in non-compact response table mode");
        cy.get("[data-cy=student-answers-row]").should(($el) => {
          expect($el).to.have.css("height", "44px");
        });

        cy.log("verify we enter compact response table mode on menu item click");
        cy.get("[data-cy=header-menu]").click();
        cy.get("[data-cy=compact-menu-item]").should("be.visible").click();

        cy.get("[data-cy=student-answers-row]").should(($el) => {
          expect($el).to.have.css("height", "32px");
        });

        cy.log("verify badge legends are grayed out when menu item is checked");
        cy.get("[data-cy=header-menu]").click();
        cy.get("[data-cy=feedback-menu-item]").click();
        cy.get("[data-cy=feedback-legend] [data-cy=Given-legend-disabled]").should("exist");

        cy.log("verify badge legends are not grayed out when menu item is unchecked");
        cy.get("[data-cy=header-menu]").click();
        cy.get("[data-cy=feedback-menu-item]").click();
        cy.get("[data-cy=feedback-legend] [data-cy=Given-legend-disabled]").should("not.exist");

        cy.log("verify logo is visible");
        cy.get("[data-cy=header-logo").should("be.visible");

        cy.log("verify assignment title is visible");
        cy.get("[data-cy=choose-assignment]").should("be.visible");
      });
    });
  });
});