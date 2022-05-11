import React from "react";
import { Map } from "immutable";
import { getAnswersByQuestion } from "../../selectors/report-tree";
import { connect } from "react-redux";
import { getAnswerType, getAnswerIconId, AnswerProps, hasValidResponse } from "../../util/answer-utils";
import { feedbackValidForAnswer } from "../../util/misc";
import { getHideFeedbackBadges } from "../../selectors/dashboard-selectors";
import QuestionFeedbackBadge from "../../../img/svg-icons/feedback-question-badge-icon.svg";
import FeedbackAnswerUpdatedBadge from "../../../img/svg-icons/feedback-answer-updated-badge-icon.svg";

import css from "../../../css/portal-dashboard/answer-compact.less";
interface IProps extends AnswerProps {
  hideFeedbackBadges: boolean;
  feedback: Map<string, any>;
}
class AnswerCompact extends React.PureComponent<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  render() {
    const { answer, question, feedback, hideFeedbackBadges } = this.props;
    const answerType = getAnswerType(answer, question);
    const iconId = getAnswerIconId(answerType);

    return (
      <div className={css.answerCompact} data-cy="student-answer">
        { answer && hasValidResponse(answer, question)
          ? this.renderAnswer(answerType?.icon, iconId)
          : this.renderNoAnswer()
        }
        {(feedback && feedback.get("feedback") !== "" && !hideFeedbackBadges &&
          (feedbackValidForAnswer(feedback, answer)
           ? <QuestionFeedbackBadge className={css.feedbackBadge} data-cy="question-feedback-badge" />
           : <FeedbackAnswerUpdatedBadge className={css.feedbackBadge} data-cy="answer-updated-feedback-badge" />)
        )}
      </div>
    );
  }

  private renderAnswer = (icon: any, iconId: string) => {
    const { onAnswerSelect, selected } = this.props;
    const AnswerIcon = icon;
    return (
      <div className={`${css.answerContent} ${selected ? css.selected : ""}`} data-cy={iconId} onClick={onAnswerSelect}>
        <AnswerIcon />
      </div>
    );
  }

  renderNoAnswer = () => {
    const { onAnswerSelect, selected } = this.props;
    return (
      <div className={`${css.answerContent} ${css.noAnswer} ${selected ? css.selected : ""}`} data-cy="no-answer" onClick={onAnswerSelect}/>
    );
  }

}

function mapStateToProps(state: any, ownProps: any): Partial<IProps> {
  return {
    answer: getAnswersByQuestion(state)
      .getIn([ownProps.question.get("id"), ownProps.student.get("id")]),
    hideFeedbackBadges: getHideFeedbackBadges(state)
  };
}

const mapDispatchToProps = (dispatch: any, ownProps: any): Partial<IProps> => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(AnswerCompact);
