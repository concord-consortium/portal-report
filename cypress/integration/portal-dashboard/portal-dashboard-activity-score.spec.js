import ActivityScore from "../../support/elements/portal-report/activity-score-settings";

context("Portal Dashboard Anonymous Mode",() =>{

  const score = new ActivityScore();

  beforeEach(() => {
    cy.visit("/?portal-dashboard");
    cy.get('[data-cy=navigation-select]').click();
    cy.get('[data-cy="list-item-feedback-report"]').should('be.visible').click();
  });

    it('verify activity level feedback is displayed by default',()=>{
      cy.get('[data-cy=activity-level-feedback-button]').invoke("attr", "class").should("contain", "active");
    });
    it('verify activity level feedback content',()=>{
      cy.get('[data-cy=feedback-note-toggle-button]').invoke("attr", "title").should("contain", "Note on activity-level feedback");
      cy.get('[data-cy=feedback-settings-toggle]').should("exist");
      cy.get('[data-cy=feedback-settings-toggle]')
      .should("contain", "Activity Score:")
      .should("contain", "rubric");
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score--']").should("exist");
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score_avg--']")
      .should("contain", "Avg. Score:")
      .should("contain", "0 / 12");
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_summary']")
      .should("contain", "Rubric Summary:")
      .should("contain", "N/A");
    });
    it('verify activity score settings dialog',()=>{
      cy.get('[data-cy=feedback-settings-toggle-button]').invoke("attr", "title").should("contain", "Activity score settings");
      cy.get('[data-cy=feedback-settings-toggle-button]').click();
      cy.get('[data-cy=feedback-settings-modal]').should("exist");
      cy.get('[data-cy=feedback-settings-modal-header]').should("contain", "Activity Score Settings");
      score.verifyActivityScoreSettingsOptionLabel("No score", "No score");
      score.verifyActivityScoreSettingsOptionLabel("Manual", "Manual score");
      score.verifyActivityScoreSettingsOptionLabel("Rubric", "Use score from rubric");
      score.verifyActivityScoreSettingsOptionLabel("MCQ Scored", "Use score from autoscored multiple-choice questions");
      score.verifyActivityScoreSettingsOptionInfo("Manual")
      .should("contain", "All activities within this assignment can be scored up to your specified max score.")
      .should("contain", "You may also choose ")
      .should("contain", "not to score")
      .should("contain", " any student’s activities by not entering values in the entry fields.");
      score.verifyActivityScoreSettingsOptionInfo("Rubric")
      .should("contain", "All activities within this assignment will receive a score based on the activity-level rubric scores you’ve selected.");
      score.verifyActivityScoreSettingsOptionInfo("MCQ Scored")
      .should("contain", "All activities within this assignment will receive a score based on the total score of autoscored multiple-choice questions.");
      score.getCancelButton().should("exist");
      score.getCancelButton().should("contain", "Cancel");
      score.getSaveButton().should("exist");
      score.getSaveButton().should("contain", "Save");
    });
    it('verify no score activity settings',()=>{
      cy.get('[data-cy=feedback-settings-toggle-button]').invoke("attr", "title").should("contain", "Activity score settings");
      cy.get('[data-cy=feedback-settings-toggle-button]').click();
      cy.get('[data-cy=feedback-settings-modal]').should("exist");
      score.selectActivityScoreSettingsOption("No score");
      score.getSaveButton().click();
      cy.get('[data-cy=feedback-settings-toggle]')
      .should("contain", "Activity Score:")
      .should("contain", "none");
      cy.get('[class*=activity-feedback-score--activityFeedbackScore--]').should("not.exist");
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score--']").should("exist");
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score_avg--']").should("not.exist");
      score.verifyScoreNotDisplayedInRubricScoreHeader();
      cy.get('[data-cy=navigation-select]').click();
      cy.get('[data-cy="list-item-progress-dashboard"]').should('be.visible').click();
      cy.get('[data-cy="collapsed-activity-button"]').find('[class^=level-viewer--activityInnerButton--]').eq(0).click();
      cy.get('[data-cy="activity-score"]')
      .should("contain", "No")
      .should("contain", "Score");
      cy.get('[class*=student-answers--score--]').eq(2).should("contain", "N/A");
      cy.get('[data-cy="activity-score"]').eq(0).click();
      cy.get('[data-cy=activity-level-feedback-button]').invoke("attr", "class").should("contain", "active");
      cy.get('[data-cy=feedback-settings-toggle]')
      .should("contain", "Activity Score:")
      .should("contain", "none");
      cy.get('[class*=activity-feedback-score--activityFeedbackScore--]').should("not.exist");
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score--']").should("exist");
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score_avg--']").should("not.exist");
    });
    it('verify manual score activity settings',()=>{
      cy.get('[data-cy=feedback-settings-toggle-button]').invoke("attr", "title").should("contain", "Activity score settings");
      cy.get('[data-cy=feedback-settings-toggle-button]').click();
      cy.get('[data-cy=feedback-settings-modal]').should("exist");
      cy.get('[class*=feedback-settings-modal--maxScore--]').invoke("attr", "class").should("contain", "disabled");
      score.selectActivityScoreSettingsOption("Manual");
      cy.get('[class*=feedback-settings-modal--maxScore--]').invoke("attr", "class").should("not.contain", "disabled");
      score.getSaveButton().click();
      cy.get('[data-cy=feedback-settings-toggle]')
      .should("contain", "Activity Score:")
      .should("contain", "manual");
      score.getActivityFeedbackScore().eq(0).should("exist");
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score--']").should("exist");
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score_avg--']").should("exist");
      score.verifyScoreNotDisplayedInRubricScoreHeader();
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score_avg--']")
      .should("contain", "Avg. Score:")
      .should("contain", "0 / 10");
      cy.get('[data-cy=rubric-summary-icon]').should("contain", "N/A");
      cy.get('[class^=rubric-summary-icon--rubricSummaryIconRows--]').should("not.exist");
      score.getActivityFeedbackScore().eq(0).find('[class*=activity-feedback-score--scoreLabel--]').should("contain", "Score");
      score.getActivityFeedbackScore().eq(0).find('input').invoke("attr", "value").should("contain", "");
      score.getActivityFeedbackScore().eq(0).find('input').click().type(5);
      score.getActivityFeedbackScore().eq(1).find('input').click().type(10);
      score.getActivityFeedbackScore().eq(2).find('input').click();
      score.getActivityFeedbackScore().eq(0).find('input').invoke("attr", "value").should("contain", "5");
      score.getActivityFeedbackScore().eq(1).find('input').invoke("attr", "value").should("contain", "10");
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score_avg--']").should("contain", "7.5 / 10");
      cy.get('[data-cy=navigation-select]').click();
      cy.get('[data-cy="list-item-progress-dashboard"]').should('be.visible').click();
      cy.get('[data-cy="collapsed-activity-button"]').find('[class^=level-viewer--activityInnerButton--]').eq(0).click();
      cy.get('[data-cy="activity-score"]')
      .should("contain", "Manual")
      .should("contain", "Score");
      cy.get('[class*=student-answers--score--]').eq(2).should("contain", "5/10");
      cy.get('[class*=student-answers--score--]').eq(3).should("contain", "10/10");
      cy.get('[class*=student-answers--score--]').eq(4).should("contain", "N/A");
      cy.get('[data-cy="activity-score"]').eq(0).click();
      cy.get('[data-cy=activity-level-feedback-button]').invoke("attr", "class").should("contain", "active");
      cy.get('[data-cy=feedback-settings-toggle]')
      .should("contain", "Activity Score:")
      .should("contain", "manual");
      cy.get('[class*=activity-feedback-score--activityFeedbackScore--]').should("exist");
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score--']").should("exist");
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score_avg--']").should("exist");
      score.getActivityFeedbackScore().eq(0).find('input').invoke("attr", "value").should("contain", "5");
      score.getActivityFeedbackScore().eq(1).find('input').invoke("attr", "value").should("contain", "10");
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score_avg--']").should("contain", "7.5 / 10");
    });
    it('verify rubric score activity settings',()=>{
      cy.get('[data-cy=feedback-settings-toggle-button]').invoke("attr", "title").should("contain", "Activity score settings");
      cy.get('[data-cy=feedback-settings-toggle]')
      .should("contain", "Activity Score:")
      .should("contain", "rubric");
      score.getActivityFeedbackScore().eq(0).should("exist");
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score--']").should("exist");
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score_avg--']").should("exist");
      score.verifyScoreDisplayedInRubricScoreHeader();
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score_avg--']")
      .should("contain", "Avg. Score:")
      .should("contain", "0 / 12");
      cy.get('[data-cy=rubric-summary-icon]').should("contain", "N/A");
      cy.get('[class^=rubric-summary-icon--rubricSummaryIconRows--]').should("not.exist");
      score.getActivityFeedbackScore().eq(0).find('[class*=activity-feedback-score--scoreLabel--]').should("contain", "Score");
      score.getActivityFeedbackScore().eq(0).should("contain", "N/A");
      score.selectRubricScore(1, 1, 1);
      score.selectRubricScore(1, 2, 2);
      score.selectRubricScore(1, 3, 1);
      score.selectRubricScore(1, 4, 2);
      score.selectRubricScore(2, 1, 2);
      score.selectRubricScore(2, 2, 1);
      score.selectRubricScore(2, 3, 2);
      score.selectRubricScore(2, 4, 1);
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score_avg--']").should("contain", "9.5 / 12");
      cy.get('[class^=rubric-summary-icon--rubricSummaryIconRows--]').should("exist");
      cy.get('[data-cy=navigation-select]').click();
      cy.get('[data-cy="list-item-progress-dashboard"]').should('be.visible').click();
      cy.get('[data-cy="collapsed-activity-button"]').find('[class^=level-viewer--activityInnerButton--]').eq(0).click();
      cy.get('[data-cy="activity-score"]')
      .should("contain", "Rubric")
      .should("contain", "Score");
      cy.get('[class*=student-answers--score--]').eq(2).should("contain", "10/12");
      cy.get('[class*=student-answers--score--]').eq(3).should("contain", "9/12");
      cy.get('[class*=student-answers--score--]').eq(4).should("contain", "N/A");
      cy.get('[data-cy="activity-score"]').eq(0).click();
      cy.get('[data-cy=activity-level-feedback-button]').invoke("attr", "class").should("contain", "active");
      cy.get('[data-cy=feedback-settings-toggle]')
      .should("contain", "Activity Score:")
      .should("contain", "rubric");
      cy.get('[class*=activity-feedback-score--activityFeedbackScore--]').should("exist");
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score--']").should("exist");
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score_avg--']").should("exist");
    });
    it('verify mcq auto score activity settings',()=>{
      cy.get('[data-cy=feedback-settings-toggle-button]').invoke("attr", "title").should("contain", "Activity score settings");
      cy.get('[data-cy=feedback-settings-toggle-button]').click();
      cy.get('[data-cy=feedback-settings-modal]').should("exist");
      score.selectActivityScoreSettingsOption("MCQ Scored");
      score.getSaveButton().click();
      cy.get('[data-cy=feedback-settings-toggle]')
      .should("contain", "Activity Score:")
      .should("contain", "auto");
      cy.get('[class*=activity-feedback-score--activityFeedbackScore--]').should("not.exist");
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score--']").should("exist");
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score_avg--']").should("not.exist");
      score.verifyScoreNotDisplayedInRubricScoreHeader();
      cy.get('[data-cy=navigation-select]').click();
      cy.get('[data-cy="list-item-progress-dashboard"]').should('be.visible').click();
      cy.get('[data-cy="collapsed-activity-button"]').find('[class^=level-viewer--activityInnerButton--]').eq(0).click();
      cy.get('[data-cy="activity-score"]')
      .should("contain", "MC Qs")
      .should("contain", "Score");
      cy.get('[class*=student-answers--score--]').eq(2).should("contain", "0/1");
      cy.get('[data-cy="activity-score"]').eq(0).click();
      cy.get('[data-cy=activity-level-feedback-button]').invoke("attr", "class").should("contain", "active");
      cy.get('[data-cy=feedback-settings-toggle]')
      .should("contain", "Activity Score:")
      .should("contain", "auto");
      cy.get('[class*=activity-feedback-score--activityFeedbackScore--]').should("not.exist");
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score--']").should("exist");
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score_avg--']").should("not.exist");
    });
    it('verify rubric summary and details',()=>{
      cy.get('[data-cy=feedback-settings-toggle-button]').invoke("attr", "title").should("contain", "Activity score settings");
      cy.get('[data-cy=rubric-summary-icon]').should("contain", "N/A");
      cy.get('[class^=rubric-summary-icon--rubricSummaryIconRows--]').should("not.exist");
      score.getActivityFeedbackScore().eq(0).find('[class*=activity-feedback-score--scoreLabel--]').should("contain", "Score");
      score.getActivityFeedbackScore().eq(0).should("contain", "N/A");
      score.selectRubricScore(1, 1, 1);
      score.getRubricSummaryIcon().find('[class^=rubric-summary-icon--rubricSummaryIconRows--]').should("not.exist");
      score.selectRubricScore(1, 2, 1);
      score.selectRubricScore(1, 3, 1);
      score.selectRubricScore(1, 4, 1);
      score.getActivityFeedbackScore().eq(0).should("not.contain", "N/A");
      score.getRubricSummaryIcon().find('[class^=rubric-summary-icon--rubricSummaryIconRows--]').should("exist");
      score.verifyRubricSummaryIcon("Proficient", "height: 12px; width: 100%; background-color: rgb(189, 223, 194);");
      score.selectRubricScore(2, 1, 2);
      score.verifyRubricSummaryIcon("Proficient", "height: 12px; width: 100%; background-color: rgb(189, 223, 194);");
      score.getRubricSummaryIcon().click();
      score.getRubricSummaryDetailsDialog().should("exist");
      score.getRubricSummaryDetailsDialog().find('[data-cy=rubric-summary-modal-header]').should("contain", "Rubric Summary Details");
      score.verifyRubricSummaryDetailsDialog("Proficient", "100%");
      score.verifyRubricSummaryDetailsDialog("Beginning", "0%");
      score.getRubricSummaryDetailsDialogCloseButton().click();
      score.selectRubricScore(2, 2, 3);
      score.selectRubricScore(2, 3, 3);
      score.selectRubricScore(2, 4, 3);
      score.verifyRubricSummaryIcon("Proficient", "height: 12px; width: 50%; background-color: rgb(189, 223, 194);");
      score.verifyRubricSummaryIcon("Beginning", "height: 12px; width: 50%; background-color: rgb(49, 102, 57);");
      score.getRubricSummaryIcon().click();
      score.getRubricSummaryDetailsDialog().should("exist");
      score.verifyRubricSummaryDetailsDialog("Proficient", "50%");
      score.verifyRubricSummaryDetailsDialog("Beginning", "50%");
      score.getRubricSummaryDetailsDialogCloseButton().click();
    });
    it('verify score display in rubric summary details',()=>{
      score.selectRubricScore(1, 1, 1);
      score.selectRubricScore(1, 2, 1);
      score.selectRubricScore(1, 3, 1);
      score.selectRubricScore(1, 4, 1);
      score.getRubricSummaryIcon().click();
      score.getRubricSummaryDetailsDialog().should("exist");
      score.verifyScoreDisplayedInRubricSummaryDetailsDialogHeader();
      score.getRubricSummaryDetailsDialogCloseButton().click();
      cy.get('[data-cy=feedback-settings-toggle-button]').click();
      cy.get('[data-cy=feedback-settings-modal]').should("exist");
      score.selectActivityScoreSettingsOption("No score");
      score.getSaveButton().click();
      score.getRubricSummaryIcon().click();
      score.verifyScoreNotDisplayedInRubricSummaryDetailsDialogHeader();
      score.getRubricSummaryDetailsDialogCloseButton().click();
      cy.get('[data-cy=feedback-settings-toggle-button]').click();
      cy.get('[data-cy=feedback-settings-modal]').should("exist");
      score.selectActivityScoreSettingsOption("Manual");
      score.getSaveButton().click();
      score.getRubricSummaryIcon().click();
      score.verifyScoreNotDisplayedInRubricSummaryDetailsDialogHeader();
      score.getRubricSummaryDetailsDialogCloseButton().click();
      cy.get('[data-cy=feedback-settings-toggle-button]').click();
      cy.get('[data-cy=feedback-settings-modal]').should("exist");
      score.selectActivityScoreSettingsOption("MCQ Scored");
      score.getSaveButton().click();
      score.getRubricSummaryIcon().click();
      score.verifyScoreNotDisplayedInRubricSummaryDetailsDialogHeader();
      score.getRubricSummaryDetailsDialogCloseButton().click();
    });
    it('verify score greater than max score modal dialog',()=>{
      cy.get('[data-cy=feedback-settings-toggle-button]').click();
      score.selectActivityScoreSettingsOption("Manual");
      score.getSaveButton().click();
      score.getActivityFeedbackScore().eq(0).find('input').click().type(50);
      score.getActivityFeedbackScore().eq(1).find('input').click();
      cy.get('[data-cy=feedback-settings-toggle-button]').click();
      score.getSaveButton().click();
      score.getNewMaxScoreDialog().should("exist");
      score.getNewMaxScoreDialog().find('[data-cy=feedback-settings-modal-header]').should("contain", "Activity Score Settings");
      score.getNewMaxScoreDialog().find('[data-cy=feedback-settings-modal-content-area]')
      .should("contain", "Some of the current student scores will be above the new max score of 10.");
      score.getCancelButton().should("exist");
      score.getContinueButton().should("exist");
      score.getCancelButton().should("contain", "Cancel");
      score.getContinueButton().should("contain", "Continue");
      score.getCancelButton().click();
      cy.get('[data-cy=feedback-settings-modal]').should("exist");
      score.getSaveButton().click();
      score.getNewMaxScoreDialog().should("exist");
      score.getContinueButton().click();
      cy.get('[data-cy=feedback-settings-modal]').should("not.exist");
      cy.get('[data-cy=feedback-settings-toggle-button]').click();
      score.selectActivityScoreSettingsOption("No score");
      score.getSaveButton().click();
      score.getNewMaxScoreDialog().should("not.exist");
      cy.get('[data-cy=feedback-settings-toggle-button]').click();
      score.selectActivityScoreSettingsOption("Rubric");
      score.getSaveButton().click();
      score.getNewMaxScoreDialog().should("not.exist");
      cy.get('[data-cy=feedback-settings-toggle-button]').click();
      score.selectActivityScoreSettingsOption("MCQ Scored");
      score.getSaveButton().click();
      score.getNewMaxScoreDialog().should("not.exist");
      cy.get('[data-cy=feedback-settings-toggle-button]').click();
      score.selectActivityScoreSettingsOption("Manual");
      score.getSaveButton().click();
      score.getNewMaxScoreDialog().should("exist");
      score.getCancelButton().click();
      cy.get('[class*=feedback-settings-modal--maxScore--]').find('input').clear().type(50);
      score.getSaveButton().click();
      score.getNewMaxScoreDialog().should("not.exist");
    });
    it('verify show/hide student answers',()=>{
      score.getShowHideStudentAnswersButton().should("exist");
      cy.get('[class^=show-student-answers--answers--]').should("not.exist");
      score.getShowHideStudentAnswersButton().should("contain", "Show Student Answers");
      score.getShowHideStudentAnswersButton().invoke("attr", "class").should("not.contain", "showing");
      score.getShowHideStudentAnswersButton().click();
      score.getShowHideStudentAnswersButton().should("contain", "Hide Student Answers");
      score.getShowHideStudentAnswersButton().invoke("attr", "class").should("contain", "showing");
      cy.get('[class^=show-student-answers--answers--]').should("exist");
      score.getShowHideStudentAnswersButton().click();
      score.getShowHideStudentAnswersButton().should("contain", "Show Student Answers");
      score.getShowHideStudentAnswersButton().invoke("attr", "class").should("not.contain", "showing");
      cy.get('[class^=show-student-answers--answers--]').should("not.exist");
    });
    it('verify feedback badge status for no score and auto score',()=>{
      cy.get('[data-cy=feedback-settings-toggle-button]').click();
      score.selectActivityScoreSettingsOption("No score");
      score.getSaveButton().click();
      cy.get('[data-cy=feedback-badge] circle').eq(0).invoke("attr", "fill").should("contain", "#FFF");
      cy.get('[data-cy=item-number]').should("contain", "4");
      score.selectRubricScore(1, 1, 1);
      score.selectRubricScore(1, 2, 1);
      score.selectRubricScore(1, 3, 1);
      score.selectRubricScore(1, 4, 1);
      cy.get('[data-cy=feedback-badge] circle').eq(0).invoke("attr", "fill").should("contain", "#4EA15A");
      cy.get('[data-cy=item-number]').should("contain", "3");
      cy.get('[data-cy=feedback-badge] circle').eq(1).invoke("attr", "fill").should("contain", "#FFF");
      cy.get('[data-cy=feedback-textarea]').eq(1).click().type("Feedback");
      cy.get('[data-cy=feedback-badge] circle').eq(1).invoke("attr", "fill").should("contain", "#4EA15A");
      cy.get('[data-cy=item-number]').should("contain", "2");
      cy.get('[data-cy=feedback-settings-toggle-button]').click();
      score.selectActivityScoreSettingsOption("MCQ Scored");
      score.getSaveButton().click();
      cy.get('[data-cy=feedback-badge] circle').eq(2).invoke("attr", "fill").should("contain", "#FFF");
      cy.get('[data-cy=item-number]').should("contain", "2");
      score.selectRubricScore(3, 1, 1);
      score.selectRubricScore(3, 2, 1);
      score.selectRubricScore(3, 3, 1);
      score.selectRubricScore(3, 4, 1);
      cy.get('[data-cy=feedback-badge] circle').eq(2).invoke("attr", "fill").should("contain", "#4EA15A");
      cy.get('[data-cy=item-number]').should("contain", "1");
      cy.get('[data-cy=feedback-badge] circle').eq(3).invoke("attr", "fill").should("contain", "#FFF");
      cy.get('[data-cy=feedback-textarea]').eq(3).click().type("Feedback");
      cy.get('[data-cy=feedback-badge] circle').eq(3).invoke("attr", "fill").should("contain", "#4EA15A");
      cy.get('[data-cy=item-number]').should("contain", "0");
    });
    it('verify feedback badge status for rubric and manual score',()=>{
      cy.get('[data-cy=feedback-badge] circle').eq(0).invoke("attr", "fill").should("contain", "#FFF");
      cy.get('[data-cy=item-number]').should("contain", "4");
      cy.get('[data-cy=feedback-textarea]').eq(0).click().type("Feedback");
      cy.get('[data-cy=feedback-badge] circle').eq(0).invoke("attr", "fill").should("contain", "#FFF");
      cy.get('[data-cy=item-number]').should("contain", "4");
      score.selectRubricScore(1, 1, 1);
      score.selectRubricScore(1, 2, 1);
      score.selectRubricScore(1, 3, 1);
      score.selectRubricScore(1, 4, 1);
      cy.get('[data-cy=feedback-badge] circle').eq(0).invoke("attr", "fill").should("contain", "#4EA15A");
      cy.get('[data-cy=item-number]').should("contain", "3");
      cy.get('[data-cy=feedback-badge] circle').eq(1).invoke("attr", "fill").should("contain", "#FFF");
      score.selectRubricScore(2, 1, 1);
      score.selectRubricScore(2, 2, 1);
      score.selectRubricScore(2, 3, 1);
      score.selectRubricScore(2, 4, 1);
      cy.get('[data-cy=feedback-badge] circle').eq(1).invoke("attr", "fill").should("contain", "#4EA15A");
      cy.get('[data-cy=item-number]').should("contain", "2");
      cy.get('[data-cy=feedback-settings-toggle-button]').click();
      score.selectActivityScoreSettingsOption("Manual");
      score.getSaveButton().click();
      cy.get('[data-cy=feedback-badge] circle').eq(0).invoke("attr", "fill").should("contain", "#FFF");
      cy.get('[data-cy=feedback-badge] circle').eq(1).invoke("attr", "fill").should("contain", "#FFF");
      cy.get('[data-cy=feedback-badge] circle').eq(2).invoke("attr", "fill").should("contain", "#FFF");
      cy.get('[data-cy=item-number]').should("contain", "4");
      score.selectRubricScore(3, 1, 1);
      score.selectRubricScore(3, 2, 1);
      score.selectRubricScore(3, 3, 1);
      score.selectRubricScore(3, 4, 1);
      cy.get('[data-cy=feedback-badge] circle').eq(2).invoke("attr", "fill").should("contain", "#FFF");
      cy.get('[data-cy=item-number]').should("contain", "4");
      cy.get('[data-cy=feedback-textarea]').eq(2).click().type("Feedback");
      cy.get('[data-cy=feedback-badge] circle').eq(2).invoke("attr", "fill").should("contain", "#FFF");
      cy.get('[data-cy=item-number]').should("contain", "4");
      score.getActivityFeedbackScore().eq(2).find('input').click().type(10);
      cy.get('[data-cy=feedback-badge] circle').eq(2).invoke("attr", "fill").should("contain", "#4EA15A");
      cy.get('[data-cy=item-number]').should("contain", "3");
    });
    it('verify previous activity info is not displayed in the activity level feedback',()=>{
      score.selectRubricScore(1, 1, 1);
      score.selectRubricScore(1, 2, 1);
      score.selectRubricScore(1, 3, 1);
      score.selectRubricScore(1, 4, 1);
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score_avg--']").should("contain", "12 / 12");
      cy.get('[data-cy=activity-navigator-next-button] [class^=activity-navigator--icon--]').click();
      cy.get('[data-cy=activity-title]').should("contain", "Activity #2");
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score_avg--']").should("contain", "0 / 12");
      cy.get('[data-cy=feedback-settings-toggle-button]').click();
      score.selectActivityScoreSettingsOption("Manual");
      score.getSaveButton().click();
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score_avg--']").should("contain", "0 / 10");
      score.getActivityFeedbackScore().eq(0).find('input').click().type(50);
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score_avg--']").should("contain", "50 / 10");
      cy.get('[data-cy=feedback-settings-toggle-button]').click();
      score.getSaveButton().click();
      score.getNewMaxScoreDialog().should("exist");
      score.getContinueButton().click();
      cy.get('[data-cy=activity-navigator-previous-button] [class^=activity-navigator--icon--]').click();
      cy.get('[data-cy=activity-title]').should("contain", "Activity #1");
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score_avg--']").should("contain", "12 / 12");
      cy.get('[data-cy=feedback-settings-toggle-button]').click();
      score.selectActivityScoreSettingsOption("Manual");
      score.getSaveButton().click();
      score.getNewMaxScoreDialog().should("not.exist");
      cy.get("[class^='feedback-legend--feedbackBadgeLegend__rubric_score_avg--']").should("contain", "0 / 10");
    });
});