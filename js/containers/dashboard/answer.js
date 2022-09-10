import React, { PureComponent } from "react";
import MultipleChoiceAnswer from "../../components/dashboard/multiple-choice-answer";
import OpenResponseAnswer from "../../components/dashboard/open-response-answer";
import { getAnswersByQuestion } from "../../selectors/report-tree";
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
    if (answer && (!question?.required || answer?.submitted)) {
      AComponent = AnswerComponent[answer?.questionType] || GenericAnswer;
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
    answer: getAnswersByQuestion(state)?.[ownProps.question?.id]?.[ownProps.student?.id]
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Answer);
