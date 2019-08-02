import { enableActivityFeedback } from "./index";
import { API_FETCH_RUBRIC } from "../api-middleware";

export const LOAD_RUBRIC = "LOAD_RUBRIC";
export const REQUEST_RUBRIC = "REQUEST_RUBRIC";

const exists = (immutable, fieldName) => {
  const value = immutable.get(fieldName);
  return (value && value.length && value.length > 0) ||
         (value && value.size && value.size > 0);
};

// receiveRubric is called after we have received the rubric
// data by making a request to rubricUrl. We update the portal
// activity feedback settings to include the complete json for the rubric.
const receiveRubric = (data) => {
  const {url, rubric} = data;
  return (dispatch, getState) => {
    const activities = getState().getIn(["report", "activities"]);
    // Activities from the portal without rubric _content_.
    // If the activities specify a rubricUrl and that url is
    // the same as we just received prepare to update the portal
    const needToSaveRubricActs = activities
      .filter(act => !exists(act, "rubric"))
      .filter(act => act.get("rubricUrl") === url);

    // Load rubric into the Redux store.
    dispatch({
      type: LOAD_RUBRIC,
      url,
      rubric,
    });

    needToSaveRubricActs.forEach(act => {
      const activityId = act.get("id");
      const activityFeedbackId = act.get("activityFeedbackId");
      const feedbackFlags = {
        activityFeedbackId,
        rubric,
        rubricUrl: url,
      };
      // Event will trigger API call that will update the rubric in the portal.
      // Doesn't require that we invalidate student answers though.
      dispatch(enableActivityFeedback(activityId, feedbackFlags, false));
    });
  };
};

export function requestRubric() {
  return (dispatch, getState) => {
    const state = getState();
    const activities = state.getIn(["report", "activities"]);
    const withRubric = activities.filter(act => exists(act, "rubric") && exists(act, "rubricUrl"));
    const withoutRubric = activities.filter(act => !exists(act, "rubric"));
    const needingFetch = withoutRubric.filter(act => exists(act, "rubricUrl"));

    // Load rubric into the Redux store.
    withRubric.forEach(a => {
      dispatch({
        type: LOAD_RUBRIC,
        url: a.get("rubricUrl"),
        rubric: a.get("rubric"),
      });
    });

    // Make requests for all the missing rubric
    needingFetch.map(a => a.get("rubricUrl"))
      .forEach(url => {
        dispatch({
          type: REQUEST_RUBRIC,
          callAPI: {
            type: API_FETCH_RUBRIC,
            data: url,
            successAction: receiveRubric,
          },
        });
      });
  };
}
