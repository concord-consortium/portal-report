import React, { PureComponent } from "react";
import ProgressBar from "./progress-bar";
import Answer from "../../containers/dashboard/answer";

import css from "../../../css/dashboard/activity-answers.less";

export default class ActivityAnswers extends PureComponent {
  renderMultChoiceSummary() {
    const { student, activity } = this.props;
    const scoredQuestions = activity.get("questions").filter(q =>
      q.get("visible") && q.get("type") === "multiple_choice" && q.get("scored"),
    );
    const correctAnswers = scoredQuestions.filter(question =>
      question.get("answers").find(answer => answer.get("studentId") === student.get("id") && answer.get("isCorrect")),
    );
    return `${correctAnswers.count()} / ${scoredQuestions.count()}`;
  }

  render() {
    const {
      student, activity, progress, expanded, showFullAnswers,
      width, multChoiceSummary, expandedQuestions,
    } = this.props;
    const visibleQuestions = activity.get("questions", []).filter(q => q.get("visible"));
    return (
      <div className={css.activityAnswers} style={{ minWidth: width, width: width }} data-cy="activityAnswers">
        {
          !expanded && <ProgressBar progress={progress} />
        }
        {
          expanded && visibleQuestions.map(question => {
            const questionIsExpanded = expandedQuestions.get(question.get("id"));
            const showFullAnswer = showFullAnswers || questionIsExpanded;
            const anyStudentExpanded = this.props.anyStudentExpanded;
            const showWide = showFullAnswer || anyStudentExpanded;
            const className = css.answer + " " + (showWide ? css.fullAnswer : "");
            return (
              <div key={question.get("id")} className={className}>
                <Answer question={question} student={student} showFullAnswer={showFullAnswer} />
              </div>
            );
          })
        }
        {
          expanded && multChoiceSummary &&
          <div className={css.answer + " " + css.multChoiceSummary}>
            { this.renderMultChoiceSummary() }
          </div>
        }
      </div>
    );
  }
}
