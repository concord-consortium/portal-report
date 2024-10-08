import React, { PureComponent } from "react";
import RubricBoxForStudent from "./rubric-box-for-student";
import "../../../css/report/activity-feedback.less";
import "../../../css/report/feedback-panel-for-student.less";

export default class FeedbackPanelForStudent extends PureComponent {
  renderTextSection(feedback) {
    const { showText } = this.props;
    if (showText && feedback) {
      return (
        <div className="feedback-section written-feedback">
          <span>{feedback}</span>
        </div>
      );
    }
    return null;
  }

  renderScoreSection(score) {
    const { maxScore, showScore, isOverall } = this.props;
    const scoreLabel = isOverall ? "Overall Score" : "Score";
    const ofLabel = "of";
    if (score != null && showScore) {
      return (
        <div className="feedback-section score">
          <span className="scoreLabel">{scoreLabel}</span>
          <span className="studentScore"> {score} </span>
          {ofLabel}
          <span className="maxScore"> {maxScore} </span>
        </div>
      );
    }
    return null;
  }

  render() {
    const { textFeedback, score, rubric, rubricFeedback, hasBeenReviewed } = this.props;
    const showRubric = rubric && rubricFeedback && !rubric.hideRubricFromStudentsInStudentReport;

    const hasFeedback = textFeedback || score || showRubric;
    const showFeedback = (hasFeedback && hasBeenReviewed);

    let feedbackDiv =
      <div data-cy="no-feedback">
        No feedback yet.
      </div>;

    if (showFeedback) {
      feedbackDiv =
        <div className="act-feedback-panel">
          <div className="heading">Teacher Feedback:</div>
          {
            showRubric &&
            <RubricBoxForStudent
              rubric={rubric}
              rubricFeedback={rubricFeedback}
            />
          }
          { this.renderTextSection(textFeedback) }
          { this.renderScoreSection(score) }
        </div>;
    }

    return (
      <div className="activity-feedback" data-test="activity-feedback">
        { feedbackDiv }
      </div>
    );
  }
}
