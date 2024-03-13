import React from "react";
import { Map } from "immutable";
import Markdown from "markdown-to-jsx";
import ReactTooltip from "react-tooltip";
import LaunchIcon from "../../../../img/svg-icons/launch-icon.svg";
import { Rubric, getFeedbackColor } from "./rubric-utils";
import { ScoringSettings } from "../../../util/scoring";
import { RUBRIC_SCORE } from "../../../util/scoring-constants";

import css from "../../../../css/portal-dashboard/feedback/rubric-table.less";

interface IProps {
  rubric: Rubric;
  student: Map<any,any>;
  rubricFeedback: any;
  activityId: string;
  activityIndex: number;
  setFeedbackSortRefreshEnabled: (value: boolean) => void;
  updateActivityFeedback: (activityId: string, activityIndex: number, platformStudentId: string, feedback: any) => void;
  scoringSettings: ScoringSettings;
}
export class RubricTableContainer extends React.PureComponent<IProps> {
  render() {
    const { rubric, scoringSettings } = this.props;
    const { criteria } = rubric;

    return (
      <div className={css.rubricContainer} data-cy="rubric-table">
        {this.renderColumnHeaders(rubric, scoringSettings)}
        <div className={css.rubricTable}>
          {criteria.map((crit: any) =>
            <div className={css.rubricTableRow} key={crit.id} id={crit.id}>
              <div className={css.rubricDescription}>
                <Markdown>{crit.description}</Markdown>
              </div>
              {this.renderRatings(crit)}
            </div>
          )}
        </div>
      </div>
    );
  }

  private renderColumnHeaders = (rubric: Rubric, scoringSettings: ScoringSettings) => {
    const { referenceURL } = rubric;
    const showScore = scoringSettings.scoreType === RUBRIC_SCORE;
    return (
      <div className={css.columnHeaders}>
        <div className={css.rubricDescriptionHeader}>
          <div className={css.scoringGuideArea}>
            <a className={css.launchButton} href={referenceURL} target="_blank" data-cy="scoring-guide-launch-icon">
              <LaunchIcon className={css.icon} />
            </a>
            Scoring Guide
          </div>
          <div className={css.rubricDescriptionTitle}>{rubric.criteriaLabel}</div>
        </div>
        {rubric.ratings.map((rating: any) =>
          <div className={css.rubricScoreHeader} key={rating.id}>
            <div className={css.rubricScoreLevel}>{rating.label}</div>
            {rubric.scoreUsingPoints && showScore && <div className={css.rubricScoreNumber}>({rating.score})</div>}
          </div>
        )}
      </div>
    );
  }

  private renderRatings = (crit: any) => {
    const { rubric } = this.props;
    const { ratings } = rubric;
    return (
      <div className={css.ratingsGroup}>
        {ratings.map((rating: any, index: number) => this.renderStudentRating(crit, rating, index))}
      </div>
    );
  }

  private renderStudentRating = (crit: any, rating: any, buttonIndex: number) => {
    const { rubricFeedback } = this.props;

    const critId = crit.id;
    const ratingId = rating.id;
    const radioButtonKey = `${critId}-${ratingId}`;
    const selected = (rubricFeedback && rubricFeedback[critId] && rubricFeedback[critId].id === ratingId);
    // Tooltips displayed to teacher should actually show student description if it's available.
    const ratingDescription =
      (crit.ratingDescriptionsForStudent && crit.ratingDescriptionsForStudent[ratingId]) ||
      (crit.ratingDescriptions && crit.ratingDescriptions[ratingId]) ||
      null;
    const isApplicableRating = crit.nonApplicableRatings === undefined ||
      crit.nonApplicableRatings.indexOf(ratingId) < 0;
    const style: React.CSSProperties = selected ? {backgroundColor: getFeedbackColor({rubric: this.props.rubric, score: rubricFeedback[critId].score})} : {};
    const key = `${critId}-${ratingId}`;

    return (
      <div className={css.rubricScoreBox} style={style} key={radioButtonKey}>
        <div className={css.rubricButton} title={isApplicableRating ? undefined : "Not Applicable"} data-tip data-for={key}>
          { !isApplicableRating
            ? <span className={css.noRating}>N/A</span>
            : this.renderButton(critId, selected, ratingId, buttonIndex)
          }
        </div>
        {isApplicableRating && <ReactTooltip id={key} place="left" type="dark" delayShow={500}><Markdown>{ratingDescription}</Markdown></ReactTooltip>}
      </div>
    );
  }

  private renderButton = (critId: string, selected: boolean, ratingId: string, buttonIndex: number) => {
    const handleRatingChange = (buttonIndex: number) => () => {
      const { rubric, rubricFeedback } = this.props;
      const deselect = (rubricFeedback && rubricFeedback[critId])
                        && (rubric.ratings.findIndex((r: any) => r.id === (rubricFeedback[critId].id)) === buttonIndex);

      updateSelection(critId, ratingId, deselect);
    };

    const updateSelection = (critId: any, ratingId: string, deselect: boolean) => {
      const { rubric, rubricFeedback, student, setFeedbackSortRefreshEnabled } = this.props;
      const newSelection: any = {};
      const rating = rubric.ratings.find((r: any) => r.id === ratingId);
      const criteria = rubric.criteria.find((c: any) => c.id === critId);
      if ((rating === undefined) || (criteria === undefined)) {
        return;
      }

      const score = rating.score;
      const label = rating.label;
      const studentId = student.get("id");

      deselect  ? newSelection[critId] = {
                  id: "",
                  score: 0,
                  label: "",
                  description: "",
                }
                : newSelection[critId] = {
                  id: ratingId,
                  score,
                  label,
                  description: criteria.ratingDescriptions[ratingId],
                };
      const newFeedback = Object.assign({}, rubricFeedback, newSelection);
      this.rubricChange(newFeedback, studentId);
      setFeedbackSortRefreshEnabled(true);
    };

    return (
      <button className={css.outerCircle} onClick={handleRatingChange(buttonIndex)} data-cy="rating-radio-button">
        <div className={`${css.innerCircle} ${selected ? css.selected : ""}`}></div>
      </button>
    );
  }

  private rubricChange = (rubricFeedback: any, studentId: string) => {
    const { activityId, activityIndex, updateActivityFeedback } = this.props;

    if (activityId && studentId) {
      updateActivityFeedback(activityId, activityIndex, studentId, { rubricFeedback });
    }
  };
}
