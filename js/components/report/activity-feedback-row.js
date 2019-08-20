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

  changeFeedback(newData) {
    const { activityId, studentId, updateActivityFeedback } = this.props;
    const oldData = this.fieldValues();
    const newRecord = Object.assign({}, oldData, newData);
    updateActivityFeedback(activityId, studentId, newRecord);
  }

  scoreChange(e) {
    const value = parseInt(e.target.value, 10) || 0;
    this.changeFeedback({score: value});
  }

  completeChange(e) {
    this.changeFeedback({hasBeenReviewed: e.target.checked});
  }

  rubricChange(rubricFeedback) {
    this.changeFeedback({ rubricFeedback });
  }

  renderFeedbackForm(answerId, disableFeedback, feedback) {
    return (
      <FeedbackBox
        rows="10"
        cols="20"
        disabled={disableFeedback}
        onChange={(textValue) => this.changeFeedback({feedback: textValue})}
        initialFeedback={feedback} />
    );
  }

  renderScore(answerId, disableScore, score) {
    return (
      <ScoreBox
        disabled={disableScore}
        onChange={(value) => this.changeFeedback({score: value})}
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
    let {score, feedback, hasBeenReviewed, rubricFeedback } = studentActivityFeedback.toJS();
    score = score || "";
    score = parseInt(score, 10) || 0;
    feedback = feedback || "";
    const complete = hasBeenReviewed || false;
    rubricFeedback = rubricFeedback || {};

    return {
      score,
      feedback,
      rubricFeedback,
      complete,
      activityId: this.props.activityId
    };
  }

  renderFeedbackSection(studentFeedback) {
    const {
      feedback, score, complete, rubricFeedback
    } = this.fieldValues();
    const {
      useRubric, feedbackEnabled, studentId,
      scoreType, autoScore, rubric
    } = this.props;

    const activityFeedbackKey = studentFeedback.get("id");
    const scoreEnabled = scoreType !== "none";
    const automaticScoring = isAutoScoring(scoreType);
    const disableFeedback = complete;
    const disableScore = disableFeedback || automaticScoring;
    const scoreToRender = (automaticScoring ? autoScore : score) || 0;

    return (
      <div className="feedback-interface">
        <h4>Your Feedback</h4>
        <div className="feedback-content grid">
          {
            useRubric
              ? <div className="grid-wide">
                <RubricBox
                  learnerId={studentId}
                  disabled={complete}
                  rubric={rubric}
                  rubricFeedback={rubricFeedback}
                  rubricChange={this.rubricChange}
                />
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
    const started = studentActivityFeedback.get("activityStarted");
    const noFeedbackSection =
      <p>
        This user hasn't finished yet.
      </p>;

    const feedbackSection = started
      ? this.renderFeedbackSection(studentActivityFeedback)
      : noFeedbackSection;

    return (
      <div className="feedback-row">
        <div className="student-answer">
          <h3>{name}'s work</h3>
          <p>
            <StudentReportLink activityId={activityId} student={student} started={started} />
          </p>
        </div>
        {feedbackSection}
      </div>
    );
  }
}
