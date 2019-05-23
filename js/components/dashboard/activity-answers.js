import React, { PureComponent } from "react";
import ProgressBar from "./progress-bar";
import Answer from "./answer";

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
    const studentAnswers = activity.get("questions", [])
      .filter(q => q.get("visible"))
      .map(question => ({
        question,
        answer: question.get("answers", [])
          .find(answer => answer.get("studentId") === student.get("id")),
      }));
    return (
      <div className={css.activityAnswers} style={{ minWidth: width, width: width }} data-cy="activityAnswers">
        {
          !expanded && <ProgressBar progress={progress} />
        }
        {
          expanded && studentAnswers.map((data, idx) => {
            const question = data.question;
            const questionIsExpanded = expandedQuestions.get(question.get("id").toString());
            const showFullAnswer = showFullAnswers || questionIsExpanded;
            const anyStudentExpanded = this.props.anyStudentExpanded;
            const showWide = showFullAnswer || anyStudentExpanded;
            const className = css.answer + " " + (showWide ? css.fullAnswer : "");
            return (
              <div key={idx} className={className}>
                <Answer answer={data.answer} showFullAnswer={showFullAnswer} question={question} />
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
