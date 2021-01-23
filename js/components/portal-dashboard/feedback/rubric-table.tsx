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
    const { activityStarted, rubric } = this.props;
    const { criteria } = rubric;

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
                {this.renderRatings(crit)}
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

  private renderRatings = (crit: any) => {
    const { rubric, student, rubricFeedback } = this.props;
    const learnerId = student.get("id");
    const { ratings } = rubric;
    return (
      <div id={`${crit.id}_ratings`} className={css.ratingsGroup}>
        {ratings.map((rating: any) => this.renderStudentRating(crit, rating, learnerId, rubricFeedback))}
      </div>
    );
  }

  private renderStudentRating = (crit: any, rating: any, learnerId: number, rubricFeedback: any) => {
    const { rubric } = this.props;
    const { ratings } = rubric;

    const critId = crit.id;
    const ratingId = rating.id;
    const radioButtonKey = `${critId}-${ratingId}`;
    const selected = (rubricFeedback && rubricFeedback[critId] && rubricFeedback[critId].id === ratingId);
    const currentIndex = ratings.indexOf(rating);
    console.log(ratings, " " , ratingId, " " ,ratings.indexOf(rating));
    // Tooltips displayed to teacher should actually show student description if it's available.
    const ratingDescription =
      (crit.ratingDescriptionsForStudent && crit.ratingDescriptionsForStudent[ratingId]) ||
      (crit.ratingDescriptions && crit.ratingDescriptions[ratingId]) ||
      null;
    const isApplicableRating = crit.nonApplicableRatings === undefined ||
      crit.nonApplicableRatings.indexOf(ratingId) < 0;
    const isNotApplicable = !isApplicableRating;

    return (
      <div className={css.rubricScoreBox} key={radioButtonKey}>
        <div  className={css.rubricButton} title={(isApplicableRating) ? ratingDescription : "Not Applicable"}>
          { isNotApplicable
            ? <span className={css.noRating}>N/A</span>
            : this.renderButton(learnerId, critId, selected, rating, ratingId, radioButtonKey, currentIndex)
          }
        </div>
      </div>
    );
  }

  private renderButton = (learnerId: number, critId: string, selected: boolean, rating: any, ratingId: string, radioButtonKey: string, currentIndex: number) => {
    const handleRatingChange = (rating: string, currentIndex: number) => () => {
      // TODO: if rating was previously checked, uncheck it, else update!checked;} : () => this.updateSelection(critId, ratingId);

      if (currentIndex === this.props.rubric.ratings.indexOf(rating)) {
        console.log("currentIndex is the same ", currentIndex, " ", this.props.rubric.ratings.indexOf(rating));
        // critId="";
        // ratingId="";
      }
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
      <button
        className={css.outerCircle}
        onClick={handleRatingChange(rating, currentIndex)}
        id={radioButtonKey}
      >
        <div className={`${css.innerCircle} ${selected ? css.selected : ""}`}></div>
      </button>
    );
  }
}
