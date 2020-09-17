import React from "react";
import { Map } from "immutable";
import { connect } from "react-redux";
import { fetchAndObserveData, trackEvent, setAnonymous } from "../../actions/index";
import { getSortedStudents, getCurrentActivity, getCurrentQuestion, getCurrentStudentId,
        getStudentProgress, getCompactReport, getAnonymous } from "../../selectors/dashboard-selectors";
import { Header } from "../../components/portal-dashboard/header";
import { ClassNav } from "../../components/portal-dashboard/class-nav";
import { LevelViewer } from "../../components/portal-dashboard/level-viewer";
import { StudentNames } from "../../components/portal-dashboard/student-names";
import { StudentAnswers } from "../../components/portal-dashboard/student-answers";
import LoadingIcon from "../../components/report/loading-icon";
import DataFetchError from "../../components/report/data-fetch-error";
import { getSequenceTree, getAnswersByQuestion } from "../../selectors/report-tree";
import { IResponse } from "../../api";
import { setStudentSort, setCurrentActivity, setCurrentQuestion, setCurrentStudent,
         toggleCurrentActivity, toggleCurrentQuestion, setCompactReport } from "../../actions/dashboard";
import { RootState } from "../../reducers";
import { QuestionOverlay } from "../../components/portal-dashboard/question-overlay";
import { StudentResponsePopup } from "../../components/portal-dashboard/all-responses-popup/student-responses-popup";

import css from "../../../css/portal-dashboard/portal-dashboard-app.less";

interface IProps {
  // from mapStateToProps
  anonymous: boolean;
  answers: Map<any, any>;
  clazzName: string;
  compactReport: boolean;
  currentActivity?: Map<string, any>;
  currentQuestion?: Map<string, any>;
  currentStudentId: string | null;
  error: IResponse;
  expandedActivities: Map<any, any>;
  isFetching: boolean;
  questions?: Map<string, any>;
  report: any;
  sequenceTree: Map<any, any>;
  studentCount: number;
  studentProgress: Map<any, any>;
  students: any;
  sortedQuestionIds?: string[];
  // from mapDispatchToProps
  fetchAndObserveData: () => void;
  setAnonymous: (value: boolean) => void;
  setCompactReport: (value: boolean) => void;
  setStudentSort: (value: string) => void;
  setCurrentActivity: (activityId: string) => void;
  setCurrentQuestion: (questionId: string) => void;
  setCurrentStudent: (studentId: string) => void;
  toggleCurrentActivity: (activityId: string) => void;
  toggleCurrentQuestion: (questionId: string) => void;
  trackEvent: (category: string, action: string, label: string) => void;
  userName: string;
}

interface IState {
  initialLoading: boolean;
  scrollLeft: number;
  showAllResponsesPopup: boolean;
}

