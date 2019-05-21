import React, { PureComponent } from "react";
import { connect } from "react-redux";
import FeedbackPanelForStudent from "../../components/report/feedback-panel-for-student";
import "../../../css/report/answer-feedback.less";

class Feedback extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  feedbackEnabled() {
    return this.props.question.get("feedbackEnabled");
  }

  scoreEnabled() {
    return this.props.question.get("scoreEnabled");
  }

  getLatestFeedback() {
    const feedbackKey = this.props.answer.get("feedbacks") && this.props.answer.get("feedbacks").last();
    return this.props.feedbacks.get(feedbackKey);
  }

  renderScore(feedback) {
    const score = feedback.get("score");
    if (this.scoreEnabled()) {
      return (
        <div className="feedback-section score">
          <h1>
            Score:
          </h1>
          <span className="score">
            {score}
          </span>
        </div>
      );
    }
    return "";
  }

  renderFeedback(feedback) {
    if (this.feedbackEnabled()) {
      return (
        <div className="feedback-section written-feedback">
          <h1>
            Teacher Feedback:
          </h1>
          <span>
            {feedback.get("feedback")}
          </span>
        </div>
      );
    }
    return "";
  }

  render() {
    const {student} = this.props;
    const showScore = this.scoreEnabled();
    const showText = this.feedbackEnabled();
    const feedbackEnabled = showText || showScore;
    const maxScore = this.props.question.get("maxScore");
    const feedback = this.getLatestFeedback();
    const score = feedback && feedback.get("score");
    const textFeedback = feedback && feedback.get("feedback");
    const hasBeenReviewed = feedback && feedback.get("hasBeenReviewed");
    return (
      <FeedbackPanelForStudent
        student={student}
        showScore={showScore}
        maxScore={maxScore}
        feedbackEnabled={feedbackEnabled}
        showText={showText}
        textFeedback={textFeedback}
        score={score}
        hasBeenReviewed={hasBeenReviewed}
        useRubric={false}
        rubric={null}
        autoScore={false}
        isOverall={false}
      />
    );
  }
}

function mapStateToProps(state) {
  return { feedbacks: state.get("feedbacks") };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Feedback);
