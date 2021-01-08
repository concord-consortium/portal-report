import {
  fetchPortalDataAndAuthFirestore,
  updateReportSettings,
  updateFeedbackSettings,
  updateQuestionFeedbacks,
  updateActivityFeedbacks,
  APIError,
  fetchRubric
} from "./api";
import { getFirestore } from "./db";

// In some cases callApi returns a promise which might throw an error when it is
// being resolved. In other cases callApi will throw an error directly before it
// returns the promise
function handleApiError(actionType, apiType, errorAction, next, error) {
  // Log this error to the console in addtion to dispatching the errorAction
  // In chrome this log message includes both the stack trace from the error
  // object as well as the stack trace of the console state. Both can be useful
  console.error(`error calling API: ${apiType} during action: ${actionType} (error below)\n`, error);
  if ((error.name === "APIError") && errorAction) {
    // CHECKME: is this valid middleware behavior? we are calling next and
    // not returning it
    next(errorAction(error.response));
    return;
  }
  if ((error instanceof TypeError) && errorAction) {
    // This happens when there is a network error while fetching
    // Use a fake error code 599 so the errorAction code can render something informative
    const response = {
      url: apiType,
      status: 599,
      statusText: error.message,
    };
    // CHECKME: is this valid middleware behavior? we are calling next and
    // not returning its result
    next(errorAction(response));
    return;
  }
}

// This middleware is executed only if action includes .callAPI object.
// It calls API action defined in callAPI.type.
// If action succeeds and callAPI.successAction is defined, it will be called with response.
// If action fails and callAPI.errorAction is defined, it will be called with the error response object.
export default store => next => action => {
  if (action.callAPI) {
    const state = store.getState();
    const { type, data, successAction, errorAction} = action.callAPI;
    try {
      callApi(type, data, state)
        // Try to catch errors from the promise returned by callApi
        // The order here is important. In some cases the successAction causes its
        // own error, we don't want to handle that here because we'd incorrectly
        // be reporting the action type and api type
        .catch(error => handleApiError(action.type, type, errorAction, next, error))
        .then(response => successAction && next(successAction(response)));
    } catch (error) {
      // Some callApi functions throw errors during setup, before they
      // return a promise this catch here handles that case.
      // NOTE: if this an unhandled exception it will stop the `next(action)`
      // from being called
      handleApiError(action.type, type, errorAction, next, error);
    }
  }
  return next(action);
};

export const API_UPDATE_QUESTION_FEEDBACK = "updateQuestionFeedback";
export const API_UPDATE_ACTIVITY_FEEDBACK = "updateActivityFeedback";
export const API_UPDATE_REPORT_SETTINGS = "updateReportSettings";
export const API_UPDATE_FEEDBACK_SETTINGS = "updateFeedbackSettings";
export const API_FETCH_PORTAL_DATA_AND_AUTH_FIRESTORE = "fetchPortalDataAndAuthFirestore";
export const API_FETCH_RUBRIC = "fetchRubric";

function callApi(type, data, state) {
  switch (type) {
    case API_FETCH_PORTAL_DATA_AND_AUTH_FIRESTORE:
      // Make sure firestore db is ready before fetching data
      return getFirestore().then(() => fetchPortalDataAndAuthFirestore());
    case API_UPDATE_REPORT_SETTINGS:
      return updateReportSettings(data, state.get("report").toJS());
    case API_UPDATE_FEEDBACK_SETTINGS:
      return updateFeedbackSettings(data, state.get("report").toJS());
    case API_UPDATE_QUESTION_FEEDBACK:
      return updateQuestionFeedbacks(data, state.get("report").toJS());
    case API_UPDATE_ACTIVITY_FEEDBACK:
      return updateActivityFeedbacks(data, state.get("report").toJS());
    case API_FETCH_RUBRIC:
      return fetchRubric(data);
  }
}
