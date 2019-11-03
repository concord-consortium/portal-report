import React, { PureComponent } from "react";
import ProgressBar from "./progress-bar";
import Answer from "../../containers/dashboard/answer";
import { getAnswerTrees } from "../../selectors/report-tree";
import { connect } from "react-redux";

import css from "../../../css/dashboard/activity-answers.less";

export class ActivityAnswers extends PureComponent {
  renderMultChoiceSummary() {
    const { activity, answers } = this.props;
    const scoredQuestions = activity.get("questions").filter(q =>
      q.get("visible") && q.get("type") === "multiple_choice" && q.get("scored"),
    );
    const correctAnswers = scoredQuestions.filter(question =>
      answers.find(answer => answer.get("questionId") === question.get("id") && answer.get("correct")),
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

function mapStateToProps(state, ownProps) {
  const questions = ownProps.activity.get("questions") || [];
  const questionIds = questions.map(question => question.get("id"));
  const answerTreeList = getAnswerTrees(state).toList();

  return {
    // This computes an answers property here by finding all of the answers
    // for the questions we were passed.
    // this is only used to compute a score, so it might be better to just compute
    // the score here instead of passing around answers

    // This is not very efficient because we are iterating over every questionId in the
    // the activity for each answer in the activity
    answers: answerTreeList.filter((answer) => questionIds.includes(answer.get("questionId")) &&
      answer.get("platformUserId") === ownProps.student.get("id"))
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivityAnswers);
