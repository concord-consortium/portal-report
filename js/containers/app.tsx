import React from "react";
import ReportApp from "./report/report-app";
import DashboardApp from "./dashboard/dashboard-app";
import PortalDashboardApp from "./portal-dashboard/portal-dashboard-app";
import IframeStandaloneApp from "./report/iframe-standalone-app";
import { connect } from "react-redux";
import { DASHBOARD, PORTAL_DASHBOARD, IFRAME_STANDALONE, FULL_REPORT } from "../reducers/view-reducer";
import { RootState } from "../reducers";

interface IProps {
  viewType: string;
}

export class App extends React.PureComponent<IProps> {
  render() {
    const { viewType } = this.props;
    switch (viewType) {
      case DASHBOARD:
        return <DashboardApp />;
      case PORTAL_DASHBOARD:
        return <PortalDashboardApp />;
      case IFRAME_STANDALONE:
        return <IframeStandaloneApp />;
      case FULL_REPORT:
      default:
        return <ReportApp />;
    }
  }
}

const mapStateToProps = (state: RootState) => ({
  viewType: state.getIn(["view", "type"]),
});

export default connect(mapStateToProps)(App);
