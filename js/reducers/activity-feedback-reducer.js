import Immutable, { Map } from 'immutable'
import { RECEIVE_DATA, UPDATE_ACTIVITY_FEEDBACK, ENABLE_ACTIVITY_FEEDBACK } from '../actions'
import transformJSONResponse from '../core/transform-json-response'
const INITIAL_ACTIVITY_FEEDBACK_STATE = Map({})

function setActivityFeedbackSeetings(state, activityId, settings) {

}

function setActivityFeedbackForStudent(state, activityId, studentId, feedback) {

}

function updateActivityFeedback(state, action) {
  const {answerKey, feedback} = action
  return state.mergeIn([answerKey], feedback)
}

export  function activityFeedbackReducer(state = INITIAL_ACTIVITY_FEEDBACK_STATE, action) {
  switch (action.type) {
    case RECEIVE_DATA:
      const data = transformJSONResponse(action.response)
      return Immutable.fromJS(data.entities.activityFeedbacks || {})
    case UPDATE_ACTIVITY_FEEDBACK:
      return updateActivityFeedback(state, action)
    default:
      return state
  }
}
