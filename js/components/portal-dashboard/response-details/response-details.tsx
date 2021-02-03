import React from "react";
import { Map } from "immutable";
import PopupClassNav from "../../../containers/portal-dashboard/popup-class-nav";
import { QuestionNavigator } from "../question-navigator";
import { PopupStudentResponseList } from "./popup-all-student-response-list";
import { SpotlightMessageDialog } from "./spotlight-message-dialog";
import { SpotlightStudentListDialog, spotlightColors } from "./spotlight-student-list-dialog";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { FeedbackInfo } from "../../../containers/portal-dashboard/feedback/feedback-info";
import ActivityFeedbackPanel from "../../../containers/portal-dashboard/feedback/activity-feedback-panel";
import QuestionFeedbackPanel from "../../../containers/portal-dashboard/feedback/question-feedback-panel";
import { StudentNavigator } from "../student-navigator";
import { ActivityNavigator } from "../activity-navigator";
import { DashboardViewMode, ListViewMode, FeedbackLevel } from "../../../util/misc";
import { TrackEventFunction } from "../../../actions";

import css from "../../../../css/portal-dashboard/response-details/response-details.less";
import { PopupQuestionAnswerList } from "./popup-question-answer-list";

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
  feedbackSortByMethod: string;
  hasTeacherEdition: boolean;
  isAnonymous: boolean;
  listViewMode: ListViewMode;
  questions?: Map<string, any>;
  setAnonymous: (value: boolean) => void;
  setCurrentActivity: (activityId: string) => void;
  setCurrentQuestion: (questionId: string) => void;
  setCurrentStudent: (studentId: string | null) => void;
  setListViewMode: (mode: ListViewMode) => void;
  setStudentFeebackFilter: (value: string) => void;
  setStudentFilter: (value: string) => void;
  sortByMethod: string;
  sortedQuestionIds?: string[];
  studentCount: number;
  students: any;
  toggleCurrentQuestion: (questionId: string) => void;
  viewMode: DashboardViewMode;
  trackEvent: TrackEventFunction;
}
interface IState {
  selectedStudents: SelectedStudent[];
  showSpotlightDialog: boolean;
  showSpotlightListDialog: boolean;
  feedbackLevel: FeedbackLevel;
}

