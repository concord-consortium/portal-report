import React from "react";
import { Map, List } from "immutable";
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
import { PopupQuestionAnswerList } from "./popup-question-answer-list";
import { Rubric } from "../feedback/rubric-utils";
import { ScoringSettings } from "../../../util/scoring";
import { SortOption } from "../../../reducers/dashboard-reducer";
import { LastRunHeader } from "../last-run-header";

import css from "../../../../css/portal-dashboard/response-details/response-details.less";

export interface SelectedStudent {
  id: string;
  colorGroup: number;
}

interface IProps {
  activities: List<any>;
  anonymous: boolean;
  answers: Map<any, any>;
  currentActivity?: Map<string, any>;
  currentQuestion?: Map<string, any>;
  currentStudentId: string | null;
  hasTeacherEdition: boolean;
  isAnonymous: boolean;
  compactReport: boolean;
  hideLastRun: boolean;
  listViewMode: ListViewMode;
  questions?: Map<string, any>;
  setAnonymous: (value: boolean) => void;
  setCurrentActivity: (activityId: string) => void;
  setCurrentQuestion: (questionId: string) => void;
  setCurrentStudent: (studentId: string | null) => void;
  setListViewMode: (mode: ListViewMode) => void;
  setStudentFeedbackSort: (value: string) => void;
  setStudentFilter: (value: string) => void;
  sortByMethod: SortOption;
  sortedQuestionIds?: string[];
  studentCount: number;
  students: any;
  toggleCurrentQuestion: (questionId: string) => void;
  viewMode: DashboardViewMode;
  trackEvent: TrackEventFunction;
  rubric: Rubric;
  rubricDocUrl: string;
  feedbackLevel: FeedbackLevel;
  setFeedbackLevel: (feedbackLevel: FeedbackLevel) => void;
  scoringSettings: ScoringSettings;
  isResearcher: boolean;
}
interface IState {
  selectedStudents: SelectedStudent[];
  showSpotlightDialog: boolean;
  showSpotlightListDialog: boolean;
}

export class ResponseDetails extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      selectedStudents: [],
      showSpotlightDialog: false,
      showSpotlightListDialog: false
    };
  }

  render() {
    const { activities, anonymous, answers, currentActivity, currentStudentId, currentQuestion, hasTeacherEdition, isAnonymous,
      listViewMode, questions, setAnonymous, setCurrentActivity, setCurrentQuestion, setListViewMode,
      setStudentFilter, sortByMethod, sortedQuestionIds, studentCount, students, trackEvent, viewMode,
      feedbackLevel, scoringSettings, setFeedbackLevel, rubric, rubricDocUrl, isResearcher, compactReport, hideLastRun } = this.props;

    const { selectedStudents, showSpotlightDialog, showSpotlightListDialog } = this.state;

    const firstActivity = activities.first();
    const currentStudentIndex = students.findIndex((s: any) => s.get("id") === currentStudentId);
    const isSequence = activities.size > 1;

    const activityId = currentActivity ? currentActivity.get("id") : firstActivity.get("id");
    const currentActivityWithQuestions = activities.find((activity: any) => activity.get("id") === activityId);
    const firstQuestion = currentActivityWithQuestions.get("questions").first();
    const showLastRunColumn = !hideLastRun && listViewMode !== "Question";

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
            isSpotlightOn={selectedStudents.length > 0}
            listViewMode={listViewMode}
            onShowDialog={selectedStudents.length > 0 ? this.setShowSpotlightListDialog : this.setShowSpotlightDialog}
            questionCount={qCount}
            setAnonymous={setAnonymous}
            setListViewMode={setListViewMode}
            setStudentSort={setStudentFilter}
            sortByMethod={sortByMethod}
            studentCount={studentCount}
            trackEvent={trackEvent}
            viewMode={viewMode}
            setFeedbackLevel={setFeedbackLevel}
            isResearcher={isResearcher}
          />
          {showLastRunColumn && <LastRunHeader />}
          <div className={`${css.responsePanel}`} data-cy="response-panel">
            { isSequence || feedbackLevel === "Activity"
              ? <ActivityNavigator
                  activities={activities}
                  currentActivity={currentActivity}
                  isSequence={isSequence}
                  setCurrentActivity={this.handleChangeActivity}
                  setCurrentQuestion={setCurrentQuestion}
               />
              : ""
            }
            <div className={`${css.contentNavigatorArea} ${isSequence ? css.short : ""}`}>
            { listViewMode === "Question"
              ? <StudentNavigator
                  students={students}
                  isAnonymous={isAnonymous}
                  currentStudentIndex={currentStudentIndex >= 0 ? currentStudentIndex : 0}
                  setCurrentStudent={this.handleChangeStudent}
                  currentStudentId={currentStudentId}
                  nameFirst={false}
                />
              : ((feedbackLevel === "Question" && viewMode === "FeedbackReport") || (viewMode === "ResponseDetails")) && <QuestionNavigator
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
                activity={currentActivityWithQuestions}
                feedbackLevel={feedbackLevel}
                setFeedbackLevel={this.props.setFeedbackLevel}
                listViewMode={listViewMode}
                scoringSettings={scoringSettings}
                rubric={rubric}
                rubricDocUrl={rubricDocUrl}
                trackEvent={trackEvent}
                isResearcher={isResearcher}
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
                hideLastRun={hideLastRun}
                isAnonymous={isAnonymous}
                isCompact={compactReport}
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
                  hideLastRun={hideLastRun}
                  isAnonymous={isAnonymous}
                  isCompact={compactReport}
                  listViewMode={listViewMode}
                  feedbackLevel={feedbackLevel}
                  isResearcher={isResearcher}
                />
              </div>
            : <div className={css.feedbackRowsContainer} data-cy="activity-feedback-panel">
                <ActivityFeedbackPanel
                  activity={currentActivityWithQuestions}
                  activities={activities}
                  currentStudentId={currentStudentId}
                  sortByMethod={sortByMethod}
                  isAnonymous={isAnonymous}
                  isCompact={compactReport}
                  hideLastRun={hideLastRun}
                  listViewMode={listViewMode}
                  scoringSettings={scoringSettings}
                  isResearcher={isResearcher}
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
                isResearcher={isResearcher}
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

  private handleChangeActivity = (activityId: string) => {
    this.props.setCurrentActivity(activityId);
    this.props.trackEvent("Portal-Dashboard", "ResponseDetailsChangeActivity", {label: activityId});
  }

  private handleChangeQuestion = (questionId: string) => {
    this.props.toggleCurrentQuestion(questionId);
    this.setState({ selectedStudents: [] });
    this.props.trackEvent("Portal-Dashboard", "ResponseDetailsChangeQuestion", {label: questionId});
  }

  private handleChangeStudent = (studentId: string) => {
    this.props.setCurrentStudent(studentId);
    this.props.trackEvent("Portal-Dashboard", "ResponseDetailsChangeStudent", {label: studentId});
  }

  private setShowSpotlightListDialog = (show: boolean) => {
    this.setState({ showSpotlightListDialog: show });
    this.props.trackEvent("Portal-Dashboard", "ToggleSpotlightStudents", {label: show.toString(), parameters: {
      show
    }});
  }

  private setShowSpotlightDialog = (show: boolean) => {
    this.setState({ showSpotlightDialog: show });
    this.props.trackEvent("Portal-Dashboard", "ToggleSpotlightStudentsInstructions", {label: show.toString(), parameters: {
      show
    }});
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

}
