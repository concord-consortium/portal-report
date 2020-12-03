import React from "react";
import { connect } from "react-redux";
import { updateQuestionFeedback, updateQuestionFeedbackSettings } from "../../actions/index";

interface IProps {
  question: Map<any, any>;
  questionFeedbacks: Map<any, any>;
  settings: Map<any, any>;
  updateQuestionFeedback: (answerId: string, feedback: any) => void;
  updateQuestionFeedbackSettings: (embeddableKey: string, feedbackFlags: any) => void;
}

class QuestionFeedbackPanel extends React.PureComponent<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  render() {
    // TODO: FEEDBACK
    // display the question feedback
    return (
      <div>
        Question Feedback Panel
      </div>
    );
  }

}

function mapStateToProps(state: any, ownProps: any): Partial<IProps> {
  return {
    questionFeedbacks: state.getIn(["feedback", "questionFeedbacks"]),
    settings: state.getIn(["feedback", "settings"])
  };
}

const mapDispatchToProps = (dispatch: any, ownProps: any): Partial<IProps> => {
  return {
    updateQuestionFeedback: (answerId, feedback) => dispatch(updateQuestionFeedback(answerId, feedback)),
    updateQuestionFeedbackSettings: (embeddableKey, feedbackFlags) => dispatch(updateQuestionFeedbackSettings(embeddableKey, feedbackFlags)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(QuestionFeedbackPanel);
