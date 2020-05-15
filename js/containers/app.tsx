import React from "react";
import ReportApp from "./report/report-app";
import DashboardApp from "./dashboard/dashboard-app";
import { connect } from "react-redux";
import { DASHBOARD, PORTAL_DASHBOARD } from "../reducers";

const PortalDashboardApp = () => {
  return (
    <div>
      <div>Portal Dashboard Under Construction</div>
      <div>Please check back later</div>
    </div>
  );
};

interface IProps {
  viewType: string;
}

export class App extends React.PureComponent<IProps> {
  render() {
    const { viewType } = this.props;
    return (
      viewType === PORTAL_DASHBOARD
        ? <PortalDashboardApp />
        : viewType === DASHBOARD
          ? <DashboardApp />
          : <ReportApp />
    );
  }
}

const mapStateToProps = (state: any) => ({
  viewType: state.getIn(["view", "type"]),
});

export default connect(mapStateToProps)(App);
