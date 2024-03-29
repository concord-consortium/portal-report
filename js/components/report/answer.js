import React, { PureComponent } from "react";
import MultipleChoiceAnswer from "./multiple-choice-answer";
import OpenResponseAnswer from "./open-response-answer";
import ImageAnswer from "./image-answer";
import IframeAnswer from "./iframe-answer";
import NoAnswer from "./no-answer";
import { renderInvalidAnswer } from "../../util/answer-utils";
import ReportItemIframe from "../portal-dashboard/report-item-iframe";

export default class Answer extends PureComponent {

  getComponent() {
    const { answer } = this.props;
    const AnswerComponent = {
      // Answers to LARA-native open response questions must be handled differently than
      // answers to managed interactive open response questions.
      "open_response": answer.has("reportState") ? IframeAnswer : OpenResponseAnswer,
      "multiple_choice": MultipleChoiceAnswer,
      "image_question": ImageAnswer,
      "iframe_interactive": IframeAnswer,
      "NoAnswer": NoAnswer,
    };

    return AnswerComponent[answer.get("questionType")];
  }

  render() {
    const { question, answer, alwaysOpen, answerOrientation, reportItemAnswer } = this.props;
    if (typeof answer === "undefined") {
      // TODO:  This should be set, but in the case of sequences
      // it seems its not. TBD later.
      return <div data-cy="no-response">No response</div>;
    }
    const hasReportItemUrl = !!question?.get("reportItemUrl");
    const AComponent = this.getComponent();
    if (!AComponent) {
      return renderInvalidAnswer("Answer type not supported");
    }
    return (
      <>
        { hasReportItemUrl && <ReportItemIframe question={question} view="singleAnswer" /> }
        <AComponent
          answer={answer}
          alwaysOpen={alwaysOpen}
          question={question}
          answerOrientation={answerOrientation}
          reportItemAnswer={reportItemAnswer}
          data-cy="answer"
        />
      </>
    );
  }
}
