import React from "react";
import { Map } from "immutable";

import css from "../../../css/portal-dashboard/question-overlay.less";

interface IProps {
  currentQuestion?: Map<string, any>;
  questions?: Map<string, any>;
  toggleCurrentQuestion: (questionId: string) => void;
  setCurrentActivity: (activityId: string) => void;
}

export class QuestionOverlay extends React.PureComponent<IProps> {
  render() {
    const { currentQuestion } = this.props;
    let wrapperClass = css.questionOverlay;
    if (currentQuestion) {
      wrapperClass += " " + css.visible;
    }
    return (
      <div className={wrapperClass} data-cy="question-overlay">
        {
          currentQuestion && this.renderQuestionDetails(currentQuestion)
        }
      </div>
    );
  }

  private renderQuestionDetails = (question: Map<string, any>) => {
    return (
      <React.Fragment>
        <div className={css.header} onClick={this.dismissCurrentQuestion} data-cy="question-overlay-header">
          <svg className={css.icon}>
            <use xlinkHref="#question-popout"/>
          </svg>
          <div>Question Detail View</div>
        </div>
        <div className={css.titleWrapper}>
          <div className={css.nextQuestionButtons}>
            <div className={css.button + ( this.previousQuestion ? "" : " " + css.disabled )}
                onClick={this.showQuestion(this.previousQuestion)} data-cy="question-overlay-previous-button">
              <svg className={css.icon}>
                <use xlinkHref="#arrow-triangle-left"/>
              </svg>
            </div>
            <div className={css.button + ( this.nextQuestion ? "" : " " + css.disabled )}
                onClick={this.showQuestion(this.nextQuestion)} data-cy="question-overlay-next-button">
              <svg className={css.icon}>
                <use xlinkHref="#arrow-triangle-left"/>
              </svg>
            </div>
          </div>
          <div className={css.title}>
            Question #{ question.get("questionNumber") }
          </div>
        </div>
      </React.Fragment>
    );
  }

  private dismissCurrentQuestion = () => {
    if (this.props.currentQuestion) {
      this.props.toggleCurrentQuestion(this.props.currentQuestion.get("id"));
    }
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
    if (!this.props.questions || !this.props.currentQuestion) return false;
    const questionIds = this.props.questions.keySeq().toArray();
    const idx = questionIds.indexOf(this.props.currentQuestion.get("id"));
    if (idx > 0) {
      return questionIds[idx - 1];
    }
    return false;
  }

  private get nextQuestion() {
    if (!this.props.questions || !this.props.currentQuestion) return false;
    const questionIds = this.props.questions.keySeq().toArray();
    const idx = questionIds.indexOf(this.props.currentQuestion.get("id"));
    if (idx < questionIds.length - 1) {
      return questionIds[idx + 1];
    }
    return false;
  }
}
