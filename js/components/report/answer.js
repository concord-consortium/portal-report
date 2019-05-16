import React, { PureComponent } from "react";
import OpenResponseAnswer from "./open-response-answer";
import MultipleChoiceAnswer from "./multiple-choice-answer";
import ImageAnswer from "./image-answer";
import IframeAnswer from "./iframe-answer";
import NoAnswer from "./no-answer";

const AnswerComponent = {
  "Embeddable::OpenResponse": OpenResponseAnswer,
  "Embeddable::MultipleChoice": MultipleChoiceAnswer,
  "Embeddable::ImageQuestion": ImageAnswer,
  "Embeddable::Iframe": IframeAnswer,
  "NoAnswer": NoAnswer,
};

export default class Answer extends PureComponent {
  render() {
    const { answer, alwaysOpen } = this.props;
    if (typeof answer === "undefined") {
      // TODO:  This should be set, but in the case of sequences
      // it seems its not. TBD later.
      return <div>No response</div>;
    }
    const AComponent = AnswerComponent[answer.get("type")];
    if (!AComponent) {
      return <div>Answer type not supported.</div>;
    }
    return <AComponent answer={answer} alwaysOpen={alwaysOpen} />;
  }
}
