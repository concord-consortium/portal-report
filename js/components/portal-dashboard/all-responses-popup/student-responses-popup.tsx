import React from "react";
import { Map } from "immutable";
import { PopupHeader } from "./popup-header";
import { PopupClassNav } from "./popup-class-nav";
import { QuestionNavigator } from "../question-navigator";

import css from "../../../../css/portal-dashboard/all-responses-popup/student-responses-popup.less";

interface IProps {
  studentCount: number;
  setAnonymous: (value: boolean) => void;
  setStudentFilter: (value: string) => void;
  currentQuestion?: Map<string, any>;
  questions?: Map<string, any>;
  sortedQuestionIds?: string[];
  toggleCurrentQuestion: (questionId: string) => void;
  setCurrentActivity: (activityId: string) => void;
  trackEvent: (category: string, action: string, label: string) => void;
  handleCloseAllResponsesPopup: (show: boolean) => void;
}
export class StudentResponsePopup extends React.PureComponent<IProps> {
  render() {
    const { currentQuestion, questions, sortedQuestionIds, toggleCurrentQuestion, setCurrentActivity, studentCount, setAnonymous, setStudentFilter, trackEvent } = this.props;
    return (
      <div className={css.popup} data-cy="all-responses-popup-view">
        <PopupHeader handleCloseAllResponsesPopup={this.props.handleCloseAllResponsesPopup} />
        <div className={css.tableHeader}>
          <PopupClassNav
            studentCount={studentCount}
            setAnonymous={setAnonymous}
            setStudentFilter={setStudentFilter}
            trackEvent={trackEvent} />
          <div className={`${css.questionArea} ${css.column}`} data-cy="questionArea">
            <QuestionNavigator
              currentQuestion={currentQuestion}
              questions={questions}
              sortedQuestionIds={sortedQuestionIds}
              toggleCurrentQuestion={toggleCurrentQuestion}
              setCurrentActivity={setCurrentActivity}
              inOverlay={false} />
          </div>
        </div>
      </div>
    );
  }
}
