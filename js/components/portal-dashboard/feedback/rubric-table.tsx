import React from "react";
import { Map } from "immutable";
import Markdown from "markdown-to-jsx";
import ReactTooltip from "react-tooltip";
import LaunchIcon from "../../../../img/svg-icons/launch-icon.svg";
import { Rubric, RubricCriterion, RubricRating, getFeedbackColor } from "./rubric-utils";
import { ScoringSettings } from "../../../util/scoring";
import { RUBRIC_SCORE } from "../../../util/scoring-constants";

import css from "../../../../css/portal-dashboard/feedback/rubric-table.less";

interface IProps {
  rubric: Rubric;
  rubricDocUrl: string;
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
    const { rubric, rubricDocUrl, scoringSettings } = this.props;
    const { criteriaGroups } = rubric;

    return (
      <div className={css.rubricContainer} data-cy="rubric-table">
        {this.renderColumnHeaders(rubric, rubricDocUrl, scoringSettings)}
        <div className={css.rubricTable}>
          {criteriaGroups.map((criteriaGroup, index) => (
            <div className={css.rubricTableGroup} key={index}>
              {criteriaGroup.label.length > 0 && <div className={css.rubricTableGroupLabel}>{criteriaGroup.label}</div>}
              <div className={css.rubricTableRows}>
                {criteriaGroup.criteria.map(criterion =>
                  <div className={css.rubricTableRow} key={criterion.id} id={criterion.id}>
                    <div className={css.rubricDescription}>
                      {criterion.iconUrl && <img src={criterion.iconUrl} />}
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

  private renderColumnHeaders = (rubric: Rubric, rubricDocUrl: string, scoringSettings: ScoringSettings) => {
    const hasRubricDocUrl = rubricDocUrl.trim().length > 0;

    const showScore = scoringSettings.scoreType === RUBRIC_SCORE;
    return (
      <div className={css.columnHeaders}>
        <div className={css.rubricDescriptionHeader}>
          {hasRubricDocUrl && <div className={css.scoringGuideArea}>
            <a className={css.launchButton} href={rubricDocUrl} target="_blank" data-cy="scoring-guide-launch-icon">
              <LaunchIcon className={css.icon} />
            </a>
            Scoring Guide
          </div>}
          <div className={css.rubricDescriptionTitle}>{rubric.criteriaLabel}</div>
        </div>
        {rubric.ratings.map((rating: any) =>
          <div className={css.rubricScoreHeader} key={rating.id}>
            <div className={css.rubricScoreLevel}>{rating.label}</div>
            {showScore && <div className={css.rubricScoreNumber}>({rating.score})</div>}
          </div>
        )}
      </div>
    );
  }

  private renderRatings = (criterion: RubricCriterion) => {
    const { rubric } = this.props;
    const { ratings } = rubric;
    return (
      <div className={css.ratingsGroup}>
        {ratings.map((rating: any, index: number) => this.renderStudentRating(criterion, rating, index))}
      </div>
    );
  }

  private renderStudentRating = (criterion: RubricCriterion, rating: RubricRating, buttonIndex: number) => {
    const { rubricFeedback } = this.props;

    const critId = criterion.id;
    const ratingId = rating.id;
    const radioButtonKey = `${critId}-${ratingId}`;
    const selected = (rubricFeedback && rubricFeedback[critId] && rubricFeedback[critId].id === ratingId);
    // Tooltips displayed to teacher should actually show student description if it's available.
    const ratingDescription =
      (criterion.ratingDescriptionsForStudent && criterion.ratingDescriptionsForStudent[ratingId]) ||
      (criterion.ratingDescriptions && criterion.ratingDescriptions[ratingId]) ||
      null;
    const isApplicableRating = criterion.nonApplicableRatings === undefined ||
      criterion.nonApplicableRatings.indexOf(ratingId) < 0;
    const style: React.CSSProperties = selected ? {backgroundColor: getFeedbackColor({rubric: this.props.rubric, score: rubricFeedback[critId].score})} : {};
    const key = `${critId}-${ratingId}`;

    return (
      <div className={css.rubricScoreBox} style={style} key={radioButtonKey}>
        <div className={css.rubricButton} title={isApplicableRating ? undefined : "Not Applicable"} data-tip data-for={key}>
          { !isApplicableRating
            ? <span className={css.noRating}>N/A</span>
            : this.renderButton(criterion, selected, ratingId, buttonIndex)
          }
        </div>
        {isApplicableRating && ratingDescription && <ReactTooltip id={key} place="left" type="dark" delayShow={500}><Markdown>{ratingDescription}</Markdown></ReactTooltip>}
      </div>
    );
  }

  private renderButton = (criterion: RubricCriterion, selected: boolean, ratingId: string, buttonIndex: number) => {
    const critId = criterion.id;

    const handleRatingChange = (buttonIndex: number) => () => {
      const { rubric, rubricFeedback } = this.props;
      const deselect = (rubricFeedback && rubricFeedback[critId])
                        && (rubric.ratings.findIndex((r: any) => r.id === (rubricFeedback[critId].id)) === buttonIndex);

      updateSelection(ratingId, deselect);
    };

    const updateSelection = (ratingId: string, deselect: boolean) => {
      const { rubric, rubricFeedback, student, setFeedbackSortRefreshEnabled } = this.props;
      const newSelection: any = {};
      const rating = rubric.ratings.find((r: any) => r.id === ratingId);
      if ((rating === undefined) || (criterion === undefined)) {
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
                  description: criterion.ratingDescriptions[ratingId],
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
