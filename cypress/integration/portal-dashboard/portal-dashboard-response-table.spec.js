context("Portal Dashboard Response Table",()=>{
  before(()=>{
      cy.visit("/?portal-dashboard");
  });

  it('verify we have the right number of student rows',()=>{
    cy.get('[data-cy=student-answers-row]').should('be.visible');
    cy.get('[data-cy=student-answers-row]').should('have.length', 6);
  });

  it('verify we display the correct student progress',()=>{
    cy.get('[data-cy=student-answers-row]')
      .eq(2)
      .should("contain", "2/7")
      .find('[data-cy=InProgress]').should('be.visible');
    cy.get('[data-cy=student-answers-row]')
      .eq(5)
      .should("contain", "5/7")
      .find('[data-cy=InProgress]').should('be.visible');
    cy.get('[data-cy=student-answers-row]')
      .eq(3)
      .find('[data-cy=Completed]').should('be.visible');
    cy.get('[data-cy=student-answers-row]')
      .eq(0)
      .find('[data-cy=NotStarted]').should('be.visible');
  });

  function aType(name) {
    // TODO: Figure out how to import AnswerTypes so we can do the following:
    // const foundType = AnswerTypes.find(at => at.name === name);
    // if (!foundType) {
    //   throw new Error(`Invalid answer type: ${name}`);
    // }
    return {name};
  }

  function getAnswerIconId (answerType) {
    const searchRegExp = / /g;
    const iconId = answerType ? answerType.name.toLowerCase().replace(searchRegExp, "-") : "";
    return iconId;
  }

  function aTypeMatcher(answerType) {
    const dataCy = answerType === null ?
      "no-answer" :
      getAnswerIconId(answerType);
    return `[data-cy=${dataCy}]`;
  }

  function checkAnswerTable(answerTable) {
    const numRows = answerTable.length;
    const numCols = answerTable[0].length;
    for (let row = 0; row < numRows; row++){
      for (let col = 0; col < numCols; col++){
        const expectedAnswerType = answerTable[row][col];
        cy.get('[data-cy=student-answers-row]')
        .eq(row)
        .find('[data-cy=student-answer]')
        .eq(col)
        .find(aTypeMatcher(expectedAnswerType)).should('be.visible');
      }
    }
  }

  it('verify we display the correct student answer icons',()=>{
    const OR = aType("Open Response Completed");
    const MC = aType("Multiple Choice NonScored Completed");
    const Mx = aType("Multiple Choice Scored Incorrect");
    const Mv = aType("Multiple Choice Scored Correct");
    const IQ = aType("Image Question with Open Response Completed");
    const IA = aType("Interactive Completed");
    const __ = null;

    cy.get('[data-cy=collapsed-activity-button]').first().click();

    const activity1Table = [
    // P1                  | P2
    // Q1, Q2, Q3, Q4, Q5, | Q6, Q7
      [__, __, __, __, __,   __, __],
      [__, __, __, __, __,   __, __],
      [OR, __, __, __, __,   IQ, __],
      [OR, MC, Mx, OR, MC,   IQ, IA],
      [__, __, __, __, MC,   IQ, __],
      [OR, MC, Mv, __, __,   IQ, IA],
    ];

    checkAnswerTable(activity1Table);

    cy.get('[data-cy=collapsed-activity-button]').first().click();

    const activity2Table = [
    // P1                                           | P2
    // Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10, Q11 | Q12
      [__, __, IA, IA, IA, IA, IA, IA, __, __, __,    IA ],
      [__, __, IA, __, IA, IA, IA, IA, __, IQ, __,    __ ],
      [__, __, IA, __, __, IA, __, IA, __, __, __,    __ ],
      [IA, IA, IA, IA, IA, IA, IA, __, IQ, IQ, IA,    __ ],
      [__, __, IA, __, IA, IA, IA, IA, __, __, __,    __ ],
      [IA, IA, IA, __, __, __, __, IA, __, __, __,    __ ],
    ];

    checkAnswerTable(activity2Table);

  });
  it('verify click on response icon opens question detail for student', ()=>{
    cy.get('[data-cy=collapsed-activity-button]').first().click();
    cy.get('[data-cy=open-response-completed]').eq(2).click();
    cy.get('[data-cy=answerText]').should('be.visible').and('contain', "test required answer 2");
    cy.get('[data-cy=student-name').should('contain', 'Jenkins, John');
    cy.get('[data-cy=multiple-choice-nonscored-completed]').eq(2).click();
    cy.get('[data-cy=multiple-choice-answers]').should('be.visible');
    cy.get('[data-cy=student-name').should('contain', 'Wu, Jerome');
    cy.get('[data-cy=question-overlay-header-button]').click();
  });
  it('verify click on student name opens response view with student answers', ()=>{
    cy.get('[data-cy=student-name]').contains('Galloway, Amy').click();
    cy.get('[data-cy=student-navigator] [data-cy=student-name]').should('contain','Galloway, Amy');
    cy.get('[data-cy=question-wrapper]').eq(0).should('contain', 'Q1');
    cy.get('[data-cy=student-response]').eq(0).should('contain', 'test answer 2');
  });
});

context("Feedback badges in response table", () => {
  before(()=>{
    cy.visit("/?portal-dashboard&enableFirestorePersistence=true&clearFirestorePersistence=true");
    cy.get("[data-cy=navigation-select]").click();
    cy.get("[data-cy=list-item-feedback-report]").click();
    cy.get("[data-cy=feedback-textarea]").eq(0).click().type("Good job!");
    cy.get("[data-cy=activity-level-feedback-button]").click();
    cy.get("[data-cy=feedback-textarea]").eq(0).click().type("Good job!");
    cy.get("[data-cy=navigation-select]").click();
    cy.get("[data-cy=list-item-progress-dashboard]").click();
  });

  it("Activity feedback badge appears in response table when there is feedback given", () => {
    cy.get("[data-cy=activity-feedback-badge]").should("be.visible");
  });
  it("Question feedback badge appears in response table when there is feedback given", () => {
    cy.get("[data-cy=collapsed-activity-button]").eq(0).click();
    cy.get("[data-cy=question-feedback-badge]").should("be.visible");
  });
});
