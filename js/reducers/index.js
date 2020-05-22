import { Map } from "immutable";
import { MANUAL_SCORE, RUBRIC_SCORE } from "../util/scoring-constants";
import feedbackReducer from "./feedback-reducer";
import dashboardReducer from "./dashboard-reducer";
import view from "./view-reducer";
import data from "./data-reducer";
import report from "./report-reducer";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function updateActivityFeedbackSettings(state, action) {
  const {activityId, feedbackFlags} = action;
  const statePath = ["activities", activityId.toString()];
  // We have to unset 'RUBRIC_SCORE' scoretypes when
  // we are no longer using rubric...
  if (feedbackFlags.useRubric === false) {
    const scoreType = state.getIn(statePath).get("scoreType");
    if (scoreType === RUBRIC_SCORE) {
      feedbackFlags.scoreType = MANUAL_SCORE;
    }
  }
  return state.mergeIn(statePath, feedbackFlags);
}

export default function reducer(state = Map(), action) {
  return Map({
    view: view(state.get("view"), action),
    data: data(state.get("data"), action),
    report: report(state.get("report"), action),
    feedback: feedbackReducer(state.get("feedback"), action),
    dashboard: dashboardReducer(state.get("dashboard"), action)
  });
}
