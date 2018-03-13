import { fetchReportData, updateReportSettings, APIError } from './api'
import { loadRubric } from './actions/load-rubric'

// This middleware is executed only if action includes .callAPI object.
// It calls API action defined in callAPI.type.
// If action succeeds and callAPI.successAction is defined, it will be called with response.
// If action fails and callAPI.errorAction is defined, it will be called with the error response object.
export default store => next => action => {
  if (action.callAPI) {
    const { type, data, successAction, errorAction } = action.callAPI
    callApi(type, data)
      .then(response => successAction && next(successAction(response)))
      .catch(error => {
        if (error instanceof APIError && errorAction) {
          return next(errorAction(error.response))
        }
        // Remember to throw original error, as otherwise we would swallow every kind of error.
        throw error
      })
  }
  return next(action)
}

function callApi (type, data) {
  switch (type) {
    case 'fetchReportData':
      return fetchReportData()
    case 'updateReportSettings':
      return updateReportSettings(data)
    case 'loadRubric':
      return loadRubric(data)
  }
}
