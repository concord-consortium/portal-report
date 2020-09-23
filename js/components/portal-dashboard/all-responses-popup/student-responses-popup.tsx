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
}
export class StudentResponsePopup extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      selectedStudents: [],
      showSpotlightDialog: false
    };
  }
  render() {
    const { anonymous, currentActivity, currentQuestion, hasTeacherEdition, isAnonymous, onClose, questions,
            setAnonymous, setCurrentActivity, setStudentFilter, sortedQuestionIds, studentCount, students,
            toggleCurrentQuestion, trackEvent } = this.props;
    const { selectedStudents, showSpotlightDialog } = this.state;
    return (
      <div className={css.popup} data-cy="all-responses-popup-view">
        <PopupHeader currentActivity={currentActivity} onCloseSelect={onClose} />
        <div className={css.tableHeader}>
          <PopupClassNav
            anonymous={anonymous}
            isSpotlightOn={showSpotlightDialog && selectedStudents.length > 0}
            studentCount={studentCount}
            setAnonymous={setAnonymous}
            setStudentFilter={setStudentFilter}
            trackEvent={trackEvent}
            onShowDialog={this.showSpotlightDialog(true)}
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
        { showSpotlightDialog && (selectedStudents.length > 0
          ? <SpotlightStudentListDialog
              anonymous={anonymous}
              currentActivity={currentActivity}
              currentQuestion={currentQuestion}
              isAnonymous={isAnonymous}
              onCloseDialog={this.showSpotlightDialog(false)}
              onStudentSelect={this.toggleSelectedStudent}
              selectedStudents={selectedStudents}
              setAnonymous={setAnonymous}
            />
          : <SpotlightMessageDialog
              onCloseDialog={this.showSpotlightDialog(false)}
            />)
        }
      </div>
    );
  }

  private showSpotlightDialog = (show: boolean) => () => {
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
