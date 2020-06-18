import React from "react";
import { Map } from "immutable";
import { QuestionNavigator } from "../question-navigator";
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
    const { currentQuestion, questions, sortedQuestionIds, toggleCurrentQuestion, setCurrentActivity } = this.props;
    const style: any = {height: '195px'};
    return (
      <div className={`${css.questionArea} ${css.column}`} data-cy="questionArea">
          <QuestionNavigator
            currentQuestion={currentQuestion}
            questions={questions}
            sortedQuestionIds={sortedQuestionIds}
            toggleCurrentQuestion={toggleCurrentQuestion}
            setCurrentActivity={setCurrentActivity}
            height={style}
            inOverlay={false}/>
      </div>
    );
  }
}
