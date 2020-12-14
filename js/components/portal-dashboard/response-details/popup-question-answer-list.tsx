import React from "react";
import { Map } from "immutable";
import Answer from "../../../containers/portal-dashboard/answer";
import striptags from "striptags";

import { Question } from "../questions/question";

import css from "../../../../css/portal-dashboard/response-details/popup-question-answer-list.less";

interface IProps {
  questions?: Map<any, any>;
  currentStudentId: string | null;
  students: Map<any, any>;
}

export class PopupQuestionAnswerList extends React.PureComponent<IProps> {
  render() {
    const { questions, currentStudentId, students } = this.props;
    const student = currentStudentId ?
                      students.toArray().find((s: any) => s.get("id") === currentStudentId)
                    : students.toArray()[0];

    return (
      <div className={css.responseTable} data-cy="popup-response-table">
        { questions?.toArray().map((question: Map<any, any>, i: number) => {
          return (
            <div className={css.questionRow} key={`question ${i}`} data-cy="question-row">
              {this.renderQuestionWrapper(question)}
              <div className={css.studentResponse} data-cy="student-response">
                <Answer question={question} student={student} responsive={false} />
              </div>
            </div>
          );
        }) }
      </div>
    );
  }

  private renderQuestionWrapper(question: any) {
    // eslint-disable-next-line no-console
    console.log(question);
    return (
      <div className={css.questionWrapper}>
        <span>Q{question.get("questionNumber")}: {striptags(question.get("prompt"))}</span>
        {/* <Question question={question} /> */}
      </div>
    );
  }

}
