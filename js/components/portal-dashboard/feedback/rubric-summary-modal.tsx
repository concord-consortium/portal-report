import React, { PureComponent } from "react";
import { Modal } from "react-bootstrap";
import Markdown from "markdown-to-jsx";
import { Rubric, RubricCriterion, RubricRating, getFeedbackColor, getFeedbackTextColor } from "./rubric-utils";
import { ICriteriaCount } from "./rubric-summary-icon";
import LaunchIcon from "../../../../img/svg-icons/launch-icon.svg";
import { ScoringSettings } from "../../../util/scoring";
import { RUBRIC_SCORE } from "../../../util/scoring-constants";

import css from "../../../../css/portal-dashboard/feedback/rubric-summary-modal.less";
import tableCss from "../../../../css/portal-dashboard/feedback/rubric-table.less";

interface IProps {
  onClose: () => void;
  rubric: Rubric;
  rubricDocUrl: string;
  criteriaCounts: ICriteriaCount[];
  scoringSettings: ScoringSettings;
}

export class RubricSummaryModal extends PureComponent<IProps> {

  render() {

    return (
      <Modal animation={false} centered dialogClassName={css.lightbox} onHide={this.handleClose} show={true} data-cy="rubric-summary-modal">
        <Modal.Header className={css.lightboxHeader} data-cy="rubric-summary-modal-header">
          <div className={css.title} data-cy="rubric-summary-modal-header-text">
          Rubric Summary Details
          </div>
        </Modal.Header>
        <Modal.Body className={css.lightboxBody}>
          <div className={css.contentArea} data-cy="rubric-summary-modal-content-area">
            {this.renderTable()}
            <div className={css.buttonContainer}>
              <div className={css.closeButton} onClick={this.handleClose} data-cy="rubric-summary-modal-close-button">
                Close
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  private renderTable() {
    const { rubric, rubricDocUrl } = this.props;
    const { criteriaGroups } = rubric;

    return (
      <div className={tableCss.rubricContainer} data-cy="rubric-table">
        {this.renderColumnHeaders(rubric, rubricDocUrl)}
        <div className={tableCss.rubricTable}>
          {criteriaGroups.map((criteriaGroup, index) => (
            <div className={tableCss.rubricTableGroup} key={index}>
              {criteriaGroup.label.length > 0 && <div className={tableCss.rubricTableGroupLabel}>{criteriaGroup.label}</div>}
              <div className={tableCss.rubricTableRows}>
                {criteriaGroup.criteria.map(criterion =>
                  <div className={tableCss.rubricTableRow} key={criterion.id} id={criterion.id}>
                    <div className={tableCss.rubricDescription}>
                      <Markdown>{criterion.description}</Markdown>
                    </div>
                    {this.renderRatings(criterion)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  private renderColumnHeaders = (rubric: Rubric, rubricDocUrl: string) => {
    const hasRubricDocUrl = rubricDocUrl.trim().length > 0;

    const showScore = this.props.scoringSettings.scoreType === RUBRIC_SCORE;
    return (
      <div className={tableCss.columnHeaders}>
        <div className={tableCss.rubricDescriptionHeader}>
          {hasRubricDocUrl && <div className={tableCss.scoringGuideArea}>
            <a className={tableCss.launchButton} href={rubricDocUrl} target="_blank" data-cy="scoring-guide-launch-icon">
              <LaunchIcon className={tableCss.icon} />
            </a>
            Scoring Guide
          </div>}
          <div className={tableCss.rubricDescriptionTitle}>{rubric.criteriaLabel}</div>
        </div>
        {rubric.ratings.map((rating: any) =>
          <div className={tableCss.rubricScoreHeader} key={rating.id}>
            <div className={tableCss.rubricScoreLevel}>{rating.label}</div>
            {showScore && <div className={tableCss.rubricScoreNumber}>({rating.score})</div>}
          </div>
        )}
      </div>
    );
  }

  private renderRatings = (crit: RubricCriterion) => {
    const { rubric } = this.props;
    const { ratings } = rubric;
    return (
      <div className={tableCss.ratingsGroup}>
        {ratings.map(rating => this.renderRating(crit, rating))}
      </div>
    );
  }

  private renderRating = (criterion: RubricCriterion, rating: RubricRating) => {
    const critId = criterion.id;
    const ratingId = rating.id;
    const key = `${critId}-${ratingId}`;
    const ratingDescription = criterion.ratingDescriptions?.[ratingId];
    const isApplicableRating = criterion.nonApplicableRatings === undefined || criterion.nonApplicableRatings.indexOf(ratingId) < 0;
    const style: React.CSSProperties = {
      color: getFeedbackTextColor({rubric: this.props.rubric, score: rating.score}),
      backgroundColor: getFeedbackColor({rubric: this.props.rubric, score: rating.score})
    };

    return (
      <div className={tableCss.rubricScoreBox} style={style} key={key}>
        <div className={tableCss.rubricButton} title={(isApplicableRating) ? ratingDescription : "Not Applicable"}>
          { !isApplicableRating
            ? <span className={tableCss.noRating}>N/A</span>
            : this.renderPercentage(critId, ratingId)
          }
        </div>
      </div>
    );
  }

  private renderPercentage = (critId: string, ratingId: string) => {
    let percentage = 0;

    const criteriaCount = this.props.criteriaCounts.find(cc => cc.id === critId);
    if (criteriaCount && criteriaCount?.numStudents > 0) {
      const ratingCount = criteriaCount.ratings[ratingId];
      if (ratingCount) {
        percentage = Math.round((ratingCount / criteriaCount.numStudents) * 100);
      }
    }

    return (
      <>{percentage}%</>
    );
  }

  private handleClose = (e: React.MouseEvent) => this.props.onClose();

}
