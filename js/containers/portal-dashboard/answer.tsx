import React from "react";
import { getAnswersByQuestion } from "../../selectors/report-tree";
import { connect } from "react-redux";
import { AnswerTypes } from "../../util/answer-utils";

import css from "../../../css/portal-dashboard/answer.less";

interface IProps {
  answer: Map<any, any>;
  question: Map<any, any>;
  student: Map<any, any>;
}

class Answer extends React.PureComponent<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  render() {
    const { answer, question } = this.props;
    return (
      <div className={css.answer} data-cy="student-answer">
      { answer && (!question.get("required") || answer.get("submitted"))
        ? this.renderAnswer()
        : this.renderNoAnswer() }
      </div>
    );
  }

  private renderAnswer = () => {
    const { answer, question } = this.props;
    const type = answer.get("questionType");
    const scored = question.get("scored");
    const correct = scored ? answer.get("correct") : undefined;
    const answerType = AnswerTypes.find(at => at.type === type && at.correct === correct);
    const searchRegExp = / /g;
    const iconId = answerType ? answerType.name.toLowerCase().replace(searchRegExp, "-") : "";
    const AnswerIcon = answerType?.icon;
    return (
      <div className={css.answerContent} data-cy={iconId}>
        <AnswerIcon/>
      </div>
    );
  }

  renderNoAnswer = () => {
    return (
      <div className={`${css.answerContent} ${css.noAnswer}`} data-cy={"no-answer"}/>
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

export default connect(mapStateToProps, mapDispatchToProps)(Answer);
