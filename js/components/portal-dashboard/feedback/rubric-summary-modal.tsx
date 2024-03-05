import React, { PureComponent } from "react";
import { Modal } from "react-bootstrap";
import Markdown from "markdown-to-jsx";
import { Rubric, RubricCriterion, RubricRating, getFeedbackColor, getFeedbackTextColor } from "./rubric-utils";
import { ICriteriaCount } from "./rubric-summary-icon";
import LaunchIcon from "../../../../img/svg-icons/launch-icon.svg";

import css from "../../../../css/portal-dashboard/feedback/rubric-summary-modal.less";
import tableCss from "../../../../css/portal-dashboard/feedback/rubric-table.less";

interface IProps {
  onClose: () => void;
  rubric: Rubric;
  criteriaCounts: ICriteriaCount[];
}

export class RubricSummaryModal extends PureComponent<IProps> {

  render() {
    // const { rubric, criteriaCounts } = this.props;

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
    const { rubric } = this.props;
    const { criteria } = rubric;

    return (
      <div className={tableCss.rubricContainer} data-cy="rubric-table">
        {this.renderColumnHeaders(rubric)}
        <div className={tableCss.rubricTable}>
          {criteria.map(crit =>
            <div className={tableCss.rubricTableRow} key={crit.id} id={crit.id}>
              <div className={tableCss.rubricDescription}>
                <Markdown>{crit.description}</Markdown>
              </div>
              {this.renderRatings(crit)}
            </div>
          )}
        </div>
      </div>
    );
  }

  private renderColumnHeaders = (rubric: Rubric) => {
    const { referenceURL } = rubric;
    return (
      <div className={tableCss.columnHeaders}>
        <div className={tableCss.rubricDescriptionHeader}>
          <div className={tableCss.scoringGuideArea}>
            <a className={tableCss.launchButton} href={referenceURL} target="_blank" data-cy="scoring-guide-launch-icon">
              <LaunchIcon className={tableCss.icon} />
            </a>
            Scoring Guide
          </div>
          <div className={tableCss.rubricDescriptionTitle}>{rubric.criteriaLabel}</div>
        </div>
        {rubric.ratings.map((rating: any) =>
          <div className={tableCss.rubricScoreHeader} key={rating.id}>
            <div className={tableCss.rubricScoreLevel}>{rating.label}</div>
            {rubric.scoreUsingPoints && <div className={tableCss.rubricScoreNumber}>({rating.score})</div>}
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

  private renderRating = (crit: RubricCriterion, rating: RubricRating) => {
    const critId = crit.id;
    const ratingId = rating.id;
    const key = `${critId}-${ratingId}`;
    const ratingDescription = crit.ratingDescriptions?.[ratingId];
    const isApplicableRating = crit.nonApplicableRatings === undefined || crit.nonApplicableRatings.indexOf(ratingId) < 0;
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
