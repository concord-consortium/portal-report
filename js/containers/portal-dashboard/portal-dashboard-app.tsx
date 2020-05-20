import React from "react";
import { connect } from "react-redux";
import { fetchAndObserveData } from "../../actions/index";
import { getSortedStudents } from "../../selectors/dashboard-selectors";
import { Header } from "../../components/portal-dashboard/header";
import { ClassNav } from "../../components/portal-dashboard/class-nav";
import { LevelViewer } from "../../components/portal-dashboard/level-viewer";
import { StudentList } from "../../components/portal-dashboard/student-list";
import LoadingIcon from "../../components/report/loading-icon";
import DataFetchError from "../../components/report/data-fetch-error";
import { getSequenceTree } from "../../selectors/report-tree";
import { IResponse } from "../../api";

import css from "../../../css/portal-dashboard/portal-dashboard-app.less";

interface IProps {
  isFetching: boolean;
  error: IResponse;
  clazzName: string;
  students: any;
  fetchAndObserveData: () => void;
  sequenceTree: any;
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
    const { clazzName, students, error, sequenceTree } = this.props;
    const { initialLoading } = this.state;
    // In order to list the activities in the correct order,
    // they must be obtained via the child reference in the sequenceTree …
    const activityTrees = sequenceTree && sequenceTree.get("children");
    return (
      <div className={css.portalDashboardApp}>
        <Header/>
        { activityTrees &&
          <div>
            <div className={css.navigation}>
              <ClassNav clazzName={clazzName}/>
              <LevelViewer/>
            </div>
            <StudentList students={students}/>
          </div>
        }
        { error && <DataFetchError error={error} /> }
        { initialLoading && <LoadingIcon /> }
      </div>
    );
  }
}

function mapStateToProps(state: any) {
  const data = state.get("data");
  const error = data.get("error");
  const dataDownloaded = !error && !data.get("isFetching");
  return {
    isFetching: data.get("isFetching"),
    error,
    clazzName: dataDownloaded && state.getIn(["report", "clazzName"]),
    students: dataDownloaded && getSortedStudents(state),
    sequenceTree: dataDownloaded && getSequenceTree(state),
  };
}

const mapDispatchToProps = (dispatch: any, ownProps: any) => {
  return {
    fetchAndObserveData: () => dispatch(fetchAndObserveData()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PortalDashboardApp);
