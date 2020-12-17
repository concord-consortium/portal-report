import React from "react";
import { Map } from "immutable";
import { QuestionArea } from "./question-area";
import ArrowIcon from "../../../img/svg-icons/arrow-icon.svg";
import ArrowLeftIcon from "../../../img/svg-icons/arrow-left-icon.svg";

import css from "../../../css/portal-dashboard/question-navigator.less";


interface IProps {
  currentActivity?: Map<string, any>;
  currentQuestion?: Map<string, any>;
  questions?: Map<string, any>;
  sortedQuestionIds?: string[];
  toggleCurrentQuestion: (questionId: string) => void;
  setCurrentActivity: (activityId: string) => void;
  inOverlay?: boolean;
  hasTeacherEdition: boolean;
}
interface IState {
  hideQuestion: boolean;
}

export class QuestionNavigator extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      hideQuestion: false
    };
  }
  render() {
    const { currentActivity, currentQuestion, inOverlay, hasTeacherEdition } = this.props;
    return (
      <div className={css.questionArea}>
        <div className={css.titleWrapper}>
          <div className={css.nextQuestionButtons}>
            <div className={css.button + (this.previousQuestion ? "" : " " + css.disabled)}
              onClick={this.showQuestion(this.previousQuestion)} data-cy="question-navigator-previous-button">
              <ArrowLeftIcon className={css.icon} />
            </div>
            <div className={css.button + (this.nextQuestion ? "" : " " + css.disabled)}
              onClick={this.showQuestion(this.nextQuestion)} data-cy="question-navigator-next-button">
              <ArrowLeftIcon className={css.icon} />
            </div>
          </div>
          <div className={css.title} data-cy="question-overlay-title">
            Question #{currentQuestion ? currentQuestion.get("questionNumber") : ""}
          </div>
          {inOverlay && this.renderChevron()}
        </div>
        <QuestionArea
          currentQuestion={currentQuestion}
          hideQuestion={this.state.hideQuestion}
          useMinHeight={inOverlay}
          hasTeacherEdition={hasTeacherEdition} />
      </div>
    );
  }

  private showQuestion = (questionId: string | false) => () => {
    if (!questionId || !this.props.questions) return;
    const currentActivityId = this.props.currentQuestion?.get("activity");
    const nextActivityId = this.props.questions.get(questionId).get("activity");
    this.props.toggleCurrentQuestion(questionId);
    if (currentActivityId !== nextActivityId) {
      this.props.setCurrentActivity(nextActivityId);
    }
  }

  private get previousQuestion() {
    const { sortedQuestionIds, currentQuestion } = this.props;
    if (!sortedQuestionIds || !currentQuestion) return false;
    const idx = sortedQuestionIds.indexOf(currentQuestion.get("id"));
    return idx > 0 ? sortedQuestionIds[idx - 1] : false;
  }

  private get nextQuestion() {
    const { sortedQuestionIds, currentQuestion } = this.props;
    if (!sortedQuestionIds || !currentQuestion) return false;
    const idx = sortedQuestionIds.indexOf(currentQuestion.get("id"));
    return idx < sortedQuestionIds.length - 1 ? sortedQuestionIds[idx + 1] : false;
  }

  private renderChevron = () => {
    return (
      <div className={css.showHideButton} onClick={this.handleChevronClick} data-cy="show-hide-question-button">
        <ArrowIcon className={`${css.arrow} ${this.state.hideQuestion ? css.hideQuestion : ""}`} />
      </div>
    );
  }

  private handleChevronClick = () => {
    this.setState({
      hideQuestion: !this.state.hideQuestion
    });
  }
}
