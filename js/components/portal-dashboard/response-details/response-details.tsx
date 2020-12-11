import React from "react";
import { Map } from "immutable";
import { PopupClassNav } from "./popup-class-nav";
import { QuestionNavigator } from "../question-navigator";
import { PopupStudentResponseList } from "./popup-student-response-list";
import { SpotlightMessageDialog } from "./spotlight-message-dialog";
import { SpotlightStudentListDialog, spotlightColors } from "./spotlight-student-list-dialog";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { StudentNavigator } from "../student-navigator";

import css from "../../../../css/portal-dashboard/response-details/response-details.less";

export interface SelectedStudent {
  id: string;
  colorGroup: number;
}

interface IProps {
  activities: Map<any, any>;
  anonymous: boolean;
  answers: Map<any, any>;
  currentActivity?: Map<string, any>;
  currentQuestion?: Map<string, any>;
  currentStudentId: string | null;
  hasTeacherEdition: boolean;
  isAnonymous: boolean;
  questions?: Map<string, any>;
  setAnonymous: (value: boolean) => void;
  setCurrentActivity: (activityId: string) => void;
  setCurrentStudent: (studentId: string | null) => void;
  setStudentFilter: (value: string) => void;
  sortByMethod: string;
  sortedQuestionIds?: string[];
  studentCount: number;
  students: any;
  toggleCurrentQuestion: (questionId: string) => void;
  trackEvent: (category: string, action: string, label: string) => void;
}
interface IState {
  inQuestionMode: boolean;
  selectedStudents: SelectedStudent[];
  showSpotlightDialog: boolean;
  showSpotlightListDialog: boolean;
}

export class ResponseDetails extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      inQuestionMode: false,
      selectedStudents: [],
      showSpotlightDialog: false,
      showSpotlightListDialog: false,
    };
  }
  render() {
    const { activities, anonymous, answers, currentActivity, currentStudentId, currentQuestion, hasTeacherEdition, isAnonymous, questions,
      setAnonymous, setCurrentActivity, setCurrentStudent, setStudentFilter, sortByMethod, sortedQuestionIds, studentCount, students,
      trackEvent } = this.props;
    const { selectedStudents, showSpotlightDialog, showSpotlightListDialog, inQuestionMode } = this.state;
    // TODO: FEEDBACK
    // if feedback is on, show the QuestionFeedbackPanel or the Activity FeedbackPanel
    const firstActivity = activities.first();
    const firstQuestion = questions?.first();
    const currentStudentIndex = students.findIndex((s: any) => s.get("id") === currentStudentId);

    const activityId = currentActivity ? currentActivity.get("id") : firstActivity.get("id");
    let qCount = 0;
    activities.toArray().forEach((activity: Map<any, any>) => {
      if (activityId === activity.get("id")) {
        const questions = activity.get("questions");
        qCount = questions.count();
      }
    });

    return (
      <>
        <div className={css.tableHeader}>
          <PopupClassNav
            anonymous={anonymous}
            isSpotlightOn={selectedStudents.length > 0}
            inQuestionMode={inQuestionMode}
            questionCount={qCount}
            studentCount={studentCount}
            setAnonymous={setAnonymous}
            setStudentSort={setStudentFilter}
            sortByMethod={sortByMethod}
            trackEvent={trackEvent}
            onShowDialog={selectedStudents.length > 0 ? this.setShowSpotlightListDialog : this.setShowSpotlightDialog}
            setListViewMode={this.setListViewMode}
          />
          <div className={`${css.questionArea} ${css.column}`} data-cy="questionArea">
            { inQuestionMode ?
              <StudentNavigator students={students}
                                isAnonymous={isAnonymous}
                                currentStudentIndex={currentStudentIndex>=0? currentStudentIndex : 0}
                                setCurrentStudent={setCurrentStudent}
                                currentStudentId={currentStudentId}
                                inResponseDetail={true}
              />
            : <QuestionNavigator
                currentActivity={currentActivity || firstActivity}
                currentQuestion={currentQuestion || firstQuestion}
                questions={questions}
                sortedQuestionIds={sortedQuestionIds}
                toggleCurrentQuestion={this.handleChangeQuestion}
                setCurrentActivity={setCurrentActivity}
                hasTeacherEdition={hasTeacherEdition}
              />
  }
          </div>
        </div>
        <PopupStudentResponseList
          answers={answers}
          currentQuestion={currentQuestion || firstQuestion}
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
                currentActivity={currentActivity || firstActivity}
                currentQuestion={currentQuestion || firstQuestion}
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
      </>
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

  private setListViewMode = (value: boolean) => () => {
    this.setState({
      inQuestionMode: value
    });
  }

}
