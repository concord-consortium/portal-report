/* eslint-disable no-console */
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
  // toggleAllResponsesToCurrentQuestion: (questionId: string) => void;
}

export class QuestionOverlay extends React.PureComponent<IProps> {
  render() {
    // const questionId = this.props.currentQuestion?.get("id");
    const cssToUse = css;
    const { currentQuestion, questions, sortedQuestionIds, toggleCurrentQuestion, setCurrentActivity } = this.props;
    let wrapperClass = css.questionOverlay;
    if (currentQuestion) {
      wrapperClass += " " + css.visible;
    }
    return (
      <div className={wrapperClass} data-cy="question-overlay">
        {
          < QuestionNavigator cssToUse={cssToUse}
          currentQuestion={currentQuestion}
          questions={questions}
          sortedQuestionIds={sortedQuestionIds}
          toggleCurrentQuestion={toggleCurrentQuestion}
          setCurrentActivity={setCurrentActivity}/>
        }
        {/* <div onClick={this.handleAllResponsesButtonClick(questionId)}> pop up button</div> */}

      </div>
    );
  }

  // private handleAllResponsesButtonClick = (questionId: string) => () => {
  //   alert('click on pop up button');
  //   // this.props.toggleAllResponsesToCurrentQuestion(questionId);
  // }
}
