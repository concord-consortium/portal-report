import React, { PureComponent } from "react";
import RubricBox from "./rubric-box";
import FeedbackBox from "./feedback-box";
import ScoreBox from "./score-box";
import StudentReportLink from "./student-report-link";
import { isAutoScoring } from "../../util/scoring-constants";
export default class ActivityFeedbackRow extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      disableComplete: true,
    };
    this.scoreChange = this.scoreChange.bind(this);
    this.completeChange = this.completeChange.bind(this);
    this.changeFeedback = this.changeFeedback.bind(this);
    this.rubricChange = this.rubricChange.bind(this);
  }

  changeFeedback(answerId, newData) {
    const oldData = this.fieldValues();
    const newRecord = Object.assign({}, oldData, newData);
    this.props.updateQuestionFeedbacks(answerId, newRecord);
  }

  scoreChange(e, answerId) {
    const value = parseInt(e.target.value, 10) || 0;
    this.changeFeedback(answerId, {score: value});
  }

  completeChange(e, answerId) {
    this.changeFeedback(answerId, {hasBeenReviewed: e.target.checked});
  }

  rubricChange(answerId, rubricFeedback) {
    this.changeFeedback(answerId, {rubricFeedback});
  }

  renderFeedbackForm(answerId, disableFeedback, feedback) {
    return (
      <FeedbackBox
        rows="10"
        cols="20"
        disabled={disableFeedback}
        onChange={(textValue) => this.changeFeedback(answerId, {feedback: textValue})}
        initialFeedback={feedback} />
    );
  }

  renderScore(answerId, disableScore, score) {
    return (
      <ScoreBox
        disabled={disableScore}
        onChange={(value) => this.changeFeedback(answerId, {score: value})}
        score={score} />
    );
  }

  renderComplete(answerId, complete) {
    return (
      <div className="feedback-complete">
        <span>Feedback Complete</span>
        <input
          checked={complete}
          type="checkbox"
          onChange={(e) => this.completeChange(e, answerId)} />
      </div>
    );
  }

  fieldValues() {
    const { studentActivityFeedback } = this.props;
    const feedbackRecord = studentActivityFeedback.get("feedback");
    const recordJS = feedbackRecord
      ? feedbackRecord.toJS()
      : {};
    let {score, feedback, hasBeenReviewed, rubricFeedback} = recordJS;
    score = score || "";
    score = parseInt(score, 10) || 0;
    feedback = feedback || "";
    rubricFeedback = rubricFeedback || {};

    return {
      score,
      feedback,
      rubricFeedback,
      complete: hasBeenReviewed,
      learnerId: this.props.studentActivityFeedback.get("learnerId"),
      activityFeedbackId: this.props.activityFeedbackId,
    };
  }

  renderFeedbackSection(studentFeedback) {
    const { feedback, score, complete, learnerId, rubricFeedback } = this.fieldValues();
    const { useRubric, feedbackEnabled, scoreType, autoScore, rubric } = this.props;
    const activityFeedbackKey = studentFeedback.get("id");
    const scoreEnabled = scoreType !== "none";
    const automaticScoring = isAutoScoring(scoreType);
    const disableFeedback = !learnerId || complete;
    const disableScore = disableFeedback || automaticScoring;
    const scoreToRender = automaticScoring ? autoScore : score;

    return (
      <div className="feedback-interface">
        <h4>Your Feedback</h4>
        <div className="feedback-content grid">
          {
            useRubric
              ? <div className="grid-wide">
                <RubricBox
                  learnerId={learnerId}
                  disabled={complete}
                  rubric={rubric}
                  rubricFeedback={rubricFeedback}
                  rubricChange={(changedRubricFeedback) => this.rubricChange(activityFeedbackKey, changedRubricFeedback)} />
              </div>
              : null
          }
          <div className="grid-left">
            {
              feedbackEnabled
                ? this.renderFeedbackForm(activityFeedbackKey, disableFeedback, feedback)
                : ""
            }
          </div>
          <div className="grid-right">
            {
              scoreEnabled
                ? this.renderScore(activityFeedbackKey, disableScore, scoreToRender)
                : null
            }
            {
              feedbackEnabled || scoreEnabled || useRubric
                ? this.renderComplete(activityFeedbackKey, complete)
                : null
            }
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { studentActivityFeedback, activityId } = this.props;
    const student = studentActivityFeedback.get("student");
    const name = student.get("realName");
    const learnerId = studentActivityFeedback.get("learnerId");

    const noFeedbackSection =
      <p>
        This user hasn't finished yet.
      </p>;

    const feedback = learnerId
      ? this.renderFeedbackSection(studentActivityFeedback)
      : noFeedbackSection;

    return (
      <div className="feedback-row">
        <div className="student-answer">
          <h3>{name}'s work</h3>
          <p>
            <StudentReportLink activityId={activityId} student={student} started={learnerId} />
          </p>
        </div>
        {feedback}
      </div>
    );
  }
}
