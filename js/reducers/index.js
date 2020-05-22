import { Map } from "immutable";
import feedbackReducer from "./feedback-reducer";
import dashboardReducer from "./dashboard-reducer";
import view from "./view-reducer";
import data from "./data-reducer";
import report from "./report-reducer";

export default function reducer(state = Map(), action) {
  return Map({
    view: view(state.get("view"), action),
    data: data(state.get("data"), action),
    report: report(state.get("report"), action),
    feedback: feedbackReducer(state.get("feedback"), action),
    dashboard: dashboardReducer(state.get("dashboard"), action)
  });
}
