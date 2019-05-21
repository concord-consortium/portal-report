import React, { PureComponent } from "react";
import Answer from "./answer";
import FeedbackBox from "./feedback-box";
import ScoreBox from "./score-box";

export default class FeedbackRow extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      disableComplete: true,
    };
    this.scoreChange = this.scoreChange.bind(this);
    this.completeChange = this.completeChange.bind(this);
    this.changeFeedback = this.changeFeedback.bind(this);
  }

  changeFeedback(answerKey, feedback) {
    this.props.updateFeedback(answerKey, feedback);
  }

  scoreChange(e, answerKey) {
    const value = parseInt(e.target.value, 10) || 0;
    this.changeFeedback(answerKey, {score: value});
  }

  completeChange(e, answerKey) {
    this.changeFeedback(answerKey, {hasBeenReviewed: e.target.checked});
  }

  renderFeedbackForm(answerKey, disableFeedback, feedback) {
    return (
      <FeedbackBox
        rows="10"
        cols="20"
        disabled={disableFeedback}
        onChange={(textValue) => this.changeFeedback(answerKey, {feedback: textValue})}
        initialFeedback={feedback} />
    );
  }

  renderScore(answerKey, disableScore, score) {
    return (
      <ScoreBox
        disabled={disableScore}
        onChange={(value) => this.changeFeedback(answerKey, {score: value})}
        score={score} />
    );
  }

  renderComplete(answerKey, complete) {
    return (
      <div className="feedback-complete">
        <span> Feedback Complete </span>
        <input
          checked={complete}
          type="checkbox"
          onChange={(e) => this.completeChange(e, answerKey)} />
      </div>
    );
  }

  renderFeedbackSection(answer) {
    const allFeedbacks = this.props.feedbacks;
    const feedbackRecords = answer.get("feedbacks").map(feedbackKey => allFeedbacks.get(feedbackKey));
    const feedbackRecord = feedbackRecords.last();
    const answerKey = feedbackRecord ? feedbackRecord.get("answerKey") : null;
    const feedback = feedbackRecord ? feedbackRecord.get("feedback") : "";
    const score = parseInt(feedbackRecord.get("score"), 10) || 0;

    const scoreEnabled = this.props.scoreEnabled;
    const feedbackEnabled = this.props.feedbackEnabled;
    const complete = feedbackRecord ? feedbackRecord.get("hasBeenReviewed") : false;
    const disableFeedback = (!feedbackRecord) || complete;

    return (
      <div className="feedback-interface">
        <h4>Your Feedback</h4>
        <div className="feedback-content grid">
          <div className="grid-left">
            { feedbackEnabled ? this.renderFeedbackForm(answerKey, disableFeedback, feedback) : ""}
          </div>
          <div className="grid-right">
            { scoreEnabled ? this.renderScore(answerKey, disableFeedback, score) : "" }
            { feedbackEnabled || scoreEnabled ? this.renderComplete(answerKey, complete) : ""}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const answer = this.props.answer;
    const answered = answer.get("answered") || false;
    const name = answer.get("student").get("realName");

    return (
      <div className="feedback-row">
        <div className="student-answer">
          <h3>{name}'s Answer</h3>
          <Answer answer={answer} />
        </div>
        { answered ? this.renderFeedbackSection(answer) : null }
      </div>
    );
  }
}
