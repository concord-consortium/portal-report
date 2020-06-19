import React from "react";
import { Map } from "immutable";
import { QuestionArea } from "./question-area";
import ArrowIcon from "../../../img/svg-icons/arrow-icon.svg";

import css from "../../../css/portal-dashboard/question-navigator.less";


interface IProps {
  currentQuestion?: Map<string, any>;
  questions?: Map<string, any>;
  sortedQuestionIds?: string[];
  toggleCurrentQuestion: (questionId: string) => void;
  setCurrentActivity: (activityId: string) => void;
  inOverlay: boolean;
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
    this.handleChevronClick = this.handleChevronClick.bind(this);
  }
  render() {
    const { currentQuestion, inOverlay } = this.props;
    const chevronClass = this.state.hideQuestion ? `${css.arrow}  ${css.hideQuestion}` : `${css.arrow}`;

    return (
      <React.Fragment>
        <div className={css.titleWrapper}>
          <div className={css.nextQuestionButtons}>
            <div className={css.button + (this.previousQuestion ? "" : " " + css.disabled)}
              onClick={this.showQuestion(this.previousQuestion)} data-cy="question-overlay-previous-button">
              <svg className={css.icon}>
                <use xlinkHref="#arrow-triangle-left" />
              </svg>
            </div>
            <div className={css.button + (this.nextQuestion ? "" : " " + css.disabled)}
              onClick={this.showQuestion(this.nextQuestion)} data-cy="question-overlay-next-button">
              <svg className={css.icon}>
                <use xlinkHref="#arrow-triangle-left" />
              </svg>
            </div>
          </div>
          <div className={css.title} data-cy="question-overlay-title">
            Question #{currentQuestion ? currentQuestion.get("questionNumber") : ""}
          </div>
          {inOverlay && this.renderChevron(chevronClass)}
        </div>
        <QuestionArea currentQuestion={currentQuestion} hideQuestion={this.state.hideQuestion} />
      </React.Fragment>
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
    if (idx > 0) {
      return sortedQuestionIds[idx - 1];
    }
    return false;
  }

  private get nextQuestion() {
    const { sortedQuestionIds, currentQuestion } = this.props;
    if (!sortedQuestionIds || !currentQuestion) return false;
    const idx = sortedQuestionIds.indexOf(currentQuestion.get("id"));
    if (idx < sortedQuestionIds.length - 1) {
      return sortedQuestionIds[idx + 1];
    }
    return false;
  }

  private renderChevron = (cssClass: string) => {
    return (
      <div onClick={this.handleChevronClick} data-cy="show-hide-question-button">
        {<ArrowIcon className={cssClass} />}
      </div>
    );
  }

  private handleChevronClick() {
    this.setState({
      hideQuestion: !this.state.hideQuestion
    });
  }
}
