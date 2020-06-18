import React from "react";
import { Map } from "immutable";
import { QuestionNavigator } from "../question-navigator";
import { QuestionArea } from "../question-area";
import css from "../../../../css/portal-dashboard/all-responses-popup/popup-question-nav.less";


interface IProps {
  currentQuestion?: Map<string, any>;
  questions?: Map<string, any>;
  sortedQuestionIds?: string[];
  toggleCurrentQuestion: (questionId: string) => void;
  setCurrentActivity: (activityId: string) => void;
}
export class PopupQuestionNav extends React.PureComponent<IProps>{
  render() {
    const cssToUse = css;
    const { currentQuestion, questions, sortedQuestionIds, toggleCurrentQuestion, setCurrentActivity } = this.props;
    return (
      <div className={`${css.questionArea} ${css.column}`}>
        <div className={`${css.popupQuestionNavigator}`} data-cy="questionNav">
          <QuestionNavigator cssToUse={cssToUse}
            currentQuestion={currentQuestion}
            questions={questions}
            sortedQuestionIds={sortedQuestionIds}
            toggleCurrentQuestion={toggleCurrentQuestion}
            setCurrentActivity={setCurrentActivity} />
        </div>
        <div className={`${css.popupQuestionDiv}`} >
          <QuestionArea currentQuestion={currentQuestion} cssToUse={cssToUse}/>
        </div>
      </div>
    );
  }
}
