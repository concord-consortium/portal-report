import React from "react";
import { Map } from "immutable";
import MultipleChoiceQuestion from "../../components/portal-dashboard/questions/multiple-choice-question";
import OpenResponseQuestion from "../../components/portal-dashboard/questions/open-response-question";
import  ImageQuestion from "../../components/portal-dashboard/questions/image-question";
import IframeQuestion from "../../components/portal-dashboard/questions/iframe-question";

import css from "../../../css/portal-dashboard/question-area.less";

interface IProps {
  question?: Map<string,any>;
}
export class Question extends React.PureComponent <IProps>{

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
    const { question } = this.props;
    const QuesitonComponent: any = {
      "multiple_choice": MultipleChoiceQuestion,
      "open_response": OpenResponseQuestion,
      "image_question": ImageQuestion,
      "iframe_interactive": IframeQuestion,
    };
    const QComponent = (question && QuesitonComponent[type]);
    if (!QComponent) {
      return (
        <div>Question type not supported.</div>
      );
    }
    else {
      return (
        <QComponent question={question} />
      );
    }
  }
}
