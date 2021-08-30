import React, { PureComponent } from "react";
import OpenResponseAnswer from "./open-response-answer";
import MultipleChoiceAnswer from "./multiple-choice-answer";
import ImageAnswer from "./image-answer";
import IframeAnswer from "./iframe-answer";
import NoAnswer from "./no-answer";
import { renderInvalidAnswer } from "../../util/answer-utils";

const AnswerComponent = {
  "open_response": OpenResponseAnswer,
  "multiple_choice": MultipleChoiceAnswer,
  "image_question": ImageAnswer,
  "iframe_interactive": IframeAnswer,
  "NoAnswer": NoAnswer,
};

export default class Answer extends PureComponent {
  render() {
    const { question, answer, alwaysOpen } = this.props;
    if (typeof answer === "undefined") {
      // TODO:  This should be set, but in the case of sequences
      // it seems its not. TBD later.
      return <div data-cy="no-response">No response</div>;
    }
    const AComponent = AnswerComponent[answer.get("questionType")];
    if (!AComponent) {
      return renderInvalidAnswer("Answer type not supported");
    }
    return <AComponent answer={answer} alwaysOpen={alwaysOpen} question={question} data-cy="answer"/>;
  }
}
