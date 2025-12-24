import React from "react";
import { List, Map } from "immutable";
import { getAnswersByQuestion, getInteractiveStateHistoriesByQuestion } from "../../selectors/report-tree";
import { connect } from "react-redux";
import { AnswerProps, hasResponse } from "../../util/answer-utils";
import { getQuestionIcon } from "../../util/question-utils";
import MultipleChoiceAnswer from "../../components/portal-dashboard/multiple-choice-answer";
import OpenResponseAnswer from "../../components/dashboard/open-response-answer";
import { ImageAnswer } from "../../components/portal-dashboard/answers/image-answer";
import IframeAnswer from "../../components/report/iframe-answer";
import { interactiveStateHistoryCache } from "../../util/interactive-state-history-cache";

import css from "../../../css/portal-dashboard/answer.less";
import { urlParam } from "../../util/misc";

interface ExtendedAnswerProps extends Omit<AnswerProps, 'answer'> {
  currentAnswer: Map<string, any>;
  inQuestionDetailsPanel?: boolean;
  sourceKey: string;
}

interface State {
  answer: Map<string, any>;
  error?: string|null;
  interactiveStateHistoryId?: string;
}

class Answer extends React.PureComponent<ExtendedAnswerProps, State> {
  constructor(props: ExtendedAnswerProps) {
    super(props);

    this.state ={
      answer: props.currentAnswer,
      interactiveStateHistoryId: undefined
    };

    this.handleSetInteractiveStateHistoryId = this.handleSetInteractiveStateHistoryId.bind(this);
  }

  UNSAFE_componentWillReceiveProps(nextProps: Readonly<ExtendedAnswerProps>, nextContext: any): void {
    const newStudent = nextProps.student !== this.props.student;
    const newQuestion = nextProps.question !== this.props.question;
    const newAnswer = nextProps.currentAnswer !== this.props.currentAnswer;
    const useNewAnswer = newStudent || newQuestion || (newAnswer && !this.state.interactiveStateHistoryId);

    if (useNewAnswer) {
      this.setState({ answer: nextProps.currentAnswer, interactiveStateHistoryId: undefined, error: null });
    }
  }

  getAnswerComponent() {
    const { question } = this.props;
    const { answer } = this.state;
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

  handleSetInteractiveStateHistoryId = (newId?: string) => {
    const { sourceKey } = this.props;
    this.setState({ interactiveStateHistoryId: newId });

    if (newId) {
      this.setState({ error: null });
      interactiveStateHistoryCache.get(sourceKey, newId, (err, state) => {
        if (err) {
          this.setState({ error: err });
        } else {
          this.setState({ answer: Map(state) });
        }
      });
    } else {
      // reset to the current answer
      this.setState({ answer: this.props.currentAnswer, error: null });
    }
  };

  // In the Question Details panel, we render the full set of choices available for a
  // multiple-choice question, even if the student hasn't selected any of them.
  renderNoMCAnswerForQuestionDetails = () => {
    const { inQuestionDetailsPanel, question, interactiveStateHistory } = this.props;
    const noResponseAnswer = Map({
      id: "noResponse",
      content: "No response",
      correct: false,
      selected: false
    });

    return (
      <MultipleChoiceAnswer
        answer={noResponseAnswer}
        inQuestionDetailsPanel={inQuestionDetailsPanel}
        question={question}
        showFullAnswer={true}
        interactiveStateHistory={interactiveStateHistory}
        interactiveStateHistoryId={this.state.interactiveStateHistoryId}
        setInteractiveStateHistoryId={this.handleSetInteractiveStateHistoryId}
      />
    );
  }

  renderNoAnswer = () => {
    const { question, inQuestionDetailsPanel } = this.props;

    if (question.get("type") === "multiple_choice" && inQuestionDetailsPanel) {
      return this.renderNoMCAnswerForQuestionDetails();
    }

    const QuestionIcon = getQuestionIcon(question);
    return (
      <div className={css.noAnswer}>
        <QuestionIcon />
        No response
      </div>
    );
  }

  renderAnswer = () => {
    const { question, responsive, studentName, trackEvent, answerOrientation, inQuestionDetailsPanel, interactiveStateHistory, sourceKey } = this.props;
    const { answer, error } = this.state;
    const AComponent = this.getAnswerComponent();
    if (!AComponent) {
      return (
        <div>Answer type not supported.</div>
      );
    }
    else {
      return (
        <>
          <AComponent
            key={question.get("id")}
            answer={answer}
            question={question}
            showFullAnswer={true}
            responsive={responsive}
            studentName={studentName}
            trackEvent={trackEvent}
            answerOrientation={answerOrientation}
            inQuestionDetailsPanel={inQuestionDetailsPanel}
            interactiveStateHistory={interactiveStateHistory}
            interactiveStateHistoryId={this.state.interactiveStateHistoryId}
            setInteractiveStateHistoryId={this.handleSetInteractiveStateHistoryId}
            sourceKey={sourceKey}
          />
          {error && <div className={css.error}>{error}</div>}
        </>
      );
    }
  }

  render() {
    const { question, student } = this.props;
    const { answer, error } = this.state;
    const key = `student-${student ? student.get("id") : "NA"}-question-${question ? question.get("id") : "NA"}`;
    return (
      <div className={css.answer} data-cy="student-answer" key={key}>
        {error && <div className={css.error}>{error}</div>}
        { answer && hasResponse(answer, question) ? this.renderAnswer() : this.renderNoAnswer() }
      </div>
    );
  }
}

function mapStateToProps(state: any, ownProps: any): Partial<ExtendedAnswerProps> {
  return {
    currentAnswer: getAnswersByQuestion(state)
      .getIn([ownProps.question.get("id"), ownProps.student.get("id")]) as Map<string, any>,
    interactiveStateHistory: getInteractiveStateHistoriesByQuestion(state)
      .getIn([ownProps.question.get("id"), ownProps.student.get("id")]) as List<Map<string, any>>,
    sourceKey: urlParam("answersSourceKey") || state.getIn(["report", "sourceKey"]) as string
  };
}

const mapDispatchToProps = (dispatch: any, ownProps: any): Partial<AnswerProps> => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Answer);
