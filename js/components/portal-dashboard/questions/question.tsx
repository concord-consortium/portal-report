import React from "react";
import { Map } from "immutable";
import { MultipleChoiceQuestion } from "./multiple-choice-question";
import { OpenResponseQuestion } from "./open-response-question";
import { ImageQuestion } from "./image-question";
import { IframeQuestion } from "./iframe-question";

import css from "../../../../css/portal-dashboard/question-area.less";

interface IProps {
  question?: Map<string,any>;
  useMinHeight?: boolean;
}
export class Question extends React.PureComponent <IProps> {

  render() {
    const { question } = this.props;
    const qtype = question && question.get("type");

    return (
      <div className={css.questionText} data-cy="current-question">
        {this.renderQuestion(qtype)}
      </div>
    );
  }

  renderQuestion = (type: string) => {
    const { question, useMinHeight } = this.props;
    const QuestionComponent: any = {
      "multiple_choice": MultipleChoiceQuestion,
      "open_response": OpenResponseQuestion,
      "image_question": ImageQuestion,
      "iframe_interactive": IframeQuestion,
    };
    const QComponent = (question && QuestionComponent[type]);

    return (
      QComponent ? <QComponent question={question} useMinHeight={useMinHeight} /> : <div>Question type not supported.</div>
    );
  }
}
