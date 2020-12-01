import React from "react";
import { Map } from "immutable";
import { PopupHeader } from "./popup-header";
import { PopupClassNav } from "./popup-class-nav";
import { QuestionNavigator } from "../question-navigator";
import { PopupStudentResponseList } from "./popup-student-response-list";
import { SpotlightMessageDialog } from "./spotlight-message-dialog";
import { SpotlightStudentListDialog, spotlightColors } from "./spotlight-student-list-dialog";
import { TransitionGroup, CSSTransition } from "react-transition-group";

import css from "../../../../css/portal-dashboard/all-responses-popup/student-responses-popup.less";

export interface SelectedStudent {
  id: string;
  colorGroup: number;
}

interface IProps {
  anonymous: boolean;
  answers: Map<any, any>;
  currentActivity?: Map<string, any>;
  currentQuestion?: Map<string, any>;
  hasTeacherEdition: boolean;
  isAnonymous: boolean;
  onClose: (show: boolean) => void;
  questions?: Map<string, any>;
  setAnonymous: (value: boolean) => void;
  setCurrentActivity: (activityId: string) => void;
  setStudentFilter: (value: string) => void;
  sortByMethod: string;
  sortedQuestionIds?: string[];
  studentCount: number;
  students: any;
  toggleCurrentQuestion: (questionId: string) => void;
  trackEvent: (category: string, action: string, label: string) => void;
  questionFeedbacks?: Map<any, any>;
  questionFeedbackSettings?: Map<any, any>;
  updateActivityFeedback: (activityId: string, activityIndex: number, platformStudentId: string, feedback: any) => void;
  updateActivityFeedbackSettings: (activityId: string, activityIndex: number, feedbackFlags: any) => void;
  updateQuestionFeedback: (answerId: string, feedback: any) => void;
  updateQuestionFeedbackSettings: (embeddableKey: string, feedbackFlags: any) => void;
}
interface IState {
  selectedStudents: SelectedStudent[];
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
    const { anonymous, answers, currentActivity, currentQuestion, hasTeacherEdition, isAnonymous, onClose, questions,
      setAnonymous, setCurrentActivity, setStudentFilter, sortByMethod, sortedQuestionIds, studentCount, students,
      trackEvent } = this.props;
    const { selectedStudents, showSpotlightDialog, showSpotlightListDialog } = this.state;
    // TODO: FEEDBACK
    // get feedback values and functions from props and pass them to a new
    // component which renders the feedback content within this view
    return (
      <div className={css.popup} data-cy="all-responses-popup-view">
        <PopupHeader currentActivity={currentActivity} onCloseSelect={onClose} />
        <div className={css.tableHeader}>
          <PopupClassNav
            anonymous={anonymous}
            isSpotlightOn={selectedStudents.length > 0}
            studentCount={studentCount}
            setAnonymous={setAnonymous}
            setStudentSort={setStudentFilter}
            sortByMethod={sortByMethod}
            trackEvent={trackEvent}
            onShowDialog={selectedStudents.length > 0 ? this.setShowSpotlightListDialog : this.setShowSpotlightDialog}
          />
          <div className={`${css.questionArea} ${css.column}`} data-cy="questionArea">
            <QuestionNavigator
              currentActivity={currentActivity}
              currentQuestion={currentQuestion}
              questions={questions}
              sortedQuestionIds={sortedQuestionIds}
              toggleCurrentQuestion={this.handleChangeQuestion}
              setCurrentActivity={setCurrentActivity}
              hasTeacherEdition={hasTeacherEdition}
            />
          </div>
        </div>
        <PopupStudentResponseList
          answers={answers}
          currentQuestion={currentQuestion}
          isAnonymous={isAnonymous}
          onStudentSelect={this.toggleSelectedStudent}
          selectedStudents={selectedStudents}
          students={students}
        />
        <TransitionGroup>
          {showSpotlightListDialog &&
            <CSSTransition in={showSpotlightListDialog} classNames={"spotlightListDialog"} timeout={500}>
              <SpotlightStudentListDialog
                anonymous={anonymous}
                currentActivity={currentActivity}
                currentQuestion={currentQuestion}
                isAnonymous={isAnonymous}
                onCloseDialog={this.setShowSpotlightListDialog}
                onSpotlightColorSelect={this.handleChangeColorGroup}
                onStudentSelect={this.toggleSelectedStudent}
                selectedStudents={selectedStudents}
                setAnonymous={setAnonymous}
                students={students}
              />
            </CSSTransition>
          }
        </TransitionGroup>
        { showSpotlightDialog &&
          <SpotlightMessageDialog
            onCloseDialog={this.setShowSpotlightDialog}
          />
        }
      </div>
    );
  }

  private handleChangeColorGroup = (studentId: string) => {
    const { selectedStudents } = this.state;
    const index = selectedStudents.findIndex((s: SelectedStudent) => s.id === studentId);
    if (index >= 0) {
      const currentColor = selectedStudents[index].colorGroup;
      const newColor = currentColor >= spotlightColors.length - 1 ? 0 : currentColor + 1;
      const updatedSelectedStudents = selectedStudents.map(s => {
        return (s.id === studentId) ? { id: studentId, colorGroup: newColor } : s;
      });
      this.setState({ selectedStudents: updatedSelectedStudents });
    }
  }

  private handleChangeQuestion = (questionId: string) => {
    this.props.toggleCurrentQuestion(questionId);
    this.setState({ selectedStudents: [] });
  }

  private setShowSpotlightListDialog = (show: boolean) => {
    this.setState({ showSpotlightListDialog: show });
  }
  private setShowSpotlightDialog = (show: boolean) => {
    this.setState({ showSpotlightDialog: show });
  }

  private toggleSelectedStudent = (studentId: string) => {
    const { selectedStudents } = this.state;
    const index = selectedStudents.findIndex((s: SelectedStudent) => s.id === studentId);
    const updatedSelectedStudents = [...selectedStudents];
    if (index >= 0) {
      updatedSelectedStudents.splice(index, 1);
    } else {
      const newStudent: SelectedStudent = { id: studentId, colorGroup: 0 };
      updatedSelectedStudents.push(newStudent);
    }
    this.setState({ selectedStudents: updatedSelectedStudents });
  }
}
