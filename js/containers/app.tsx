import React from "react";
import ReportApp from "./report/report-app";
import DashboardApp from "./dashboard/dashboard-app";
import PortalDashboardApp from "./portal-dashboard/portal-dashboard-app";
import IframeStandaloneApp from "./report/iframe-standalone-app";
import { connect } from "react-redux";
import { RootState } from "../reducers";
import { DASHBOARD, FULL_REPORT, IFRAME_STANDALONE, PORTAL_DASHBOARD, getViewType } from "../util/misc";

interface IProps {
}

export class App extends React.PureComponent<IProps> {
  render() {
    const viewType = getViewType();
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
});

export default connect(mapStateToProps)(App);
