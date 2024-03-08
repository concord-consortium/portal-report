import React from "react";
import { List, Map } from "immutable";
import { connect } from "react-redux";
import { fetchAndObserveData, trackEvent, setAnonymous, TrackEventFunction, TrackEventFunctionOptions, TrackEventCategory, setExtraEventLoggingParameters } from "../../actions/index";
import { getSortedStudents, getCurrentActivity, getCurrentQuestion, getCurrentStudentId, getDashboardFeedbackSortBy,
         getStudentProgress, getCompactReport, getAnonymous, getDashboardSortBy, getHideFeedbackBadges
       } from "../../selectors/dashboard-selectors";
import { Header } from "../../components/portal-dashboard/header";
import { ClassNav } from "../../components/portal-dashboard/class-nav";
import { LevelViewer } from "../../components/portal-dashboard/level-viewer";
import { StudentNames } from "../../components/portal-dashboard/student-names";
import { StudentAnswers } from "../../components/portal-dashboard/student-answers";
import LoadingIcon from "../../components/report/loading-icon";
import DataFetchError from "../../components/report/data-fetch-error";
import { getSequenceTree, getAnswersByQuestion } from "../../selectors/report-tree";
import { IResponse } from "../../api";
import { setStudentSort, setCurrentActivity, setCurrentQuestion, setCurrentStudent, setStudentFeedbackSort,
         toggleCurrentActivity, toggleCurrentQuestion, setCompactReport, setHideFeedbackBadges } from "../../actions/dashboard";
import { RootState } from "../../reducers";
import { QuestionOverlay } from "../../components/portal-dashboard/question-overlay";
import { ResponseDetails } from "../../components/portal-dashboard/response-details/response-details";
import { ColorTheme, DashboardViewMode, FeedbackLevel, ListViewMode } from "../../util/misc";
import { ScoringSettings, getScoredQuestions, getScoringSettings, getScoringSettingsInState } from "../../util/scoring";
import { computeRubricMaxScore } from "../../selectors/activity-feedback-selectors";
import { Rubric } from "../../components/portal-dashboard/feedback/rubric-utils";

import css from "../../../css/portal-dashboard/portal-dashboard-app.less";

interface IProps {
  // from mapStateToProps
  activityFeedbacks: Map<any, any>;
  anonymous: boolean;
  answers: Map<any, any>;
  clazzName: string;
  compactReport: boolean;
  currentActivity?: Map<string, any>;
  currentQuestion?: Map<string, any>;
  currentStudentId: string | null;
  error: IResponse;
  expandedActivities: Map<any, any>;
  feedback: any;
  hasTeacherEdition: boolean;
  isFetching: boolean;
  questions?: Map<string, any>;
  questionFeedbacks: Map<any, any>;
  report: any;
  sequenceTree: Map<any, any>;
  hideFeedbackBadges: boolean;
  sortByMethod: string;
  feedbackSortByMethod: string;
  studentCount: number;
  studentProgress: Map<any, any>;
  students: any;
  sortedQuestionIds?: string[];
  scoringSettings: ScoringSettings;
  // from mapDispatchToProps
  fetchAndObserveData: () => void;
  setAnonymous: (value: boolean) => void;
  setCompactReport: (value: boolean) => void;
  setHideFeedbackBadges: (value: boolean) => void;
  setStudentSort: (value: string) => void;
  setStudentFeedbackSort: (value: string) => void;
  setCurrentActivity: (activityId: string) => void;
  setCurrentQuestion: (questionId: string) => void;
  setCurrentStudent: (studentId: string) => void;
  toggleCurrentActivity: (activityId: string) => void;
  toggleCurrentQuestion: (questionId: string) => void;
  trackEvent: TrackEventFunction;
  userName: string;
  viewMode: DashboardViewMode;
  rubric: Rubric;
  rubricMaxScore: number;
}

interface IState {
  initialLoading: boolean;
  scrollLeft: number;
  viewMode: DashboardViewMode;
  listViewMode: ListViewMode;
  feedbackLevel: FeedbackLevel;
}

