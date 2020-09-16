import React from "react";
import { Map } from "immutable";
import { PopupHeader } from "./popup-header";
import { PopupClassNav } from "./popup-class-nav";
import { QuestionNavigator } from "../question-navigator";
import { PopupStudentResponseList } from "./popup-student-response-list";

import css from "../../../../css/portal-dashboard/all-responses-popup/student-responses-popup.less";

interface IProps {
  anonymous: boolean;
  currentQuestion?: Map<string, any>;
  handleCloseAllResponsesPopup: (show: boolean) => void;
  isAnonymous: boolean;
  questions?: Map<string, any>;
  setAnonymous: (value: boolean) => void;
  setCurrentActivity: (activityId: string) => void;
  setStudentFilter: (value: string) => void;
  sortedQuestionIds?: string[];
  studentCount: number;
  students: any;
  trackEvent: (category: string, action: string, label: string) => void;
  toggleCurrentQuestion: (questionId: string) => void;
}
export class StudentResponsePopup extends React.PureComponent<IProps> {
  render() {
    const { anonymous, students, isAnonymous, studentCount, setAnonymous, setStudentFilter, trackEvent,
      currentQuestion, questions, sortedQuestionIds, toggleCurrentQuestion, setCurrentActivity } = this.props;
    return (
      <div className={css.popup} data-cy="all-responses-popup-view">
        <PopupHeader handleCloseAllResponsesPopup={this.props.handleCloseAllResponsesPopup} />
        <div className={css.tableHeader}>
          <PopupClassNav
            anonymous={anonymous}
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
            />
          </div>
        </div>
        <PopupStudentResponseList
          students={students}
          isAnonymous={isAnonymous}
          currentQuestion={currentQuestion}
        />
      </div>
    );
  }
}
