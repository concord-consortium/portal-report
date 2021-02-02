import React from "react";
import { Map } from "immutable";
import Markdown from "markdown-to-jsx";
import LaunchIcon from "../../../../img/svg-icons/launch-icon.svg";

import css from "../../../../css/portal-dashboard/feedback/rubric-table.less";

interface IProps {
  rubric: any;
  student: Map<any,any>;
  rubricFeedback: any;
  activityId: string;
  activityIndex: number;
  updateActivityFeedback: (activityId: string, activityIndex: number, platformStudentId: string, feedback: any) => void;
}
export class RubricTableContainer extends React.PureComponent<IProps> {
  render() {
    const { rubric } = this.props;
    const { criteria } = rubric;

    return (
      <div className={css.rubricContainer} data-cy="rubric-table">
        {this.renderColumnHeaders(rubric)}
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

  private renderColumnHeaders = (rubric: any) => {
    const { referenceURL } = rubric;
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
            {rubric.scoreUsingPoints && <div className={css.rubricScoreNumber}>({rating.score})</div>}
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

    return (
      <div className={css.rubricScoreBox} key={radioButtonKey}>
        <div className={css.rubricButton} title={(isApplicableRating) ? ratingDescription : "Not Applicable"}>
          { !isApplicableRating
            ? <span className={css.noRating}>N/A</span>
            : this.renderButton(critId, selected, ratingId, buttonIndex)
          }
        </div>
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
      const { rubric, rubricFeedback, student } = this.props;
      const newSelection: any = {};
      const rating = rubric.ratings.find((r: any) => r.id === ratingId);
      const criteria = rubric.criteria.find((c: any) => c.id === critId);
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
    };

    return (
      <button className={css.outerCircle} onClick={handleRatingChange(buttonIndex)} data-cy="rating-radio-button">
        <div className={`${css.innerCircle} ${selected ? css.selected : ""}`}></div>
      </button>
    );
  }

  private rubricChange = (rubricFeedback: any, studentId: string) => {
    const { rubric, activityId, activityIndex, updateActivityFeedback } = this.props;
    let numFeedback = 0;
    rubric.criteria.forEach((crit: any) => {
      if (rubricFeedback && rubricFeedback[crit.id]) {
        if (rubricFeedback[crit.id].id !== "") {
          numFeedback++;
        }
      }
    });

    const hasBeenReviewed  = numFeedback !== 0;
    activityId && studentId
      && updateActivityFeedback(activityId, activityIndex, studentId, { rubricFeedback, hasBeenReviewed });
  };
}