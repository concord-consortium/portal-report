import { RecordFactory } from "../util/record-factory";
import config, { configBool } from "../config";

export const FULL_REPORT = "fullReport";
export const DASHBOARD = "dashboard";
export const PORTAL_DASHBOARD = "portalDashboard";
export const IFRAME_STANDALONE = "iframeStandalone";
export const EXPORT = "exportPage";

type ViewType = typeof FULL_REPORT | typeof DASHBOARD | typeof PORTAL_DASHBOARD | typeof IFRAME_STANDALONE | typeof EXPORT;

export interface IViewState {
  type: string;
}

const initialType =
  config("iframeQuestionId") ? IFRAME_STANDALONE :
  configBool("portal-dashboard") ? PORTAL_DASHBOARD :
  configBool("export") ? EXPORT :
  configBool("dashboard") ? DASHBOARD : FULL_REPORT ;

const INITIAL_VIEW_STATE = RecordFactory<IViewState>({
  type: initialType
});

export class ViewState extends INITIAL_VIEW_STATE implements IViewState {
  constructor(config: Partial<IViewState>) {
    super(config);
  }
  type: string;
}

export default function view(state = new ViewState({}), action: any) {
  switch (action.type) {
    // Nothing to do here now. In the future, we might let users toggle between full report and dashboard.
    // Implementation can look like:
    // case SWITCH_REPORT_VIEW:
    //   return state.set('type', action.viewType)
    default:
      return state;
  }
}

export function isDashboardView(viewType: string) {
  return (viewType === DASHBOARD) || (viewType === PORTAL_DASHBOARD) || (viewType === EXPORT);
}
