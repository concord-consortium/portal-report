import {
  fetchPortalDataAndAuthFirestore,
  updateReportSettings,
  APIError,
  fetchRubric
} from "./api";

// This middleware is executed only if action includes .callAPI object.
// It calls API action defined in callAPI.type.
// If action succeeds and callAPI.successAction is defined, it will be called with response.
// If action fails and callAPI.errorAction is defined, it will be called with the error response object.
export default store => next => action => {
  if (action.callAPI) {
    const state = store.getState();
    const { type, data, successAction, errorAction} = action.callAPI;
    callApi(type, data, state)
      .then(response => successAction && next(successAction(response)))
      .catch(error => {
        if (error instanceof APIError && errorAction) {
          return next(errorAction(error.response));
        }
        // if (error instanceof TypeError && errorAction) {
        //   // This happens when there is a network error while fetching
        //   // Use a fake error code 599 so the errorAction code can render something informative
        //   const response = {
        //     url: type,
        //     status: 599,
        //     statusText: error.message,
        //   };
        //   return next(errorAction(response));
        // }
        // Remember to throw original error, as otherwise we would swallow every kind of error.
        throw error;
      });
  }
  return next(action);
};

function callApi(type, data, state) {
  switch (type) {
    case "fetchPortalDataAndAuthFirestore":
      return fetchPortalDataAndAuthFirestore();
    case "updateReportSettings":
      return updateReportSettings(data, state.get("report").toJS());
    case "fetchRubric":
      return fetchRubric(data);
  }
}
