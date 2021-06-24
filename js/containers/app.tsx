import React from "react";
import ReportApp from "./report/report-app";
import DashboardApp from "./dashboard/dashboard-app";
import PortalDashboardApp from "./portal-dashboard/portal-dashboard-app";
import IframeStandaloneApp from "./report/iframe-standalone-app";
import { connect } from "react-redux";
import { RootState } from "../reducers";
import config, { configBool } from "../config";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {
}

export const FULL_REPORT = "fullReport";
export const DASHBOARD = "dashboard";
export const PORTAL_DASHBOARD = "portalDashboard";
export const IFRAME_STANDALONE = "iframeStandalone";
export class App extends React.PureComponent<IProps> {
  render() {
    const viewType = config("iframeQuestionId") ? IFRAME_STANDALONE :
                     configBool("portal-dashboard") ? PORTAL_DASHBOARD :
                     configBool("dashboard") ? DASHBOARD : FULL_REPORT;
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
