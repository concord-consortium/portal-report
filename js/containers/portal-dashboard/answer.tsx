/* eslint-disable no-console */
import React from "react";
import { getAnswersByQuestion } from "../../selectors/report-tree";
import { connect } from "react-redux";
import { AnswerTypes } from "../../util/answer-utils";
import { QuestionTypes } from "../../util/question-utils";

import css from "../../../css/portal-dashboard/answer.less";

interface IProps {
  answer: Map<any, any>;
  question: Map<any, any>;
  student: Map<any, any>;
  inPopup?: boolean;
}

class Answer extends React.PureComponent<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  render() {
    const { answer, question } = this.props;
    const type = answer && answer.get("questionType");
    const scored = question && question.get("scored");
    const atype = answer && answer.get("type");
    const qtype = question && question.get("type");
    const correct = scored ? answer && answer.get("correct") : undefined;
    const answerType = AnswerTypes.find(at => at.type === type && at.correct === correct);
    const questionType = QuestionTypes.find(qt => qt.type === qtype);
    const searchRegExp = / /g;
    const iconId = answerType ? answerType.name.toLowerCase().replace(searchRegExp, "-") : "";

    return (
      <div className={css.answer} data-cy="student-answer">
        {answer && (!question.get("required") || answer.get("submitted"))
          ? this.renderAnswer(answerType?.icon, iconId, atype)
          : this.renderNoAnswer(questionType?.icon, iconId)
        }
      </div>
    );
  }

  private renderAnswer = (answerType: string, iconId: string, type: string) => {
    const { answer, inPopup } = this.props;
    const AnswerIcon = answerType;
    const answerDetail = answer && answer.get('answer');

    if (inPopup) {
      return (
        <div className={css.answerDetail}>
          { this.renderAnswerDetail(answerDetail, type) }
        </div>
      );
    } else {
      return (
        <div className={css.answerContent} data-cy={iconId}>
          <AnswerIcon />
        </div>
      );
    }
  }

  renderNoAnswer = (questionType: string, iconId: string) => {
    const { inPopup } = this.props;
    const QuestionIcon = questionType;
    if (inPopup) {
      return (
        <div className={`${css.answerDetail} ${css.noAnswer}`} data-cy={iconId}>
          <QuestionIcon />
          No response
        </div>
      );
    } else {
      return (
        <div className={`${css.answerContent} ${css.noAnswer}`} data-cy={"no-answer"} />
      );
    }
  }

  renderAnswerDetail = (answer: any, type: string) => {
    console.log("in renderAnswerDetail",answer, "type: ", type);
    switch (type) {
      case "image_question_answer":
        return (
          <div><img src={answer.get("imageUrl")} />{answer.get("text")}</div>
        );
      case "external_link":
        return (
          <div><a href={answer} target="_blank">View work</a></div>
        );
      default:
        return(<div>{answer}</div>);
    }

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