export class ResponseDetails extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      selectedStudents: [],
      showSpotlightDialog: false,
      showSpotlightListDialog: false,
      feedbackLevel: "Question"
    };
  }

  render() {
    const { activities, anonymous, answers, currentActivity, currentStudentId, currentQuestion, hasTeacherEdition, isAnonymous,
      listViewMode, questions, setAnonymous, setCurrentActivity, setCurrentQuestion, setCurrentStudent, setListViewMode,
      setStudentFilter, sortByMethod, sortedQuestionIds, studentCount, students, trackEvent, viewMode,
      feedbackSortByMethod, setStudentFeebackFilter } = this.props;

    const { selectedStudents, showSpotlightDialog, showSpotlightListDialog, feedbackLevel } = this.state;

    const firstActivity = activities.first();
    const firstQuestion = questions?.first();
    const currentStudentIndex = students.findIndex((s: any) => s.get("id") === currentStudentId);
    const isSequence = activities.size > 1;

    const activityId = currentActivity ? currentActivity.get("id") : firstActivity.get("id");
    const currentActivityWithQuestions = activities.find(activity => activity.get("id") === activityId);
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
            activity={currentActivityWithQuestions}
            anonymous={anonymous}
            answers={answers}
            currentQuestion={currentQuestion || firstQuestion}
            feedbackLevel={feedbackLevel}
            feedbackSortByMethod={feedbackSortByMethod}
            isSpotlightOn={selectedStudents.length > 0}
            listViewMode={listViewMode}
            onShowDialog={selectedStudents.length > 0 ? this.setShowSpotlightListDialog : this.setShowSpotlightDialog}
            questionCount={qCount}
            setAnonymous={setAnonymous}
            setListViewMode={setListViewMode}
            setStudentFeedbackSort={setStudentFeebackFilter}
            setStudentSort={setStudentFilter}
            sortByMethod={sortByMethod}
            studentCount={studentCount}
            trackEvent={trackEvent}
            viewMode={viewMode}
          />
          <div className={`${css.responsePanel}`} data-cy="response-panel">
            { isSequence || feedbackLevel === "Activity"
              ? <ActivityNavigator
                  activities={activities}
                  currentActivity={currentActivity}
                  isSequence={isSequence}
                  setCurrentActivity={setCurrentActivity}
                  setCurrentQuestion={setCurrentQuestion}
               />
              : ""
            }
            <div className={`${css.contentNavigatorArea} ${isSequence ? css.short : ""}`}>
            { listViewMode === "Question"
              ? <StudentNavigator
                  students={students}
                  isAnonymous={isAnonymous}
                  currentStudentIndex={currentStudentIndex>=0 ? currentStudentIndex : 0}
                  setCurrentStudent={setCurrentStudent}
                  currentStudentId={currentStudentId}
                  nameFirst={false}
                />
              : feedbackLevel === "Question" &&
                <QuestionNavigator
                  currentQuestion={currentQuestion || firstQuestion}
                  questions={questions}
                  sortedQuestionIds={sortedQuestionIds}
                  toggleCurrentQuestion={this.handleChangeQuestion}
                  setCurrentActivity={setCurrentActivity}
                  hasTeacherEdition={hasTeacherEdition}
                  trackEvent={trackEvent}
                />
            }
            </div>
          </div>
          { viewMode === "FeedbackReport" &&
            <div className={css.feedbackInfo} data-cy="feedback-info">
              <FeedbackInfo
                feedbackLevel={feedbackLevel}
                setFeedbackLevel={this.setFeedbackLevel}
                listViewMode={listViewMode}
              />
            </div>
          }
        </div>
        { viewMode !== "FeedbackReport"
          ? listViewMode === "Question"
            ? <PopupQuestionAnswerList
                activities={activities}
                currentActivity={currentActivityWithQuestions}
                currentStudentId={currentStudentId}
                students={students}
                trackEvent={trackEvent}
              />
            : <PopupStudentResponseList
                answers={answers}
                currentQuestion={currentQuestion || firstQuestion}
                isAnonymous={isAnonymous}
                onStudentSelect={this.toggleSelectedStudent}
                selectedStudents={selectedStudents}
                students={students}
                trackEvent={trackEvent}
              />
          : feedbackLevel === "Question"
            ? <div className={css.feedbackRowsContainer} data-cy="activity-feedback-panel">
                <QuestionFeedbackPanel
                  activity={currentActivityWithQuestions}
                  answers={answers}
                  currentQuestion={currentQuestion || firstQuestion}
                  currentStudentId={currentStudentId}
                  isAnonymous={isAnonymous}
                  listViewMode={listViewMode}
                  feedbackLevel={feedbackLevel}
                  students={students}
                />
              </div>
            : <div className={css.feedbackRowsContainer} data-cy="activity-feedback-panel">
                <ActivityFeedbackPanel
                  activity={currentActivityWithQuestions}
                  activities={activities}
                  currentStudentId={currentStudentId}
                  feedbackSortByMethod={feedbackSortByMethod}
                  isAnonymous={isAnonymous}
                  listViewMode={listViewMode}
                  students={students}
                />
              </div>
        }
        <TransitionGroup>
          { showSpotlightListDialog &&
            <CSSTransition in={showSpotlightListDialog} classNames={"spotlightListDialog"} timeout={500}>
              <SpotlightStudentListDialog
                anonymous={anonymous}
                currentActivity={currentActivityWithQuestions}
                currentQuestion={currentQuestion || firstQuestion}
                isAnonymous={isAnonymous}
                onCloseDialog={this.setShowSpotlightListDialog}
                onSpotlightColorSelect={this.handleChangeColorGroup}
                onStudentSelect={this.toggleSelectedStudent}
                selectedStudents={selectedStudents}
                setAnonymous={setAnonymous}
                students={students}
                trackEvent={trackEvent}
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
    this.props.trackEvent("Portal-Dashboard", "SelectStudentResponse", {parameters: {selectedStudents: updatedSelectedStudents.map(s => s.id)}});
  }

  private setFeedbackLevel = (feedbackLevel: FeedbackLevel) => {
    this.setState({ feedbackLevel });
  }
}