class PortalDashboardApp extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      initialLoading: true,
      scrollLeft: 0,
      viewMode: "ProgressDashboard",
      listViewMode: "Student",
      feedbackLevel: "Activity"
    };
  }

  componentDidMount() {
    const { fetchAndObserveData } = this.props;
    fetchAndObserveData();
    document.title = "Class Dashboard";
  }

  componentDidUpdate(prevProps: IProps) {
    const { initialLoading } = this.state;
    const { isFetching } = this.props;
    if (initialLoading && !isFetching && prevProps.isFetching) {
      this.setState({ initialLoading: false });
    }
  }

  render() {
    const { activityFeedbacks, anonymous, answers, clazzName, compactReport, currentActivity, currentQuestion, currentStudentId,
      error, report, sequenceTree, setAnonymous, setStudentSort, studentProgress, students, sortedQuestionIds, questions,
      expandedActivities, setCurrentActivity, setCurrentQuestion, setCurrentStudent, sortByMethod, toggleCurrentActivity,
      toggleCurrentQuestion, trackEvent, hasTeacherEdition, questionFeedbacks, hideFeedbackBadges, feedbackSortByMethod,
      setStudentFeedbackSort, scoringSettings, rubric, rubricMaxScore } = this.props;
    const { initialLoading, viewMode, listViewMode, feedbackLevel } = this.state;
    const isAnonymous = report ? report.get("anonymous") : true;
    // In order to list the activities in the correct order,
    // they must be obtained via the child reference in the sequenceTree …
    const activityTrees: List<any> | false = sequenceTree && sequenceTree.get("children");
    let assignmentName: string;

    if (sequenceTree && sequenceTree.get("name") !== "") {
      assignmentName = sequenceTree.get("name");
    }
    else {
      assignmentName = activityTrees && activityTrees.first().get("name");
    }

    setExtraEventLoggingParameters({
      className: clazzName,
      sequenceName: assignmentName,
      currentActivityName: currentActivity?.get("name")
    });

    const trackSetAnonymous = (value: boolean) => {
      trackEvent("Portal-Dashboard", "SetAnonymous", {label: value.toString()});
      setAnonymous(value);
    };

    return (
      <div className={css.portalDashboardApp}>

        {this.renderHeader(assignmentName, viewMode )}
        {activityTrees &&
          ( viewMode === "ProgressDashboard"
            ? <div>
              <div className={css.navigation}>
                <ClassNav
                  anonymous={anonymous}
                  clazzName={clazzName}
                  setAnonymous={trackSetAnonymous}
                  setStudentSort={setStudentSort}
                  sortByMethod={sortByMethod}
                  studentCount={students.size}
                  trackEvent={trackEvent}
                  viewMode={viewMode}
                />
                <LevelViewer
                  activities={activityTrees}
                  currentActivity={currentActivity}
                  currentQuestion={currentQuestion}
                  hideFeedbackBadges={hideFeedbackBadges}
                  leftPosition={this.state.scrollLeft}
                  studentProgress={studentProgress}
                  toggleCurrentActivity={toggleCurrentActivity}
                  toggleCurrentQuestion={toggleCurrentQuestion}
                  trackEvent={trackEvent}
                  scoringSettings={scoringSettings}
                  jumpToActivityFeedback={this.handleJumpToActivityFeedback}
                />
              </div>
              <div className={css.progressTable} onScroll={this.handleScroll} data-cy="progress-table">
                <StudentNames
                  students={students}
                  isAnonymous={isAnonymous}
                  isCompact={compactReport}
                  setCurrentStudent={setCurrentStudent}
                  setDashboardViewMode={this.setDashboardViewMode}
                  setListViewMode={this.setListViewMode}
                  trackEvent={trackEvent}
                />
                <StudentAnswers
                  activities={activityTrees}
                  activityFeedbacks={activityFeedbacks}
                  answers={answers}
                  currentActivity={currentActivity}
                  currentQuestion={currentQuestion}
                  currentStudentId={currentStudentId}
                  expandedActivities={expandedActivities}
                  hideFeedbackBadges={hideFeedbackBadges}
                  isCompact={compactReport}
                  questionFeedbacks={questionFeedbacks}
                  rubric={rubric}
                  setCurrentActivity={setCurrentActivity}
                  setCurrentQuestion={setCurrentQuestion}
                  setCurrentStudent={setCurrentStudent}
                  students={students}
                  studentProgress={studentProgress}
                  trackEvent={trackEvent}
                  scoringSettings={scoringSettings}
                  rubricMaxScore={rubricMaxScore}
                />
              </div>
              <QuestionOverlay
                currentActivity={currentActivity}
                currentQuestion={currentQuestion}
                currentStudentId={currentStudentId}
                setDashboardViewMode={this.setDashboardViewMode}
                isAnonymous={isAnonymous}
                questions={questions}
                setCurrentActivity={setCurrentActivity}
                setCurrentStudent={setCurrentStudent}
                setListViewMode={this.setListViewMode}
                sortedQuestionIds={sortedQuestionIds}
                students={students}
                toggleCurrentQuestion={toggleCurrentQuestion}
                hasTeacherEdition={hasTeacherEdition}
                trackEvent={trackEvent}
              />
            </div>
            : <div className={css.responseDetails} data-cy="response-details-container">
                <ResponseDetails
                  activities={activityTrees}
                  anonymous={anonymous}
                  answers={answers}
                  currentActivity={currentActivity}
                  currentQuestion={currentQuestion}
                  currentStudentId={currentStudentId}
                  feedbackSortByMethod={feedbackSortByMethod}
                  hasTeacherEdition={hasTeacherEdition}
                  isAnonymous={isAnonymous}
                  listViewMode={listViewMode}
                  questions={questions}
                  setAnonymous={trackSetAnonymous}
                  setCurrentActivity={setCurrentActivity}
                  setCurrentQuestion={setCurrentQuestion}
                  setCurrentStudent={setCurrentStudent}
                  setListViewMode={this.setListViewMode}
                  setStudentFeebackFilter={setStudentFeedbackSort}
                  setStudentFilter={setStudentSort}
                  sortByMethod={sortByMethod}
                  sortedQuestionIds={sortedQuestionIds}
                  studentCount={students.size}
                  students={students}
                  toggleCurrentQuestion={toggleCurrentQuestion}
                  trackEvent={trackEvent}
                  viewMode={viewMode}
                  rubric={rubric}
                  feedbackLevel={feedbackLevel}
                  setFeedbackLevel={this.setFeedbackLevel}
                  scoringSettings={scoringSettings}
                />
            </div>
          )
        }
        {error && <DataFetchError error={error} />}
        {initialLoading && <LoadingIcon />}
      </div>
    );
  }

  private renderHeader = (assignmentName: string, headerViewMode: DashboardViewMode) => {
    const { sequenceTree, userName, setCompactReport, setHideFeedbackBadges, trackEvent } = this.props;
    const { viewMode} = this.state;
    const color: ColorTheme = headerViewMode === "ProgressDashboard"
      ? "progress"
      : headerViewMode === "ResponseDetails" ? "response" : "feedback";

    return (
      sequenceTree &&
        <Header
          userName={userName}
          setCompact={headerViewMode === "ProgressDashboard" ? setCompactReport : undefined}
          setHideFeedbackBadges={headerViewMode === "ProgressDashboard" ? setHideFeedbackBadges : undefined}
          assignmentName={assignmentName}
          trackEvent={trackEvent}
          setDashboardViewMode={this.setDashboardViewMode}
          viewMode={viewMode}
          colorTheme={color}
        />
    );
  }

  private setDashboardViewMode = (mode: DashboardViewMode) => {
    this.setState({ viewMode: mode });
  }

  private setListViewMode = (value: ListViewMode) => {
    this.setState({ listViewMode: value });
  }

  private handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const element = e.target as HTMLElement;
    if (element && element.scrollLeft != null) {
      this.setState({ scrollLeft: -1 * element.scrollLeft });
    }
  }

  private setFeedbackLevel = (feedbackLevel: FeedbackLevel) => {
    this.setState({ feedbackLevel });
  }

  private handleJumpToActivityFeedback = () => {
    this.setState({ viewMode: "FeedbackReport", feedbackLevel: "Activity"});
  }
}

