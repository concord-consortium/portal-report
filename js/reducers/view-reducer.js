import { Map } from "immutable";
import config, { configBool } from "../config";

export const FULL_REPORT = "fullReport";
export const DASHBOARD = "dashboard";
export const PORTAL_DASHBOARD = "portalDashboard";
export const IFRAME_STANDALONE = "iframeStandalone";

const initialType =
  config("iframeQuestionId") ? IFRAME_STANDALONE :
  configBool("portal-dashboard") ? PORTAL_DASHBOARD :
  configBool("dashboard") ? DASHBOARD : FULL_REPORT;

const INITIAL_VIEW_STATE = Map({
  type: initialType
});

export default function view(state = INITIAL_VIEW_STATE, action) {
  switch (action) {
    // Nothing to do here now. In the future, we might let users toggle between full report and dashboard.
    // Implementation can look like:
    // case SWITCH_REPORT_VIEW:
    //   return state.set('type', action.viewType)
    default:
      return state;
  }
}

export function isDashboardView(viewType) {
  return (viewType === DASHBOARD) || (viewType === PORTAL_DASHBOARD);
}
