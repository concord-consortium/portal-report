import React, { PureComponent } from "react";
import { Modal } from "react-bootstrap";
import Markdown from "markdown-to-jsx";
import classNames from "classnames";
import { Rubric, getFeedbackColor, getFeedbackTextColor } from "./rubric-utils";
import { ICriteriaCount } from "./rubric-summary-icon";
import LaunchIcon from "../../../../img/svg-icons/launch-icon.svg";
import { ScoringSettings } from "../../../util/scoring";
import { RUBRIC_SCORE } from "../../../util/scoring-constants";
import { getRubricSummary, IRubricSummary, IRubricSummaryRow } from "../../../util/rubric-summary";

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
    const summary = getRubricSummary(this.props.rubric, this.props.criteriaCounts);

    return (
      <Modal animation={false} centered dialogClassName={css.lightbox} onHide={this.handleClose} show={true} data-cy="rubric-summary-modal">
        <Modal.Header className={css.lightboxHeader} data-cy="rubric-summary-modal-header">
          <div className={css.title} data-cy="rubric-summary-modal-header-text">
          Rubric Summary Details
          </div>
        </Modal.Header>
        <Modal.Body className={css.lightboxBody}>
          <div className={css.contentArea} data-cy="rubric-summary-modal-content-area">
            <div className={css.contents}>
              {this.renderSummary(summary)}
            </div>
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

  private renderSummary(summary: IRubricSummary) {
    switch (this.props.rubric.tagSummaryDisplay) {
      case "above":
        return <>{this.renderTagSummary(summary)}{this.renderCriteriaTable(summary)}</>;
      case "below":
        return <>{this.renderCriteriaTable(summary)}{this.renderTagSummary(summary)}</>;
      case "onlySummary":
        return this.renderTagSummary(summary);
      case "none":
      default:
        return this.renderCriteriaTable(summary);
    }
  }

  private renderTagSummary({tagSummaryRows, tagSummaryTitle}: IRubricSummary) {
    const { rubric, rubricDocUrl } = this.props;

    return (
      <div className={tableCss.rubricContainer} data-cy="rubric-table">
        {this.renderColumnHeaders(rubric, rubricDocUrl, {title: tagSummaryTitle, hideScoringGuide: true})}
        <div className={tableCss.rubricTable}>
          <div className={tableCss.rubricTableGroup}>
            {this.renderRows(tagSummaryRows)}
          </div>
        </div>
      </div>
    );
  }

  private renderCriteriaTable({tableRows}: IRubricSummary) {
    const { rubric, rubricDocUrl } = this.props;
    const { criteriaGroups } = rubric;

    return (
      <div className={tableCss.rubricContainer} data-cy="rubric-table">
        {this.renderColumnHeaders(rubric, rubricDocUrl, {title: rubric.criteriaLabel})}
        <div className={tableCss.rubricTable}>
          {criteriaGroups.map((criteriaGroup, index) => (
            <div className={tableCss.rubricTableGroup} key={index}>
              {criteriaGroup.label.length > 0 && <div className={tableCss.rubricTableGroupLabel}>{criteriaGroup.label}</div>}
              {this.renderRows(tableRows.filter(r => r.criteriaGroupIndex === index))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  private renderColumnHeaders = (rubric: Rubric, rubricDocUrl: string, options: {title: string; hideScoringGuide?: boolean}) => {
    const hasRubricDocUrl = rubricDocUrl.trim().length > 0;
    const showScore = this.props.scoringSettings.scoreType === RUBRIC_SCORE;
    const titleClassName = classNames(tableCss.rubricDescriptionTitle, tableCss.fullWidth);

    return (
      <div className={tableCss.columnHeaders}>
        <div className={tableCss.rubricDescriptionHeader}>
          {hasRubricDocUrl && !options.hideScoringGuide && <div className={tableCss.scoringGuideArea}>
            <a className={tableCss.launchButton} href={rubricDocUrl} target="_blank" data-cy="scoring-guide-launch-icon">
              <LaunchIcon className={tableCss.icon} />
            </a>
            Scoring Guide
          </div>}
          <div className={titleClassName}>{options.title}</div>
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

  private renderRows(rows: IRubricSummaryRow[]) {
    const {rubric} = this.props;

    return (
      <div className={tableCss.rubricTableRows}>
        {rows.map(({text, ratings, iconUrl, iconPhrase}, index) => (
        <div className={tableCss.rubricTableRow} key={index}>
          <div className={classNames(tableCss.rubricDescription, tableCss.separateImage)}>
            {iconUrl && <img src={iconUrl} title={iconPhrase} /> }
            <Markdown>{text}</Markdown>
          </div>
          <div className={tableCss.ratingsGroup}>
            {ratings.map(({score, isApplicableRating, label, percentage}, index) => {
              const style: React.CSSProperties = {
                color: getFeedbackTextColor({rubric, score}),
                backgroundColor: getFeedbackColor({rubric, score})
              };
              return (
                <div className={tableCss.rubricScoreBox} style={style} key={index}>
                  <div className={tableCss.rubricButton} title={label}>
                  { !isApplicableRating
                    ? <span className={tableCss.noRating}>N/A</span>
                    : <>{percentage}%</>
                  }
                  </div>
                </div>
              );
            })}
          </div>
        </div>))}
      </div>
    );
  }

  private handleClose = (e: React.MouseEvent) => this.props.onClose();
}