class PortalDashboardApp extends React.PureComponent<IProps, IState> {
  private responseTableRef: HTMLElement | null;
  constructor(props: IProps) {
    super(props);
    this.state = {
      initialLoading: true,
      scrollLeft: 0,
      showAllResponsesPopup: false
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

    if (this.responseTableRef && this.responseTableRef.scrollLeft * -1 !== this.state.scrollLeft) {
      this.setState({ scrollLeft: this.responseTableRef.scrollLeft * -1 });
    }
  }

  render() {
    const { anonymous, answers, clazzName, compactReport, currentActivity, currentQuestion, currentStudentId, error, report,
      sequenceTree, setAnonymous, setCompactReport, setStudentSort, studentProgress, students, sortedQuestionIds, questions,
      expandedActivities, setCurrentActivity, setCurrentQuestion, setCurrentStudent, toggleCurrentActivity, toggleCurrentQuestion, trackEvent, userName } = this.props;
    const { initialLoading, showAllResponsesPopup } = this.state;
    const isAnonymous = report ? report.get("anonymous") : true;
    // In order to list the activities in the correct order,
    // they must be obtained via the child reference in the sequenceTree …
    const activityTrees: Map<any, any> | false = sequenceTree && sequenceTree.get("children");
    let assignmentName: string;
    if (sequenceTree && sequenceTree.get("name") !== "") {
      assignmentName = sequenceTree.get("name");
    }
    else {
      assignmentName = activityTrees && activityTrees.first().get("name");
    }

    return (
      <div className={css.portalDashboardApp}>
        {sequenceTree &&
          <Header
            userName={userName}
            setCompact={setCompactReport}
            assignmentName={assignmentName}
            trackEvent={trackEvent}
          />
        }
        {activityTrees &&
          <div>
            <div className={css.navigation}>
              <ClassNav
                anonymous={anonymous}
                clazzName={clazzName}
                setStudentSort={setStudentSort}
                trackEvent={trackEvent}
                studentCount={students.size}
                setAnonymous={setAnonymous}
              />
              <LevelViewer
                activities={activityTrees}
                currentActivity={currentActivity}
                currentQuestion={currentQuestion}
                leftPosition={this.state.scrollLeft}
                studentProgress={studentProgress}
                toggleCurrentActivity={toggleCurrentActivity}
                toggleCurrentQuestion={toggleCurrentQuestion}
              />
            </div>
            <div className={css.progressTable} onScroll={this.handleScroll} ref={elt => this.responseTableRef = elt}>
              <StudentNames
                students={students}
                isAnonymous={isAnonymous}
                isCompact={compactReport}
              />
              <StudentAnswers
                activities={activityTrees}
                answers={answers}
                currentActivity={currentActivity}
                currentQuestion={currentQuestion}
                currentStudentId={currentStudentId}
                expandedActivities={expandedActivities}
                students={students}
                studentProgress={studentProgress}
                isCompact={compactReport}
                setCurrentActivity={setCurrentActivity}
                setCurrentQuestion={setCurrentQuestion}
                setCurrentStudent={setCurrentStudent}
              />
            </div>
            <QuestionOverlay
              currentQuestion={currentQuestion}
              currentStudentId={currentStudentId}
              handleShowAllResponsesPopup={this.setShowAllResponsesPopup}
              isAnonymous={isAnonymous}
              questions={questions}
              setCurrentActivity={setCurrentActivity}
              setCurrentStudent={setCurrentStudent}
              sortedQuestionIds={sortedQuestionIds}
              students={students}
              toggleCurrentQuestion={toggleCurrentQuestion}
            />
            {showAllResponsesPopup &&
              <StudentResponsePopup
                anonymous={anonymous}
                students={students}
                isAnonymous={isAnonymous}
                setAnonymous={setAnonymous}
                studentCount={students.size}
                setStudentFilter={setStudentSort}
                currentQuestion={currentQuestion}
                questions={questions}
                sortedQuestionIds={sortedQuestionIds}
                toggleCurrentQuestion={toggleCurrentQuestion}
                setCurrentActivity={setCurrentActivity}
                trackEvent={trackEvent}
                handleCloseAllResponsesPopup={this.setShowAllResponsesPopup}
              />
            }
          </div>
        }
        {error && <DataFetchError error={error} />}
        {initialLoading && <LoadingIcon />}
      </div>
    );
  }

  private setShowAllResponsesPopup = (show: boolean) => {
    if (show) { this.setState({ showAllResponsesPopup: show }); }
    else { this.setState({ showAllResponsesPopup: false }); }
  }

  private handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const element = e.target as HTMLElement;
    if (element && element.scrollLeft !== null) {
      this.setState({ scrollLeft: -1 * element.scrollLeft });
    }
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
    anonymous: getAnonymous(state),
    answers,
    clazzName: dataDownloaded ? state.getIn(["report", "clazzName"]) : undefined,
    compactReport: getCompactReport(state),
    currentActivity: getCurrentActivity(state),
    currentQuestion: getCurrentQuestion(state),
    currentStudentId: getCurrentStudentId(state),
    error,
    expandedActivities: state.getIn(["dashboard", "expandedActivities"]),
    isFetching: data.get("isFetching"),
    report: dataDownloaded && reportState,
    sequenceTree: dataDownloaded && getSequenceTree(state),
    students: dataDownloaded && getSortedStudents(state),
    studentProgress: dataDownloaded && getStudentProgress(state),
    userName: dataDownloaded ? state.getIn(["report", "platformUserName"]) : undefined,
    questions,
    sortedQuestionIds,
  };
}

const mapDispatchToProps = (dispatch: any, ownProps: any): Partial<IProps> => {
  return {
    fetchAndObserveData: () => dispatch(fetchAndObserveData()),
    setAnonymous: (value: boolean) => dispatch(setAnonymous(value)),
    setCompactReport: (value: boolean) => dispatch(setCompactReport(value)),
    setStudentSort: (value: string) => dispatch(setStudentSort(value)),
    setCurrentActivity: (activityId: string) => dispatch(setCurrentActivity(activityId)),
    setCurrentStudent: (studentId: string) => dispatch(setCurrentStudent(studentId)),
    setCurrentQuestion: (questionId: string) => dispatch(setCurrentQuestion(questionId)),
    toggleCurrentActivity: (activityId: string) => dispatch(toggleCurrentActivity(activityId)),
    toggleCurrentQuestion: (questionId: string) => dispatch(toggleCurrentQuestion(questionId)),
    trackEvent: (category: string, action: string, label: string) => dispatch(trackEvent(category, action, label)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PortalDashboardApp);
