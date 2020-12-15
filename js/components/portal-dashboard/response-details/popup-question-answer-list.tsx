import React from "react";
import { Map } from "immutable";
import Answer from "../../../containers/portal-dashboard/answer";
import { renderHTML } from "../../../util/render-html";

import css from "../../../../css/portal-dashboard/response-details/popup-question-answer-list.less";

interface IProps {
  activities: Map<any, any>;
  currentActivity: Map<string, any>;
  currentStudentId: string | null;
  students: Map<any, any>;
}

export class PopupQuestionAnswerList extends React.PureComponent<IProps> {
  render() {
    const { activities, currentStudentId, students, currentActivity } = this.props;
    const currentActivityId = currentActivity?.get("id");
    const student = currentStudentId
      ? students.toArray().find((s: any) => s.get("id") === currentStudentId)
      : students.toArray()[0];
    const activity = currentActivityId
      ? activities.toArray().find((a: any) => a.get("id") === currentActivityId)
      : activities.toArray()[0];
    const questions = activity.get("questions");

    return (
      <div className={css.responseTable} data-cy="popup-response-table">
          {questions.map((question: Map<any, any>, i: number) => {
            const prompt = question?.get("prompt");
            const blankRegEx = /\[([^)]+)\]/g;
            const promptText = prompt?.replace(blankRegEx, '__________');
            return (
              <div className={css.questionRow} key={`question ${i}`} data-cy="question-row">
                <div className={css.questionWrapper} data-cy="question-wrapper">
                  <span>Q{ question.get("questionNumber")}: {renderHTML(promptText)}</span>
                </div>
                <div className={css.studentResponse} data-cy="student-response">
                  <Answer question={question} student={student} responsive={false} />
                </div>
              </div>
            );
          })
          }
      </div>
    );
  }

}
