import React, { PureComponent } from "react";
import Prompt from "./prompt";
import FeedbackPanel from "../../containers/report/feedback-panel";
import { fromJS } from "immutable";

import "../../../css/report/question-summary.less";

export default class QuestionSummary extends PureComponent {
  get answered() {
    return this.props.answers.toJS().filter(a => a.type !== "NoAnswer").length;
  }

  get notAnswered() {
    return this.props.answers.toJS().filter(a => a.type === "NoAnswer").length;
  }

  render() {
    const { question, showFeedback } = this.props;
    const notAnswered = this.notAnswered;
    return (
      <div className="question-summary">
        <Prompt question={question} />
        <div className="stats">
          {
            notAnswered > 0 &&
            <div><strong>Not answered:</strong> { notAnswered }</div>
          }
          {
            showFeedback &&
            <FeedbackPanel question={this.props.question} answers={this.props.answers} />
          }
        </div>
        <div className="clear-fix" />
      </div>
    );
  }
}

QuestionSummary.defaultProps = {
  showFeedback: true,
  answers: fromJS([])
};
