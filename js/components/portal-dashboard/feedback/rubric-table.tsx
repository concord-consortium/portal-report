import React from "react";
// import { Map } from "immutable";
import Markdown from "markdown-to-jsx";
import LaunchIcon from "../../../../img/svg-icons/launch-icon.svg";

import css from "../../../../css/portal-dashboard/feedback/rubric-table.less";
interface IProps {
  activityStarted: boolean;
  rubric: any;
  student: any;
  rubricFeedback: any;
  activityId: string;
  activityIndex: number;
  rubricChange: (feedback: any, studentId: string) => void;
}
export class RubricTableContainer extends React.PureComponent<IProps> {
  render() {
    const { activityStarted, rubric, student, rubricFeedback } = this.props;
    const learnerId = student.get("id");
    const { ratings, criteria } = rubric;

    if (activityStarted) {
      return (
        <div className={css.rubricContainer} data-cy="rubric-table">
          {this.renderColumnHeaders(rubric)}
          <div className={css.rubricTable}>
            {criteria.map((crit: any, critIndex: any) =>
              <div className={css.rubricTableRow} key={crit.id} id={crit.id}>
                <div className={css.rubricDescription}>
                  <Markdown>{crit.description}</Markdown>
                </div>
                {ratings.map((rating: any) => this.renderStudentRating(crit, rating, learnerId, rubricFeedback))}
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  }

  private renderColumnHeaders = (rubric: any) => {
    const { referenceURL } = rubric;
    return (
      <div className={css.columnHeaders}>
        <div className={css.rubricDescriptionHeader}>
          <div className={css.scoringGuideArea}>
            <a className={css.launchButton}>
              <LaunchIcon className={css.icon} href={referenceURL} target="_blank" />
            </a>
            Scoring Guide
        </div>
          <div className={css.rubricDescriptionTitle}>{rubric.criteriaLabel}</div>
        </div>
        { rubric.ratings.map((rating: any) =>
          <div className={css.rubricScoreHeader} key={rating.id}>
            <div className={css.rubricScoreLevel}>{rating.label}</div>
            {rubric.scoreUsingPoints && <div className={css.rubricScoreNumber}>({rating.score})</div>}
          </div>
          )
        }
      </div>
    );
  }

  private renderStudentRating = (crit: any, rating: any, learnerId: number, rubricFeedback: any) => {
    const critId = crit.id;
    const ratingId = rating.id;
    const radioButtonKey = `${critId}-${ratingId}`;
    const checked = (rubricFeedback && rubricFeedback[critId] && rubricFeedback[critId].id === ratingId);

    // Tooltips displayed to teacher should actually show student description if it's available.
    const ratingDescription =
      (crit.ratingDescriptionsForStudent && crit.ratingDescriptionsForStudent[ratingId]) ||
      (crit.ratingDescriptions && crit.ratingDescriptions[ratingId]) ||
      null;
    const isApplicableRating = crit.nonApplicableRatings === undefined ||
      crit.nonApplicableRatings.indexOf(ratingId) < 0;
    const isNotApplicable = !isApplicableRating;
    return (
      <div key={radioButtonKey} className={css.rubricScore} title={(isApplicableRating) ? ratingDescription : "Not Applicable"}>
        { isNotApplicable
          ? <span className={css.noRating}>N/A</span>
          : this.renderButton(learnerId, critId, checked, ratingId, radioButtonKey)
        }
      </div>
    );
  }

  private renderButton = (learnerId: number, critId: string, checked: boolean, ratingId: string, radioButtonKey: string) => {
    const handleRatingChange = (ratingId: string, radioButtonKey: string, event: React.ChangeEvent<HTMLInputElement>) => {
      // TODO: if rating was previously checked, uncheck it, else update!checked;} : () => this.updateSelection(critId, ratingId);
      updateSelection(critId, ratingId);
    };

    const updateSelection = (critId: any, ratingId: string) => {
      const { rubric, rubricFeedback, student, rubricChange } = this.props;
      const newSelection = {};
      const rating = rubric.ratings.find((r: any) => r.id === ratingId);
      const criteria = rubric.criteria.find((c: any) => c.id === critId);
      const score = rating.score;
      const label = rating.label;
      const studentId = student.get("id");

      newSelection[critId] = {
        id: ratingId,
        score,
        label,
        description: criteria.ratingDescriptions[ratingId],
      };
      const newFeedback = Object.assign({}, rubricFeedback, newSelection);
      rubricChange(newFeedback, studentId);
    };

    return (
      <input
        name={`${learnerId}_${critId}`}
        type="radio"
        checked={checked || false}
        value={ratingId}
        onChange={handleRatingChange.bind(null, ratingId, radioButtonKey)}
        id={radioButtonKey}
      />
    );
  }
}