function mapStateToProps(state: RootState): Partial<IProps> {
  const answers = getAnswersByQuestion(state);
  const data = state.get("data");
  const error = data.get("error");
  const reportState = state.get("report");
  const dataDownloaded = !error && !data.get("isFetching");
  const questions = dataDownloaded ? state.getIn(["report", "questions"]) : undefined;
  const activities = dataDownloaded ? state.getIn(["report", "activities"]) : undefined;
  const currentActivity = getCurrentActivity(state);
  const scoredActivityId = currentActivity?.get("id") ?? activities?.first()?.get("id");
  const sequenceTree = dataDownloaded && getSequenceTree(state);
  const activityTrees = sequenceTree && sequenceTree.get("children");
  const scoredActivity = activityTrees && activityTrees.find((activity: any) => activity.get("id") === scoredActivityId);
  const initialScoringSettings = scoredActivityId && getScoringSettingsInState(state, scoredActivityId);
  const rubric = state.getIn(["feedback", "settings"]).get("rubric")?.toJS();
  const scoringSettings = getScoringSettings(initialScoringSettings, {
    rubric,
    hasScoredQuestions: scoredActivity ? getScoredQuestions(scoredActivity).size > 0 : false,
  });

  let sortedQuestionIds;
  if (questions && activities) {
    sortedQuestionIds = questions.keySeq().toArray().sort((q1Id: string, q2Id: string) => {
      const question1 = questions.get(q1Id);
      const question2 = questions.get(q2Id);
      const act1 = question1.get("activity");
      const act2 = question2.get("activity");
      if (act1 !== act2) {
        return (activities.get(act1).get("activityIndex") - activities.get(act2).get("activityIndex"));
      } else {
        return question1.get("questionNumber") - question2.get("questionNumber");
      }
    });
  }

  return {
    activityFeedbacks: state.getIn(["feedback", "activityFeedbacks"]),
    anonymous: getAnonymous(state),
    answers,
    clazzName: dataDownloaded ? state.getIn(["report", "clazzName"]) : undefined,
    compactReport: getCompactReport(state),
    currentActivity,
    currentQuestion: getCurrentQuestion(state),
    currentStudentId: getCurrentStudentId(state),
    error,
    expandedActivities: state.getIn(["dashboard", "expandedActivities"]),
    feedback: state.getIn(["feedback", "settings"]),
    feedbackSortByMethod: getDashboardFeedbackSortBy(state),
    hasTeacherEdition: dataDownloaded ? state.getIn(["report", "hasTeacherEdition"]) : undefined,
    isFetching: data.get("isFetching"),
    questionFeedbacks: state.getIn(["feedback", "questionFeedbacks"]),
    questions,
    report: dataDownloaded && reportState,
    sequenceTree,
    hideFeedbackBadges: getHideFeedbackBadges(state),
    sortByMethod: getDashboardSortBy(state),
    sortedQuestionIds,
    students: dataDownloaded && getSortedStudents(state),
    studentProgress: dataDownloaded && getStudentProgress(state),
    userName: dataDownloaded ? state.getIn(["report", "platformUserName"]) : undefined,
    scoringSettings,
    rubric,
    rubricMaxScore: computeRubricMaxScore(rubric)
  };
}

