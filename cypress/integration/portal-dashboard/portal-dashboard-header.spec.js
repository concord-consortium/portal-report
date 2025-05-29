context("Portal Dashboard Header", () => {
  before(() => {
    cy.visit("/?portal-dashboard", {
      onBeforeLoad(win) {
        cy.stub(win, "open");
      }
    });
  });

  context("Header menu items", () => {
    describe("Help menu", () => {
      it("verify help menu item goes to help page", () => {
        cy.get("[data-cy=header-menu]").click();
        cy.get("[data-cy=help-menu-item").click();
        cy.window().its("open").should("be.called");
      });
    });
    describe("Response Area Compact Mode", () => {
      it("verify we start in non-compact response table mode", () => {
        cy.get("[data-cy=student-answers-row]").should(($el) => {
          expect($el).to.have.css("height", "44px");
        });
      });
      it("verify we enter compact response table mode on menu item click", () => {
        cy.get("[data-cy=header-menu]").click();
        cy.get("[data-cy=compact-menu-item]").should("be.visible").click();

        cy.get("[data-cy=student-answers-row]").should(($el) => {
          expect($el).to.have.css("height", "32px");
        });
      });
    });
    describe("Show/hide Last Run column", () => {
      it("verify we can hide Last Run column", () => {
        cy.get("[data-cy=last-run-header]").should("be.visible");
        cy.get("[data-cy=last-run-row]").should("be.visible").and("have.length", 6);
        cy.get("[data-cy=header-menu]").click();
        cy.get("[data-cy=menu-list]").should("be.visible");
        cy.get("[data-cy=last-run-menu-item]").click();
        cy.get("[data-cy=menu-list]").should("not.be.visible");
        cy.wait(1000);
        cy.get("[data-cy=last-run-header]").should("not.exist");
        cy.get("[data-cy=last-run-row]").should("not.exist");
      });
      it("verify we can show Last Run column", () => {
        cy.get("[data-cy=header-menu]").click();
        cy.get("[data-cy=menu-list]").should("be.visible");
        cy.get("[data-cy=last-run-menu-item]").click();
        cy.get("[data-cy=menu-list]").should("not.be.visible");
        cy.get("[data-cy=last-run-header]").should("be.visible");
        cy.get("[data-cy=last-run-row]").should("be.visible").and("have.length", 6);
      });
      it("verify 'Hide Last Run column' option's selected state is maintained across all views", () => {
        // First hide the column
        cy.get("[data-cy=header-menu]").click();
        cy.get("[data-cy=menu-list]").should("be.visible");
        // Click the menu item to hide the column
        cy.get("[data-cy=last-run-menu-item]").click();
        cy.get("[data-cy=last-run-header]").should("not.exist");
        cy.get("[data-cy=last-run-row]").should("not.exist");
        
        // When column is hidden, checkmark should be present
        cy.get("[data-cy=header-menu]").click();
        cy.get("[data-cy=menu-list]").should("be.visible");
        cy.get("[data-testid=last-run-menu-item-selected]").should("exist");
        
        // Check state in response details view
        cy.get("[data-cy=navigation-select]").click();
        cy.get("[data-cy=list-item-response-details]").click();
        cy.get("[data-cy=header-menu]").click();
        cy.get("[data-cy=menu-list]").should("be.visible");
        cy.get("[data-testid=last-run-menu-item-selected]").should("exist");
        
        // Check state in feedback report view
        cy.get("[data-cy=navigation-select]").click();
        cy.get("[data-cy=list-item-feedback-report]").click();
        cy.get("[data-cy=header-menu]").click();
        cy.get("[data-cy=menu-list]").should("be.visible");
        cy.get("[data-testid=last-run-menu-item-selected]").should("exist");
        
        // Check state in progress dashboard view
        cy.get("[data-cy=navigation-select]").click();
        cy.get("[data-cy=list-item-progress-dashboard]").click();
        cy.get("[data-cy=header-menu]").click();
        cy.get("[data-cy=menu-list]").should("be.visible");
        cy.get("[data-testid=last-run-menu-item-selected]").should("exist");
        
        // Now show the column again
        // Click the menu item to show the column
        cy.get("[data-cy=last-run-menu-item]").click();
        cy.get("[data-cy=last-run-header]").should("be.visible");
        cy.get("[data-cy=last-run-row]").should("be.visible");
        
        // When column is shown, checkmark should be present
        cy.get("[data-cy=header-menu]").click();
        cy.get("[data-cy=menu-list]").should("be.visible");
        cy.get("[data-testid=last-run-menu-item-selected]").should("exist");
        
        // Check state in response details view
        cy.get("[data-cy=navigation-select]").click();
        cy.get("[data-cy=list-item-response-details]").click();
        cy.get("[data-cy=header-menu]").click();
        cy.get("[data-cy=menu-list]").should("be.visible");
        cy.get("[data-testid=last-run-menu-item-selected]").should("exist");
        
        // Check state in feedback report view
        cy.get("[data-cy=navigation-select]").click();
        cy.get("[data-cy=list-item-feedback-report]").click();
        cy.get("[data-cy=header-menu]").click();
        cy.get("[data-cy=menu-list]").should("be.visible");
        cy.get("[data-testid=last-run-menu-item-selected]").should("exist");
        
        // Check state in progress dashboard view
        cy.get("[data-cy=navigation-select]").click();
        cy.get("[data-cy=list-item-progress-dashboard]").click();
      });
    });
    describe("Hide Feedback Badges setting", () => {
      it("verify badge legends are grayed out when menu item is checked", () => {
        cy.get("[data-cy=header-menu]").click();
        cy.get("[data-cy=menu-list]").should("be.visible");
        cy.get("[data-cy=feedback-menu-item]").click();
        cy.get("[data-cy=menu-list]").should("not.be.visible");
        cy.get("[data-cy=feedback-legend] [data-cy=Given-legend-disabled]").should("exist");
      });
      it("verify badge legends are not grayed out when menu item is unchecked", () => {
        cy.get("[data-cy=header-menu]").click();
        cy.get("[data-cy=menu-list]").should("be.visible");
        cy.get("[data-cy=feedback-menu-item]").click();
        cy.get("[data-cy=menu-list]").should("not.be.visible");
        cy.get("[data-cy=feedback-legend] [data-cy=Given-legend-disabled]").should("not.exist");
      });
    });
  });
  context("Header elements are present", () => {
    describe("Header left", () => {
      it("verify logo is visible", () => {
        cy.get("[data-cy=header-logo").should("be.visible");
      });
    });
    describe("Header center", () => {
      it("verify assignment title is visible", () => {
        cy.get("[data-cy=choose-assignment]").should("be.visible");
      });
    });
  });
});
