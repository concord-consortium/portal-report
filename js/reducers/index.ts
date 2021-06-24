import feedback, { FeedbackState } from "./feedback-reducer";
import dashboard, { DashboardState } from "./dashboard-reducer";
import data, { DataState } from "./data-reducer";
import report, { ReportState } from "./report-reducer";
import { RecordFactory } from "../util/record-factory";
import { Action } from "redux";

export interface IRootState {
  data: DataState;
  report: ReportState;
  feedback: FeedbackState;
  dashboard: DashboardState;
}

const dummyAction = {type: ""};

const INITIAL_ROOT_STATE = RecordFactory<IRootState>({
  data: data(undefined, dummyAction),
  report: report(undefined, dummyAction),
  feedback: feedback(undefined, dummyAction),
  dashboard: dashboard(undefined, dummyAction),
});

export class RootState extends INITIAL_ROOT_STATE {
  constructor(config: Partial<IRootState>) {
    super(config);
  }
}

export default function reducer(state = new RootState({}), action: Action) {
  return new RootState({
    data: data(state.get("data"), action),
    report: report(state.get("report"), action),
    feedback: feedback(state.get("feedback"), action),
    dashboard: dashboard(state.get("dashboard"), action)
  });
}
