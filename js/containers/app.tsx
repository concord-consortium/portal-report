import React from "react";
import ReportApp from "./report/report-app";
import DashboardApp from "./dashboard/dashboard-app";
import PortalDashboardApp from "./portal-dashboard/portal-dashboard-app";
import IframeStandaloneApp from "./report/iframe-standalone-app";
import ExportApp from "../components/export/export";
import { connect } from "react-redux";
import { DASHBOARD, PORTAL_DASHBOARD, IFRAME_STANDALONE, FULL_REPORT, EXPORT } from "../reducers/view-reducer";
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
      case EXPORT:
        return <ExportApp />;
      case FULL_REPORT:
      default:
        return <ReportApp />;
    }
  }
}

const mapStateToProps = (state: RootState) => ({
});

export default connect(mapStateToProps)(App);
