import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { fetchAndObserveData, trackEvent } from "../../actions/index";
import {
  setActivityExpanded,
  setStudentExpanded,
  setStudentsExpanded,
  setQuestionExpanded,
  setStudentSort,
  selectQuestion,
} from "../../actions/dashboard";
import Dashboard from "../../components/dashboard/dashboard";
import SortByDropdown from "../../components/dashboard/sort-by-dropdown";
import Header from "../../components/common/header";
import HelpModal from "../../components/dashboard/help-modal";
import DataFetchError from "../../components/report/data-fetch-error";
import LoadingIcon from "../../components/report/loading-icon";
import { getActivityTrees } from "../../selectors/report-tree";
import { getStudentProgress, getSortedStudents, getSelectedQuestion } from "../../selectors/dashboard-selectors";
import css from "../../../css/dashboard/dashboard-app.less";

// Make icons available.
import "../../../css/icomoon.css";

class DashboardApp extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      initialLoading: true,
      helpViewVisible: false,
    };
    this.toggleHelpModal = this.toggleHelpModal.bind(this);
  }

  componentDidMount() {
    const { fetchAndObserveData } = this.props;
    fetchAndObserveData();
  }

  componentDidUpdate(prevProps) {
    const { initialLoading } = this.state;
    const { isFetching } = this.props;
    if (initialLoading && !isFetching && prevProps.isFetching) {
      this.setState({ initialLoading: false });
    }
  }

  toggleHelpModal() {
    this.setState({ helpViewVisible: !this.state.helpViewVisible });
  }

  render() {
    const { initialLoading } = this.state;
    const { error, clazzName, activityTrees, students, studentProgress, expandedStudents, expandedActivities, expandedQuestions, setActivityExpanded, setStudentExpanded, setQuestionExpanded, setStudentsExpanded, setStudentSort, selectedQuestion, selectQuestion, trackEvent } = this.props;
    return (
      <div className={css.dashboardApp}>
        <Header onHelpButtonClick={this.toggleHelpModal} background="#6fc6da" />
        {activityTrees &&
          <div>
            <div className={css.title}>
              <h1>Dashboard for { clazzName }</h1>
              <SortByDropdown setStudentSort={setStudentSort} />
            </div>
            <Dashboard
              activities={activityTrees}
              students={students}
              studentProgress={studentProgress}
              expandedActivities={expandedActivities}
              expandedStudents={expandedStudents}
              expandedQuestions={expandedQuestions}
              setActivityExpanded={setActivityExpanded}
              setStudentExpanded={setStudentExpanded}
              setStudentsExpanded={setStudentsExpanded}
              setQuestionExpanded={setQuestionExpanded}
              setStudentSort={setStudentSort}
              selectedQuestion={selectedQuestion}
              selectQuestion={selectQuestion}
              trackEvent={trackEvent}
            />
          </div>
        }
        <HelpModal toggleHelpModal={this.toggleHelpModal} helpViewVisible={this.state.helpViewVisible}  />
        {error && <DataFetchError error={error} />}
        {initialLoading && <LoadingIcon />}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const data = state.get("data");
  const error = data.get("error");
  const dataDownloaded = !error && !data.get("isFetching");
  return {
    isFetching: data.get("isFetching"),
    error: error,
    clazzName: dataDownloaded && state.getIn(["report", "clazzName"]),
    students: dataDownloaded && getSortedStudents(state),
    activityTrees: dataDownloaded && getActivityTrees(state),
    studentProgress: dataDownloaded && getStudentProgress(state),
    expandedActivities: state.getIn(["dashboard", "expandedActivities"]),
    expandedStudents: state.getIn(["dashboard", "expandedStudents"]),
    expandedQuestions: state.getIn(["dashboard", "expandedQuestions"]),
    selectedQuestion: dataDownloaded && getSelectedQuestion(state),
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchAndObserveData: () => dispatch(fetchAndObserveData()),
    setActivityExpanded: (activityId, value) => dispatch(setActivityExpanded(activityId, value)),
    setStudentExpanded: (studentId, value) => dispatch(setStudentExpanded(studentId, value)),
    setStudentsExpanded: (studentIds, value) => dispatch(setStudentsExpanded(studentIds, value)),
    setQuestionExpanded: (studentId, value) => dispatch(setQuestionExpanded(studentId, value)),
    setStudentSort: (value) => dispatch(setStudentSort(value)),
    selectQuestion: (value) => dispatch(selectQuestion(value)),
    trackEvent: (category, action, label) => dispatch(trackEvent(category, action, label)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardApp);
