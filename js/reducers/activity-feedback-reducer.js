import Immutable, { Map, fromJS} from 'immutable'
import { RECEIVE_DATA, UPDATE_ACTIVITY_FEEDBACK, ENABLE_ACTIVITY_FEEDBACK } from '../actions'
import transformJSONResponse from '../core/transform-json-response'
const INITIAL_ACTIVITY_FEEDBACK_STATE = Map({})

function setActivityFeedbackSeetings(state, activityId, settings) {

}

function setActivityFeedbackForStudent(state, activityId, studentId, feedback) {

}

function updateActivityFeedback(state, action) {
  const {activityFeedbackKey, feedback} = action
  const [activityId, studentId] = activityFeedbackKey.split('-')
  const record = state.get(activityFeedbackKey) || fromJS({
    studentId:parseInt(studentId),
    key: activityFeedbackKey,
    feedbacks:[{
      feedback:"",
      hasBeenReviewed:false,
      score:0
    }]
  })
  return state.set(activityFeedbackKey, record.mergeIn(["feedbacks",0], feedback))
}

export  function activityFeedbackReducer(state = INITIAL_ACTIVITY_FEEDBACK_STATE, action) {
  switch (action.type) {
    case RECEIVE_DATA:
      const data = transformJSONResponse(action.response)
      const feedbacks =  Immutable.fromJS(data.entities.activityFeedbacks || {})
      return feedbacks
    case UPDATE_ACTIVITY_FEEDBACK:
      return updateActivityFeedback(state, action)
    default:
      return state
  }
}
