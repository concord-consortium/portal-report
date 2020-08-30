import React from "react";
import { getAnswersByQuestion } from "../../selectors/report-tree";
import { connect } from "react-redux";
import { getAnswerType, getAnswerIconId } from "../../util/answer-utils";

import css from "../../../css/portal-dashboard/answer-compact.less";

interface IProps {
  answer: Map<any, any>;
  question: Map<string, any>;
  student: Map<any, any>;
}

class AnswerCompact extends React.PureComponent<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  render() {
    const { answer, question } = this.props;
    const answerType = getAnswerType(answer, question);
    const iconId = getAnswerIconId(answerType);
    return (
      <div className={css.answerCompact} data-cy="student-answer">
        { answer && (!question.get("required") || answer.get("submitted"))
          ? this.renderAnswer(answerType?.icon, iconId)
          : this.renderNoAnswer()
        }
      </div>
    );
  }

  private renderAnswer = (icon: any, iconId: string) => {
    const AnswerIcon = icon;
    return (
      <div className={css.answerContent} data-cy={iconId}>
        <AnswerIcon />
      </div>
    );
  }

  renderNoAnswer = () => {
    return (
      <div className={`${css.answerContent} ${css.noAnswer}`} data-cy="no-answer" />
    );
  }

}

function mapStateToProps(state: any, ownProps: any): Partial<IProps> {
  return {
    answer: getAnswersByQuestion(state)
      .getIn([ownProps.question.get("id"), ownProps.student.get("id")])
  };
}

const mapDispatchToProps = (dispatch: any, ownProps: any): Partial<IProps> => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(AnswerCompact);
