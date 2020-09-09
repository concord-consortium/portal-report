import React from "react";
import { getAnswersByQuestion } from "../../selectors/report-tree";
import { connect } from "react-redux";
import { getAnswerType, getAnswerIconId, AnswerProps } from "../../util/answer-utils";
import { QuestionTypes } from "../../util/question-utils";
import MultipleChoiceAnswer from "../../components/portal-dashboard/multiple-choice-answer";
import OpenResponseAnswer from "../../components/dashboard/open-response-answer";
import { ImageAnswer } from "../../components/portal-dashboard/answers/image-answer";
import ExternalLinkAnswer from "../../components/portal-dashboard/external-link-answer";
import IframeAnswer from "../../components/report/iframe-answer";

import css from "../../../css/portal-dashboard/answer.less";

class Answer extends React.PureComponent<AnswerProps> {
  constructor(props: AnswerProps) {
    super(props);
  }

  render() {
    const { answer, question } = this.props;
    const atype = answer && answer.get("type");
    const qtype = question && question.get("type");
    const scored = question && question.get("scored");
    const questionType = QuestionTypes.find(qt => qt.type === qtype && qt.scored === scored);
    const answerType = getAnswerType(answer, question);
    const iconId = getAnswerIconId(answerType);

    return (
      <div className={css.answer} data-cy="student-answer">
        {answer && (!question.get("required") || answer.get("submitted"))
          ? this.renderAnswer(atype)
          : this.renderNoAnswer(questionType?.icon, iconId)
        }
      </div>
    );
  }

  renderNoAnswer = (icon: any, iconId: string) => {
    const QuestionIcon = icon;
    return (
      <div className={css.noAnswer} data-cy={iconId}>
        <QuestionIcon />
        No response
      </div>
    );
  }

  renderAnswer = (type: string) => {
    const { answer, question, responsive, studentName } = this.props;
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
        <AComponent answer={answer} question={question} showFullAnswer={true} responsive={responsive} studentName={studentName}/>
      );
    }
  }
}

function mapStateToProps(state: any, ownProps: any): Partial<AnswerProps> {
  return {
    answer: getAnswersByQuestion(state)
      .getIn([ownProps.question.get("id"), ownProps.student.get("id")])
  };
}

const mapDispatchToProps = (dispatch: any, ownProps: any): Partial<AnswerProps> => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Answer);
