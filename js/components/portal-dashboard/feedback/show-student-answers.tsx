import React, { useState } from "react";
import classNames from "classnames";
import striptags from "striptags";
import { Map } from "immutable";
import Answer from "../../../containers/portal-dashboard/answer";
import { renderHTML } from "../../../util/render-html";

import css from "../../../../css/portal-dashboard/feedback/show-student-answers.less";

interface IProps {
  activityStarted: boolean;
  activity: Map<string, any>;
  student: any;
}

export const ShowStudentAnswers: React.FC<IProps> = (props) => {
  const {activityStarted, activity, student} = props;
  const [showing, setShowing] = useState(false);

  if (!activityStarted) {
    return null;
  }

  const handleToggleShowing = () => setShowing(prev => !prev);

  const renderStudentAnswers = () => {
    const questions = activity.get("questions");
    const rows = questions.map((question: Map<any, any>) => {
      const currentQuestionId = question.get("id");
      const blankRegEx = /\[([^)]+)\]/g;
      const promptText = question?.get("prompt")?.replace(blankRegEx, '__________');

      return (
        <div className={css.row} key={currentQuestionId} data-cy="question-row">
          <div className={css.questionWrapper} data-cy="question-wrapper">
            <div className={css.questionName} data-cy="student-name">
              Q{question.get("questionNumber")}: {renderHTML(striptags(promptText))}
            </div>
          </div>
          <div className={css.studentResponse} data-cy="student-response">
            <Answer question={question} student={student} responsive={false} />
          </div>
        </div>
      );
    });

    return (
      <div className={css.answers}>
        {rows}
      </div>
    );
  };

  return (
    <div className={css.showStudentAnswers}>
      <button className={classNames(css.showToggle, {[css.showing]: showing})} onClick={handleToggleShowing}>{showing ? "Hide Student Answers" : "Show Student Answers"}</button>
      {showing && renderStudentAnswers()}
    </div>
  );
};

