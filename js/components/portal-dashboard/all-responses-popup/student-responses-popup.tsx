import React from "react";
import { Map } from "immutable";
import { PopupHeader } from "./popup-header";
import { PopupClassNav } from "./popup-class-nav";
import { QuestionNavigator } from "../question-navigator";
import { PopupStudentResponseList } from "./popup-student-response-list";
import { SpotlightMessageDialog } from "./spotlight-message-dialog";
import { SpotlightStudentListDialog } from "./spotlight-student-list-dialog";

import css from "../../../../css/portal-dashboard/all-responses-popup/student-responses-popup.less";

interface IProps {
  anonymous: boolean;
  currentActivity?: Map<string, any>;
  currentQuestion?: Map<string, any>;
  hasTeacherEdition: boolean;
  isAnonymous: boolean;
  questions?: Map<string, any>;
  onClose: (show: boolean) => void;
  setAnonymous: (value: boolean) => void;
  setCurrentActivity: (activityId: string) => void;
  setStudentFilter: (value: string) => void;
  sortedQuestionIds?: string[];
  studentCount: number;
  students: any;
  toggleCurrentQuestion: (questionId: string) => void;
  trackEvent: (category: string, action: string, label: string) => void;
}
interface IState {
  selectedStudents: Map<any, any>[];
  showSpotlightDialog: boolean;
  showSpotlightListDialog: boolean;
}
export class StudentResponsePopup extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      selectedStudents: [],
      showSpotlightDialog: false,
      showSpotlightListDialog: false
    };
  }
  render() {
    const { anonymous, currentActivity, currentQuestion, hasTeacherEdition, isAnonymous, onClose, questions,
            setAnonymous, setCurrentActivity, setStudentFilter, sortedQuestionIds, studentCount, students,
            toggleCurrentQuestion, trackEvent } = this.props;
    const { selectedStudents, showSpotlightDialog, showSpotlightListDialog } = this.state;
    return (
      <div className={css.popup} data-cy="all-responses-popup-view">
        <PopupHeader currentActivity={currentActivity} onCloseSelect={onClose} />
        <div className={css.tableHeader}>
          <PopupClassNav
            anonymous={anonymous}
            isSpotlightOn={selectedStudents.length > 0}
            studentCount={studentCount}
            setAnonymous={setAnonymous}
            setStudentFilter={setStudentFilter}
            trackEvent={trackEvent}
            onShowDialog={selectedStudents.length > 0 ? this.setShowSpotlightListDialog : this.setShowSpotlightDialog}
          />
          <div className={`${css.questionArea} ${css.column}`} data-cy="questionArea">
            <QuestionNavigator
              currentActivity={currentActivity}
              currentQuestion={currentQuestion}
              questions={questions}
              sortedQuestionIds={sortedQuestionIds}
              toggleCurrentQuestion={toggleCurrentQuestion}
              setCurrentActivity={setCurrentActivity}
              hasTeacherEdition={hasTeacherEdition}
            />
          </div>
        </div>
        <PopupStudentResponseList
          currentQuestion={currentQuestion}
          isAnonymous={isAnonymous}
          onStudentSelect={this.toggleSelectedStudent}
          selectedStudents={selectedStudents}
          students={students}
        />
        { showSpotlightListDialog &&
          <SpotlightStudentListDialog
            anonymous={anonymous}
            currentActivity={currentActivity}
            currentQuestion={currentQuestion}
            isAnonymous={isAnonymous}
            onCloseDialog={this.setShowSpotlightListDialog}
            onStudentSelect={this.toggleSelectedStudent}
            selectedStudents={selectedStudents}
            setAnonymous={setAnonymous}
          />
        }
        { showSpotlightDialog &&
          <SpotlightMessageDialog
            onCloseDialog={this.setShowSpotlightDialog}
          />
        }
      </div>
    );
  }

  private setShowSpotlightListDialog = (show: boolean) => {
    this.setState({ showSpotlightListDialog: show });
  }
  private setShowSpotlightDialog = (show: boolean) => {
    this.setState({ showSpotlightDialog: show });
  }

  private toggleSelectedStudent = (student: Map<any, any> ) => {
    const { selectedStudents } = this.state;
    const studentIndex = selectedStudents.findIndex((s: Map<any, any>) => s.get("id") === student.get("id"));
    const updatedSelectedStudents = [...selectedStudents];
    if (studentIndex >= 0) {
      updatedSelectedStudents.splice(studentIndex, 1);
    } else {
      updatedSelectedStudents.push(student);
    }
    this.setState({ selectedStudents: updatedSelectedStudents });
  }
}
