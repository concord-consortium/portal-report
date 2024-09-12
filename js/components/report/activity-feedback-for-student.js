import React, { PureComponent } from "react";
import FeedbackPanelForStudent from "./feedback-panel-for-student";
import { RUBRIC_SCORE } from "../../util/scoring-constants";
import { computeRubricMaxScore } from "../../selectors/activity-feedback-selectors";

export default class ActivityFeedbackForStudent extends PureComponent {
  render() {
    const {
      student,
      feedbacks,
      feedbackEnabled,
      useRubric,
      rubric,
      showScore,
      scoreType,
      showText,
      autoScore,
    } = this.props;
    if (!feedbackEnabled) { return null; }
    let feedback = feedbacks.find((f) => f.get("platformStudentId") === student.get("id"));
    if (feedback) {
      feedback = feedback.toJS();
    }
    const showFeedback = feedback && feedback.hasBeenReviewed;
    const textFeedback = feedback && feedback.feedback;
    const hasBeenReviewed = feedback && feedback.hasBeenReviewed;
    const rubricFeedback = feedback && feedback.rubricFeedback;

    let score = (autoScore != null) ? autoScore : feedback && feedback.score;
    let maxScore = this.props.maxScore;

    // re-score the rubric if needed due the teacher dashboard not setting the scoreType and/or score correctly when there is a rubric
    if ((scoreType === undefined || (scoreType === RUBRIC_SCORE && score === undefined)) && rubricFeedback && rubric) {
      const scoredValues = Object.values(rubricFeedback).filter((v) => v.score > 0);
      const numCriteria = rubric.criteriaGroups.reduce((acc, cur) => acc + cur.criteria.length, 0);
      if (scoredValues.length === numCriteria) {
        score = scoredValues.reduce((acc, cur) => acc + cur.score, 0);
        maxScore = computeRubricMaxScore(rubric);
      }
    }

    return (
      <FeedbackPanelForStudent
        student={student}
        showScore={showScore}
        maxScore={maxScore}
        feedbackEnabled={showFeedback}
        showText={showText}
        textFeedback={textFeedback}
        score={score}
        hasBeenReviewed={hasBeenReviewed}
        useRubric={useRubric}
        rubric={rubric}
        rubricFeedback={rubricFeedback}
        isOverall
      />);
  }
}
