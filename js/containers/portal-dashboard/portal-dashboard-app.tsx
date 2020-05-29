import React from "react";
import { Map } from "immutable";
import { connect } from "react-redux";
import { fetchAndObserveData, trackEvent } from "../../actions/index";
import { getSortedStudents, getCurrentActivity } from "../../selectors/dashboard-selectors";
import { Header } from "../../components/portal-dashboard/header";
import { ClassNav } from "../../components/portal-dashboard/class-nav";
import { LevelViewer } from "../../components/portal-dashboard/level-viewer";
import { StudentList } from "../../components/portal-dashboard/student-list";
import LoadingIcon from "../../components/report/loading-icon";
import DataFetchError from "../../components/report/data-fetch-error";
import { getSequenceTree } from "../../selectors/report-tree";
import { IResponse } from "../../api";
import { setStudentSort, toggleCurrentActivity } from "../../actions/dashboard";

import css from "../../../css/portal-dashboard/portal-dashboard-app.less";
import { RootState } from "../../reducers";

interface IProps {
  isFetching: boolean;
  error: IResponse;
  clazzName: string;
  students: any;
  sequenceTree: Map<any, any>;
  studentCount: number;
  currentActivity?: Map<string, any>;

  fetchAndObserveData: () => void;
  setStudentSort: (value: string) => void;
  toggleCurrentActivity: (activityId: string) => void;
  trackEvent: (category: string, action: string, label: string) => void;
}

interface IState {
  initialLoading: boolean;
}

class PortalDashboardApp extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      initialLoading: true
    };
  }

  componentDidMount() {
    const { fetchAndObserveData } = this.props;
    fetchAndObserveData();
  }

  componentDidUpdate(prevProps: IProps) {
    const { initialLoading } = this.state;
    const { isFetching } = this.props;
    if (initialLoading && !isFetching && prevProps.isFetching) {
      this.setState({ initialLoading: false });
    }
  }

  render() {
    const { clazzName, students, error, sequenceTree, currentActivity, setStudentSort, toggleCurrentActivity, trackEvent } = this.props;
    const { initialLoading } = this.state;
    // In order to list the activities in the correct order,
    // they must be obtained via the child reference in the sequenceTree …
    const activityTrees: Map<any, any> | false = sequenceTree && sequenceTree.get("children");
    return (
      <div className={css.portalDashboardApp}>
        <Header/>
        { activityTrees &&
          <div>
            <div className={css.navigation}>
              <ClassNav
                clazzName={clazzName}
                setStudentSort={setStudentSort}
                trackEvent={trackEvent}
                studentCount = {students.size}
              />
              <LevelViewer
                activities={activityTrees}
                toggleCurrentActivity={toggleCurrentActivity}
                currentActivity={currentActivity}
              />
            </div>
            <StudentList
              students={students}
              isAnonymous={false}
            />
          </div>
        }
        { error && <DataFetchError error={error} /> }
        { initialLoading && <LoadingIcon /> }
      </div>
    );
  }
}

function mapStateToProps(state: RootState): Partial<IProps> {
  const data = state.get("data");
  const error = data.get("error");
  const dataDownloaded = !error && !data.get("isFetching");
  return {
    isFetching: data.get("isFetching"),
    error,
    clazzName: dataDownloaded ? state.getIn(["report", "clazzName"]) : undefined,
    students: dataDownloaded && getSortedStudents(state),
    sequenceTree: dataDownloaded && getSequenceTree(state),
    currentActivity: getCurrentActivity(state),
  };
}

const mapDispatchToProps = (dispatch: any, ownProps: any): Partial<IProps> => {
  return {
    fetchAndObserveData: () => dispatch(fetchAndObserveData()),
    setStudentSort: (value: string) => dispatch(setStudentSort(value)),
    toggleCurrentActivity: (activityId: string) =>  dispatch(toggleCurrentActivity(activityId)),
    trackEvent: (category: string, action: string, label: string) => dispatch(trackEvent(category, action, label)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PortalDashboardApp);
