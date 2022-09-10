import React, { PureComponent } from "react";
import ProgressBar from "./progress-bar";
import Answer from "../../containers/dashboard/answer";
import { getAnswersByQuestion } from "../../selectors/report-tree";
import { connect } from "react-redux";

import css from "../../../css/dashboard/activity-answers.less";

export class ActivityAnswers extends PureComponent {
  renderMultChoiceSummary() {
    const { activity, answers, student } = this.props;
    const scoredQuestions = activity?.questions.filter(q =>
      q?.visible && q?.type === "multiple_choice" && q?.scored,
    );
    const questionsWithCorrectAnswer = scoredQuestions.filter(
      question => answers.getIn([question?.id, student?.id, "correct"])
    );
    return `${questionsWithCorrectAnswer.count()} / ${scoredQuestions.count()}`;
  }

  render() {
    const {
      student, activity, progress, expanded, showFullAnswers,
      width, multChoiceSummary, expandedQuestions,
    } = this.props;
    const visibleQuestions = (activity?.questions ?? []).filter(q => q?.visible);
    return (
      <div className={css.activityAnswers} style={{ minWidth: width, width }} data-cy="activityAnswers">
        {
          !expanded && <ProgressBar progress={progress} />
        }
        {
          expanded && visibleQuestions.map(question => {
            const questionIsExpanded = expandedQuestions?.[question.get("id")];
            const showFullAnswer = showFullAnswers || questionIsExpanded;
            const anyStudentExpanded = this.props.anyStudentExpanded;
            const showWide = showFullAnswer || anyStudentExpanded;
            const className = css.answer + " " + (showWide ? css.fullAnswer : "");
            return (
              <div key={question?.id} className={className}>
                <Answer question={question} student={student} showFullAnswer={showFullAnswer} />
              </div>
            );
          })
        }
        {
          expanded && multChoiceSummary &&
          <div className={css.answer + " " + css.multChoiceSummary}
            data-cy="correctCell">
            { this.renderMultChoiceSummary() }
          </div>
        }
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  // const questions = ownProps.activity.get("questions") || [];
  const answers = getAnswersByQuestion(state);

  return { answers };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivityAnswers);
