// A minimal RFC 4180 parser, enough to read back the dashboard's CSV.
const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\r" && text[i + 1] === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      i++;
    } else {
      cell += ch;
    }
  }
  return rows;
};

const pad = (n) => n.toString().padStart(2, "0");
const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};
const downloadPath = () =>
  `${Cypress.config("downloadsFolder")}/Test Class - Report Test Sequence - ${today()}.csv`;

// Reads the download back (after checking its BOM), with lookups by header name and student name.
const readDownload = () =>
  cy.readFile(downloadPath(), "utf8").then((text) => {
    expect(text.charCodeAt(0), "byte order mark").to.equal(0xFEFF);
    const rows = parseCsv(text.slice(1));
    const header = rows[0];
    const cellOf = (row, name) => row[header.indexOf(name)];
    const studentRow = (name) => rows.slice(3).find((row) => row[0] === name);
    return { rows, header, cellOf, studentRow };
  });

context("Portal Dashboard Download as CSV", () => {
  beforeEach(() => {
    cy.task("deleteFile", downloadPath());
  });

  describe("at a wide window", () => {
    beforeEach(() => {
      cy.visit("/?portal-dashboard");
    });

    it("downloads the class's answers from the header button", () => {
      cy.get("[data-cy=download-csv-button]").should("be.visible").click();
      readDownload().then(({ rows, header, cellOf, studentRow }) => {
        expect(header.slice(0, 9)).to.deep.equal(["Student Name", "Username", "Class", "Teachers", "Assignment",
          "Last Run", "Questions", "Answered", "Progress (%)"]);
        expect(cellOf(rows[1], "Activity 1 Q1")).to.equal("Q1: Open response question prompt");
        expect(rows[2]).to.include("Correct answer(s): a");

        const jenkins = studentRow("Jenkins, John");
        expect(cellOf(jenkins, "Activity 1 Q1")).to.equal("test answer 1");
        expect(cellOf(jenkins, "Teachers")).to.equal("Kristen Teachername, Pat Coteacher");
        expect(rows.slice(3).map((row) => cellOf(row, "Username")))
          .to.deep.equal(["jarmstrong", "kcrosby", "agalloway", "jjenkins", "jross", "jwu"]);

        // Edge cases in the demo answers: quotes, commas, a line break and non-ASCII, and a formula.
        expect(cellOf(studentRow("Wu, Jerome"), "Activity 1 Q1"))
          .to.equal('He said "it\'s hot, dry" and windy,\nthen the fire spread. Café ✓');
        expect(cellOf(studentRow("Crosby, Kate"), "Activity 2 Q10 Text")).to.equal("'=1+1 isn't a formula");

        // An interactive without readable text links to its single-question view.
        const link = cellOf(jenkins, "Activity 2 Q5");
        const params = new URL(link).searchParams;
        expect(params.get("iframeQuestionId")).to.equal("mw_interactive_28");
        expect(params.get("studentId")).to.equal("1");
        cy.visit(link);
        cy.get("iframe").should("exist");
      });
    });

    it("keeps the teacher's name on one line next to the button", () => {
      cy.get("[data-cy=download-csv-button]").should("be.visible");
      cy.get("[data-cy=account-owner]").invoke("outerHeight").should("equal", 32);
    });

    it("also offers Download in the hamburger menu while the button is shown", () => {
      cy.get("[data-cy=download-csv-button]").should("be.visible");
      cy.get("[data-cy=header-menu]").click();
      cy.get("[data-cy=download-csv-menu-item]").should("be.visible").click();
      readDownload().then(({ rows }) => {
        expect(rows.length).to.equal(9);
      });
    });

    it("uses a native button that can take focus", () => {
      cy.get("[data-cy=download-csv-button]").should("match", "button").focus().should("have.focus");
    });
  });

  describe("at a narrow window", () => {
    before(() => {
      cy.viewport(1150, 1000);
      cy.visit("/?portal-dashboard");
    });

    beforeEach(() => {
      cy.viewport(1150, 1000);
    });

    it("hides the button without moving the Assignment selector or the teacher's name", () => {
      cy.get("[data-cy=download-csv-button]").should("not.be.visible");
      const box = (selector) => cy.get(selector).then(($el) => {
        const { left, top, width, height } = $el[0].getBoundingClientRect();
        return { left, top, width, height };
      });
      box("[data-cy=choose-assignment]").then((assignmentBefore) => {
        box("[data-cy=account-owner]").then((ownerBefore) => {
          cy.get("[data-cy=download-csv-button]").invoke("remove");
          box("[data-cy=choose-assignment]").should("deep.equal", assignmentBefore);
          box("[data-cy=account-owner]").should("deep.equal", ownerBefore);
        });
      });
    });

    it("downloads from the hamburger menu", () => {
      cy.visit("/?portal-dashboard");
      cy.get("[data-cy=header-menu]").click();
      cy.get("[data-cy=download-csv-menu-item]").should("be.visible").click();
      readDownload().then(({ rows }) => {
        expect(rows.length).to.equal(9);
      });
    });
  });

  describe("with Anonymize students on", () => {
    before(() => {
      cy.visit("/?portal-dashboard");
      cy.get("[data-cy=anonymize-students]").within(() => {
        cy.get("[data-cy=toggle-control]").click();
      });
    });

    it("downloads anonymized names and no usernames", () => {
      cy.get("[data-cy=download-csv-button]").click();
      readDownload().then(({ rows, cellOf }) => {
        expect(rows.slice(3)).to.have.length(6);
        rows.slice(3).forEach((row) => {
          expect(row[0]).to.match(/^Student/);
          expect(cellOf(row, "Username")).to.equal("");
        });
      });
    });
  });
});
