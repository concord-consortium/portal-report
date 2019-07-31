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
    if (!this.props.answer) {
      return null;
    }
    const answer = this.props.answer;
    return this.props.questionFeedbacks.get(answer.get("id"));
  }

  render() {
    const {student} = this.props;
    const showScore = this.scoreEnabled();
    const showText = this.feedbackEnabled();
    const feedbackEnabled = showText || showScore;
    const maxScore = this.props.question.get("maxScore");
    const feedback = this.getLatestFeedback();
    if (!feedback) {
      return null;
    }
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
  return { questionFeedbacks: state.getIn(["feedback", "questionFeedbacks"]) };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Feedback);
