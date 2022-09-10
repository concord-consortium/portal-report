import React, { PureComponent } from "react";
import Answer from "./answer";
import QuestionHeader from "./question-header";
import SelectionCheckbox from "../../containers/report/selection-checkbox";
import Feedback from "../../containers/report/feedback";

import "../../../css/report/question.less";
import Prompt from "./prompt";

export default class QuestionForStudent extends PureComponent {
  render() {
    const { question, url, student, answerMap, trackEvent } = this.props;
    const studentId = student?.id;
    const answer = answerMap?.[studentId];
    return (
      <div className={`question for-student ${question?.visible ? "" : "hidden"}`}>
        <div className="question-header">
          <SelectionCheckbox selected={question?.selected} questionKey={question?.id} trackEvent={trackEvent} />
          <QuestionHeader question={question} url={url} />
        </div>
        <Prompt question={question} />
        <Answer answer={answer} question={question} />
        <Feedback answer={answer} student={student} question={question} htmlFor="student" />
      </div>
    );
  }
}
