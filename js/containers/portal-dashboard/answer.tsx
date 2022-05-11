import React from "react";
import { getAnswersByQuestion } from "../../selectors/report-tree";
import { connect } from "react-redux";
import { AnswerProps, hasValidResponse } from "../../util/answer-utils";
import { getQuestionIcon } from "../../util/question-utils";
import MultipleChoiceAnswer from "../../components/portal-dashboard/multiple-choice-answer";
import OpenResponseAnswer from "../../components/dashboard/open-response-answer";
import { ImageAnswer } from "../../components/portal-dashboard/answers/image-answer";
import IframeAnswer from "../../components/report/iframe-answer";

import css from "../../../css/portal-dashboard/answer.less";

class Answer extends React.PureComponent<AnswerProps> {
  constructor(props: AnswerProps) {
    super(props);
  }

  getAnswerComponent() {
    const { answer, question } = this.props;
    const atype = answer && answer.get("type");
    const AnswerComponent: any = {
      "multiple_choice_answer": MultipleChoiceAnswer,
      // Answers to LARA-native open response questions must be handled differently than
      // answers to managed interactive open response questions.
      "open_response_answer": answer.has("reportState") ? IframeAnswer : OpenResponseAnswer,
      "image_question_answer": ImageAnswer,
      "external_link": IframeAnswer,
      "interactive_state": IframeAnswer,
    };
    const AComponent = (answer && (!question.get("required") || answer.get("submitted"))) ? AnswerComponent[atype] : undefined;
    return AComponent;
  }

  renderNoAnswer = () => {
    const { question } = this.props;
    const QuestionIcon = getQuestionIcon(question);
    return (
      <div className={css.noAnswer}>
        <QuestionIcon />
        No response
      </div>
    );
  }

  renderAnswer = () => {
    const { answer, question, responsive, studentName, trackEvent, answerOrientation } = this.props;
    const AComponent = this.getAnswerComponent();
    if (!AComponent) {
      return (
        <div>Answer type not supported.</div>
      );
    }
    else {
      return (
        <AComponent
          answer={answer}
          question={question}
          showFullAnswer={true}
          responsive={responsive}
          studentName={studentName}
          trackEvent={trackEvent}
          answerOrientation={answerOrientation}
        />
      );
    }
  }

  render() {
    const { answer, question, student } = this.props;
    const key = `student-${student ? student.get("id") : "NA"}-question-${question ? question.get("id") : "NA"}`;
    return (
      <div className={css.answer} data-cy="student-answer" key={key}>
        { answer && hasValidResponse(answer, question) ? this.renderAnswer() : this.renderNoAnswer() }
      </div>
    );
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
