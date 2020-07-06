import React from "react";
import { getAnswersByQuestion } from "../../selectors/report-tree";
import { connect } from "react-redux";
import { AnswerTypes } from "../../util/answer-utils";
import { QuestionTypes } from "../../util/question-utils";
import MultipleChoiceAnswer from "../../components/portal-dashboard/multiple-choice-answer";
import OpenResponseAnswer from "../../components/dashboard/open-response-answer";
import ImageAnswer from "../../components/report/image-answer";
import ExternalLinkAnswer from "../../components/portal-dashboard/external-link-answer";
import IframeAnswer from "../../components/report/iframe-answer";

import css from "../../../css/portal-dashboard/answer.less";

interface IProps {
  answer: Map<any, any>;
  question: Map<string, any>;
  student: Map<any, any>;
  inDetail?: boolean;
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
    const questionType = QuestionTypes.find(qt => qt.type === qtype && qt.scored === scored);
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
    const { inDetail } = this.props;
    const AnswerIcon = answerType;

    if (!inDetail) {
      return (
        <div className={css.answerContent} data-cy={iconId}>
          <AnswerIcon />
        </div>
      );
    } else {
      return (
        <div className={css.answerDetail}>
          {this.renderAnswerDetail(type)}
        </div>
      );
    }
  }

  renderNoAnswer = (questionType: string, iconId: string) => {
    const { inDetail } = this.props;
    const QuestionIcon = questionType;
    if (!inDetail) {
      return (
        <div className={`${css.answerContent} ${css.noAnswer}`} data-cy={"no-answer"} />
      );
    } else {
      return (
        <div className={`${css.answerDetail} ${css.noAnswer}`} data-cy={iconId}>
          <QuestionIcon />
          No response
        </div>
      );
    }
  }

  renderAnswerDetail = (type: string) => {
    const { answer, question } = this.props;
    const AnswerComponent: any = {
      "multiple_choice_answer": MultipleChoiceAnswer,
      "open_response_answer": OpenResponseAnswer,
      "image_question_answer": ImageAnswer,
      "external_link": ExternalLinkAnswer,
      "interactive_state": IframeAnswer,
    };
    const AComponent = (answer && (!question.get("required") || answer.get("submitted"))) ? AnswerComponent[type] : undefined;
    if (!AComponent) {
      return (
        <div>Answer type not supported.</div>
      );
    }
    else {
      return (
        <AComponent answer={answer} question={question} showFullAnswer={true} />
      );
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
