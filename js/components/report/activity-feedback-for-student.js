import React, { PureComponent } from "react";
import FeedbackPanelForStudent from "./feedback-panel-for-student";

export default class ActivityFeedbackForStudent extends PureComponent {
  render() {
    const {
      student,
      feedbacks,
      feedbackEnabled,
      useRubric,
      rubric,
      showScore,
      maxScore,
      showText,
      autoScore,
    } = this.props;
    let feedback = null;
    if (!feedbackEnabled) { return null; }
    const matchingFeedbacks = feedbacks.find((f) => f.get("studentId") === student.get("id"));

    if (matchingFeedbacks) {
      const fblist = matchingFeedbacks.get("feedbacks");
      if (fblist && fblist.size > 0) {
        feedback = fblist.first().toJS();
      }
    }
    const showFeedback = (feedback && feedback.hasBeenReviewed);
    const score = (autoScore != null) ? autoScore : feedback && feedback.score;
    const textFeedback = feedback && feedback.feedback;
    const hasBeenReviewed = feedback && feedback.hasBeenReviewed;
    const rubricFeedback = feedback && feedback.rubricFeedback;
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
