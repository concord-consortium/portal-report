import { saveRubric } from "./index";
import { API_FETCH_RUBRIC } from "../api-middleware";

export const REQUEST_RUBRIC = "REQUEST_RUBRIC";

// ReceiveRubric is called after we have received the rubric
// data by making a request to rubricUrl. We update the portal
// feedback settings to include the complete json for the rubric.
// It will stay there frozen forever. In other words, if teacher opens report with defined rubric,
// rubric will never get updated for this offering.
const receiveRubric = (data) => {
  const { rubric } = data;
  return (dispatch) => {
    dispatch(saveRubric(rubric));
  };
};

export function requestRubric(rubricUrl) {
  return (dispatch, getState) => {
    const state = getState();
    const cachedRubrics = state.getIn(["feedback", "settings", "rubrics"]);
    if (!cachedRubrics || !cachedRubrics.has(rubricUrl)) {
      dispatch({
        type: REQUEST_RUBRIC,
        callAPI: {
          type: API_FETCH_RUBRIC,
          data: rubricUrl,
          successAction: receiveRubric,
        },
      });
    }
  };
}
