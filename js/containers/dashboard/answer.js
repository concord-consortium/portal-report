import React, { PureComponent } from "react";
import { Map } from "immutable";
import MultipleChoiceAnswer from "../../components/dashboard/multiple-choice-answer";
import OpenResponseAnswer from "../../components/dashboard/open-response-answer";
import { getAnswerTrees } from "../../selectors/report-tree";
import { connect } from "react-redux";

import css from "../../../css/dashboard/answer.less";

export const NoAnswer = () => null;

export const GenericAnswer = () => (
  <div className={css.genericAnswer}>
    {
      "\u2b24" // large circle
    }
  </div>
);

const AnswerComponent = {
  "multiple_choice": MultipleChoiceAnswer,
  "open_response": OpenResponseAnswer,
  "image_question": GenericAnswer,
  "iframe_interactive": GenericAnswer,
  "NoAnswer": NoAnswer,
};

export class Answer extends PureComponent {
  render() {
    const { answer, showFullAnswer, question } = this.props;
    let AComponent = NoAnswer;
    if (answer && (!question.get("required") || answer.get("submitted"))) {
      AComponent = AnswerComponent[answer.get("questionType")] || GenericAnswer;
    }
    return (
      <AComponent answer={answer} showFullAnswer={showFullAnswer} question={question} />
    );
  }
}

Answer.defaultProps = {
  answer: null,
  question: Map(),
  showFullAnswer: false,
};

function mapStateToProps(state, ownProps) {
  return {
    answer: getAnswerTrees(state).toList().find(answer =>
      answer.get("questionId") === ownProps.question.get("id") &&
      answer.get("platformUserId") === ownProps.student.get("id")
    )
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Answer);
