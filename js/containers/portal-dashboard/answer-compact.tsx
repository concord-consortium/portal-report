import React from "react";
import { Map } from "immutable";
import { getAnswersByQuestion } from "../../selectors/report-tree";
import { connect } from "react-redux";
import { getAnswerType, getAnswerIconId, AnswerProps, hasResponse } from "../../util/answer-utils";
import { feedbackValidForAnswer } from "../../util/misc";
import { getHideFeedbackBadges } from "../../selectors/dashboard-selectors";
import QuestionFeedbackBadge from "../../../img/svg-icons/feedback-question-badge-icon.svg";
import FeedbackAnswerUpdatedBadge from "../../../img/svg-icons/feedback-answer-updated-badge-icon.svg";
import { IReportItemAnswer, IReportItemAnswerItemScore, ReportItemsType } from "@concord-consortium/interactive-api-host";
import { getReportItemAnswer } from "../../actions";

import css from "../../../css/portal-dashboard/answer-compact.less";
import { ScoreIcon } from "../../components/portal-dashboard/score-icon";

interface IProps extends AnswerProps {
  hideFeedbackBadges: boolean;
  feedback: Map<string, any>;
  getReportItemAnswer: (questionId: string, studentId: string, itemsType: ReportItemsType) => void;
  reportItemAnswer?: IReportItemAnswer;
}

export class AnswerCompact extends React.PureComponent<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  componentDidMount() {
    const { question, answer } = this.props;
    const hasReportItemUrl = !!question?.get("reportItemUrl");

    if (hasReportItemUrl && answer) {
      this.props.getReportItemAnswer(question.get("id"), answer.getIn(["student", "id"]), "compactAnswer");
    }
  }

  componentDidUpdate(prevProps: IProps) {
    const { question, answer } = this.props;
    const hasReportItemUrl = !!question?.get("reportItemUrl");
    const answerChanged = JSON.stringify(prevProps.answer) !== JSON.stringify(answer);

    if (hasReportItemUrl && answer && answerChanged) {
      this.props.getReportItemAnswer(question.get("id"), answer.getIn(["student", "id"]), "compactAnswer");
    }
  }

  render() {
    const { answer, question, feedback, hideFeedbackBadges, reportItemAnswer } = this.props;
    const answerType = getAnswerType(answer, question);
    const iconId = getAnswerIconId(answerType);

    // Early versions of reportItemAnswer did not have items. 
    // We believe that all report item interactives have been updated so
    // this code does not need to handle that case anymore
    const scoreItem: IReportItemAnswerItemScore | undefined =
      reportItemAnswer?.items.find(item => item.type === "score") as IReportItemAnswerItemScore;

    return (
      <div className={css.answerCompact} data-cy="student-answer">
        { answer && hasResponse(answer, question)
          ? this.renderAnswer(answerType?.icon, iconId)
          : this.renderNoAnswer()
        }
        {(feedback && feedback.get("feedback") !== "" && !hideFeedbackBadges &&
          (feedbackValidForAnswer(feedback, answer)
           ? <QuestionFeedbackBadge className={css.feedbackBadge} data-cy="question-feedback-badge" />
           : <FeedbackAnswerUpdatedBadge className={css.feedbackBadge} data-cy="answer-updated-feedback-badge" />)
        )}
        {
          scoreItem &&
          <div className={css.scoreContainer}><ScoreIcon score={scoreItem.score} maxScore={scoreItem.maxScore} /></div>
        }
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
  const answer = getAnswersByQuestion(state).getIn([ownProps.question.get("id"), ownProps.student.get("id")]);
  return {
    answer,
    hideFeedbackBadges: getHideFeedbackBadges(state),
    reportItemAnswer: answer ? state.getIn(["report", "reportItemAnswersCompact", answer.get("id")]) : undefined
  };
}

const mapDispatchToProps = (dispatch: any, ownProps: any): Partial<IProps> => {
  return {
    getReportItemAnswer: (questionId: string, studentId: string, itemsType: ReportItemsType) => dispatch(getReportItemAnswer(questionId, studentId, itemsType)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AnswerCompact);
