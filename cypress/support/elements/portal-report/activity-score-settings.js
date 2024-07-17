import { getByCypressTag } from "../../../utils";

class ActivityScore {

  verifyActivityScoreSettingsOptionLabel(setting, label) {
    const option = ["No score", "Manual", "Rubric", "MCQ Scored"];
    cy.get('[class^=feedback-settings-modal--modalOption--]').eq(option.indexOf(setting)).find('[class^=feedback-settings-modal-button--modalButtonLabel--]').should("contain", label);
  }
  verifyActivityScoreSettingsOptionInfo(setting) {
    const option = ["No score", "Manual", "Rubric", "MCQ Scored"];
    return cy.get('[class^=feedback-settings-modal--modalOption--]').eq(option.indexOf(setting)).find('[class^=feedback-settings-modal--modalOptionInfo--]');
  }
  selectActivityScoreSettingsOption(setting) {
    const option = ["No score", "Manual", "Rubric", "MCQ Scored"];
    cy.get('[class^=feedback-settings-modal--modalOption--]').eq(option.indexOf(setting)).find('[data-cy=feedback-settings-radio-button]').click();
  }
  getCancelButton() {
    return cy.get('[data-cy=feedback-settings-modal-close-button]').eq(0);
  }
  getSaveButton() {
    return cy.get('[data-cy=feedback-settings-modal-close-button]').eq(1);
  }
  getActivityFeedbackScore() {
    return cy.get('[class*=activity-feedback-score--activityFeedbackScore--]');
  }
  verifyScoreNotDisplayedInRubricScoreHeader() {
    cy.get('[class^=rubric-table--rubricScoreHeader--]').eq(0).should("not.contain", "3");
    cy.get('[class^=rubric-table--rubricScoreHeader--]').eq(1).should("not.contain", "2");
    cy.get('[class^=rubric-table--rubricScoreHeader--]').eq(2).should("not.contain", "1");
  }
  verifyScoreDisplayedInRubricScoreHeader() {
    cy.get('[class^=rubric-table--rubricScoreHeader--]').eq(0).should("contain", "3");
    cy.get('[class^=rubric-table--rubricScoreHeader--]').eq(1).should("contain", "2");
    cy.get('[class^=rubric-table--rubricScoreHeader--]').eq(2).should("contain", "1");
  }
  selectRubricScore(table, row, score) {
    cy.get('[class^=rubric-table--rubricTable--]').eq(table - 1).find('[class^=rubric-table--ratingsGroup--]').eq(row - 1).find('[data-cy=rating-radio-button]').eq(score - 1).click();
  }
  getRubricSummaryIcon() {
    return cy.get('[data-cy=rubric-summary-icon]');
  }
  verifyRubricSummaryIcon(score, prop) {
    const option = ["Proficient", "Developing", "Beginning"];
    this.getRubricSummaryIcon().find('[class^=rubric-summary-icon--rubricSummaryIconRow--]').eq(0).find('div').eq(option.indexOf(score)).invoke("attr", "style").should("contain", prop);
    this.getRubricSummaryIcon().find('[class^=rubric-summary-icon--rubricSummaryIconRow--]').eq(1).find('div').eq(option.indexOf(score)).invoke("attr", "style").should("contain", prop);
  }
  getRubricSummaryDetailsDialog() {
    return cy.get('[data-cy=rubric-summary-modal]');
  }
  verifyScoreNotDisplayedInRubricSummaryDetailsDialogHeader() {
    this.getRubricSummaryDetailsDialog().find('[class^=rubric-table--rubricScoreHeader--]').eq(0).should("not.contain", "3");
    this.getRubricSummaryDetailsDialog().find('[class^=rubric-table--rubricScoreHeader--]').eq(1).should("not.contain", "2");
    this.getRubricSummaryDetailsDialog().find('[class^=rubric-table--rubricScoreHeader--]').eq(2).should("not.contain", "1");
  }
  verifyScoreDisplayedInRubricSummaryDetailsDialogHeader() {
    this.getRubricSummaryDetailsDialog().find('[class^=rubric-table--rubricScoreHeader--]').eq(0).should("contain", "3");
    this.getRubricSummaryDetailsDialog().find('[class^=rubric-table--rubricScoreHeader--]').eq(1).should("contain", "2");
    this.getRubricSummaryDetailsDialog().find('[class^=rubric-table--rubricScoreHeader--]').eq(2).should("contain", "1");
  }
  verifyRubricSummaryDetailsDialog(score, percentage) {
    const option = ["Proficient", "Developing", "Beginning"];
    this.getRubricSummaryDetailsDialog().find('[class^=rubric-table--ratingsGroup--]').eq(0).find('[class^=rubric-table--rubricScoreBox--]').eq(option.indexOf(score)).should("contain", percentage);
    this.getRubricSummaryDetailsDialog().find('[class^=rubric-table--ratingsGroup--]').eq(1).find('[class^=rubric-table--rubricScoreBox--]').eq(option.indexOf(score)).should("contain", percentage);
  }
  getRubricSummaryDetailsDialogCloseButton() {
    return cy.get('[data-cy=rubric-summary-modal-close-button]');
  }
  getNewMaxScoreDialog() {
    return cy.get('[data-cy=feedback-settings-modal]');
  }
  getContinueButton() {
    return cy.get('[data-cy=feedback-settings-modal-close-button]').eq(1);
  }
  getShowHideStudentAnswersButton() {
    return cy.get('[class^=show-student-answers--showToggle--]').eq(0);
  }

}
export default ActivityScore;
