import React from "react";
import { Map } from "immutable";
import { PopupHeader } from "./popup-header";
import { PopupClassNav } from "./popup-class-nav";
import { PopupQuestionNav } from "./popup-question-nav";

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
            <PopupQuestionNav
              currentQuestion={currentQuestion}
              questions={questions}
              sortedQuestionIds={sortedQuestionIds}
              toggleCurrentQuestion={toggleCurrentQuestion}
              setCurrentActivity={setCurrentActivity} />
        </div>
      </div>
    );
  }
}
