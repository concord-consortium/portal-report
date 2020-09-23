import React from "react";
import { Map } from "immutable";
import { PopupHeader } from "./popup-header";
import { PopupClassNav } from "./popup-class-nav";
import { QuestionNavigator } from "../question-navigator";
import { PopupStudentResponseList } from "./popup-student-response-list";
import { NoStudentSelectedSpotlightDialog } from "./spotlight-dialog";
import { SpotlightStudentListDialog } from "./selected-student-list";

import css from "../../../../css/portal-dashboard/all-responses-popup/student-responses-popup.less";

interface IProps {
  anonymous: boolean;
  currentQuestion?: Map<string, any>;
  currentActivity?: Map<string, any>;
  handleCloseAllResponsesPopup: (show: boolean) => void;
  isAnonymous: boolean;
  questions?: Map<string, any>;
  setAnonymous: (value: boolean) => void;
  setCurrentActivity: (activityId: string) => void;
  setStudentFilter: (value: string) => void;
  sortedQuestionIds?: string[];
  studentCount: number;
  students: any;
  hasTeacherEdition: boolean;
  trackEvent: (category: string, action: string, label: string) => void;
  toggleCurrentQuestion: (questionId: string) => void;
}
interface IState {
  selectedStudents: any[];
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
    const { anonymous, students, isAnonymous, studentCount, setAnonymous, setStudentFilter, trackEvent, currentActivity,
      currentQuestion, questions, sortedQuestionIds, hasTeacherEdition, toggleCurrentQuestion, setCurrentActivity } = this.props;
    const { selectedStudents, showSpotlightDialog } = this.state;
    return (
      <div className={css.popup} data-cy="all-responses-popup-view">
        <PopupHeader currentActivity={currentActivity} handleCloseAllResponsesPopup={this.props.handleCloseAllResponsesPopup} />
        <div className={css.tableHeader}>
          <PopupClassNav
            anonymous={anonymous}
            isSpotlightOn={showSpotlightDialog && selectedStudents.length > 0}
            studentCount={studentCount}
            setAnonymous={setAnonymous}
            setStudentFilter={setStudentFilter}
            trackEvent={trackEvent}
            handleShowSpotlightDialog={this.setShowSpotlightDialog}
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
          students={students}
          isAnonymous={isAnonymous}
          currentQuestion={currentQuestion}
        />
        { showSpotlightDialog && (selectedStudents.length > 0
          ? <SpotlightStudentListDialog
              students={students}
              anonymous={anonymous}
              isAnonymous={isAnonymous}
              currentActivity={currentActivity}
              currentQuestion={currentQuestion}
              setAnonymous={setAnonymous}
              handleCloseSpotlightStudentListDialog={this.setShowSpotlightDialog}
            />
          : <NoStudentSelectedSpotlightDialog
              handleCloseNoStudentSelectedDialog={this.setShowSpotlightDialog}
            />)
        }
      </div>
    );
  }

  private setShowSpotlightDialog = (show: boolean) => {
    this.setState({ showSpotlightDialog: show });
  }
}
