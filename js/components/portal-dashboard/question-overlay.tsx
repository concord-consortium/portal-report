import React from "react";
import { Map } from "immutable";
import { QuestionNavigator } from "./question-navigator";

import css from "../../../css/portal-dashboard/question-overlay.less";

interface IProps {
  currentQuestion?: Map<string, any>;
  questions?: Map<string, any>;
  sortedQuestionIds?: string[];
  toggleCurrentQuestion: (questionId: string) => void;
  setCurrentActivity: (activityId: string) => void;
  handleShowAllResponsesPopup: (show: boolean) => void;
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
    const cssToUse = css;
    const { currentQuestion, questions, sortedQuestionIds, toggleCurrentQuestion, setCurrentActivity } = this.props;
    return (
      <React.Fragment>
        <div className={css.header} onClick={this.dismissCurrentQuestion} data-cy="question-overlay-header">
          <svg className={css.icon}>
            <use xlinkHref="#question-popout" />
          </svg>
          <div>Question Detail View</div>
        </div>
        <QuestionNavigator cssToUse={cssToUse}
          currentQuestion={currentQuestion}
          questions={questions}
          sortedQuestionIds={sortedQuestionIds}
          toggleCurrentQuestion={toggleCurrentQuestion}
          setCurrentActivity={setCurrentActivity} />
        {this.renderFooter()}
      </React.Fragment>
    );
  }

  private dismissCurrentQuestion = () => {
    if (this.props.currentQuestion) {
      this.props.toggleCurrentQuestion(this.props.currentQuestion.get("id"));
    }
  }

  private renderFooter = () => {
    return (
      <div className={css.footer}>
        <div className={css.openPopupButton} data-cy="view-all-student-responses-button" onClick={this.handleShowAllResponsesButtonClick}>
          <svg className={css.icon}>
            <use xlinkHref="#icon-group" />
          </svg>
          <span>View All Student Responses</span>
        </div>
      </div>
    );
  }

  private handleShowAllResponsesButtonClick = () => {
    this.props.handleShowAllResponsesPopup(true);
  }
}