const mapDispatchToProps = (dispatch: any, ownProps: any): Partial<IProps> => {
  return {
    fetchAndObserveData: () => dispatch(fetchAndObserveData()),
    setAnonymous: (value: boolean) => dispatch(setAnonymous(value)),
    setCompactReport: (value: boolean) => dispatch(setCompactReport(value)),
    setHideFeedbackBadges: (value: boolean) => dispatch(setHideFeedbackBadges(value)),
    setStudentSort: (value: string) => dispatch(setStudentSort(value)),
    setStudentFeedbackSort: (value: string) => dispatch(setStudentFeedbackSort(value)),
    setCurrentActivity: (activityId: string) => dispatch(setCurrentActivity(activityId)),
    setCurrentStudent: (studentId: string) => dispatch(setCurrentStudent(studentId)),
    setCurrentQuestion: (questionId: string) => dispatch(setCurrentQuestion(questionId)),
    toggleCurrentActivity: (activityId: string) => dispatch(toggleCurrentActivity(activityId)),
    toggleCurrentQuestion: (questionId: string) => dispatch(toggleCurrentQuestion(questionId)),
    trackEvent: (category: TrackEventCategory, action: string, options?: TrackEventFunctionOptions) => dispatch(trackEvent(category, action, options)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PortalDashboardApp);
