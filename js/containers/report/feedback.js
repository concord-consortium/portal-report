import React, { PureComponent } from "react";
import { connect } from "react-redux";
import FeedbackPanelForStudent from "../../components/report/feedback-panel-for-student";
import "../../../css/report/answer-feedback.less";
import { MAX_SCORE_DEFAULT } from "../../util/scoring-constants";
import { feedbackValidForAnswer } from "../../util/misc";

class Feedback extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getFeedback() {
    const { answer, questionFeedbacks } = this.props;
    if (!answer) {
      return null;
    }
    return questionFeedbacks?.[answer.get("id")];
  }

  render() {
    const { student, question, settings, answer } = this.props;
    const questionSettings = settings.getIn(["questionSettings", question?.id]);
    if (!questionSettings) {
      return null;
    }
    const feedback = this.getFeedback();
    if (!feedback) {
      return null;
    }
    const showScore = questionSettings?.scoreEnabled;
    const showText = questionSettings?.feedbackEnabled;
    const maxScore = questionSettings?.maxScore || MAX_SCORE_DEFAULT;
    const feedbackEnabled = showText || showScore;
    const score = feedback && feedback?.score;
    const textFeedback = feedback && feedback?.feedback;
    const hasBeenReviewed = feedback && feedbackValidForAnswer(feedback, answer);
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
  return {
    settings: state.getIn(["feedback", "settings"]),
    questionFeedbacks: state.getIn(["feedback", "questionFeedbacks"])
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Feedback);
