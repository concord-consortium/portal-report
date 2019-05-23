import React, { PureComponent } from "react";
import { Map } from "immutable";
import MultipleChoiceAnswer from "./multiple-choice-answer";
import OpenResponseAnswer from "./open-response-answer";

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

export default class Answer extends PureComponent {
  render() {
    const { answer, showFullAnswer, question } = this.props;
    let AComponent = NoAnswer;
    if (answer && answer.get("submitted")) {
      AComponent = AnswerComponent[answer.get("type")] || GenericAnswer;
    }
    return (
      <AComponent answer={answer} showFullAnswer={showFullAnswer} question={question} />
    );
  }
}

Answer.defaultProps = {
  answer: Map(),
  question: Map(),
  showFullAnswer: false,
};
