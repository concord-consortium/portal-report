import React, { PureComponent } from "react";
import Prompt from "./prompt";
import QuestionFeedbackPanel from "../../containers/report/question-feedback-panel";
import { fromJS } from "immutable";

import "../../../css/report/question-summary.less";

export default class QuestionSummary extends PureComponent {
  get notAnswered() {
    return this.props.students.size -  this.props.answers.size;
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
            <QuestionFeedbackPanel question={this.props.question} answers={this.props.answers} students={this.props.students} />
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
