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

  changeFeedback(answerId, feedback) {
    this.props.updateQuestionFeedback(answerId, feedback);
  }

  scoreChange(e, answerId) {
    const value = parseInt(e.target.value, 10) || 0;
    this.changeFeedback(answerId, {score: value});
  }

  completeChange(e, answerId) {
    this.changeFeedback(answerId, {hasBeenReviewed: e.target.checked});
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
        score={score}
      />
    );
  }

  renderComplete(answerId, complete) {
    return (
      <div className="feedback-complete">
        <span> Feedback Complete </span>
        <input
          type="checkbox"
          checked={complete}
          onChange={(e) => this.completeChange(e, answerId)} />
      </div>
    );
  }

  renderFeedbackSection() {
    const feedbackRecord = this.props.feedback;
    const answerId = feedbackRecord.get("answerId");
    const feedback = feedbackRecord.get("feedback");
    const scoreString = feedbackRecord.get("score") || "0";
    const complete = feedbackRecord.get("hasBeenReviewed") || false;
    const score = parseInt(scoreString, 10);

    const scoreEnabled = this.props.scoreEnabled;
    const feedbackEnabled = this.props.feedbackEnabled;
    const disableFeedback = (!feedbackRecord) || complete;

    return (
      <div className="feedback-interface">
        <h4>Your Feedback</h4>
        <div className="feedback-content grid">
          <div className="grid-left">
            { feedbackEnabled ? this.renderFeedbackForm(answerId, disableFeedback, feedback) : ""}
          </div>
          <div className="grid-right">
            { scoreEnabled ? this.renderScore(answerId, disableFeedback, score) : "" }
            { feedbackEnabled || scoreEnabled ? this.renderComplete(answerId, complete) : ""}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const answer = this.props.answer;
    const answered = answer.get("answer");
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
