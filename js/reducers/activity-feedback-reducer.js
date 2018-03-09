import Immutable, { Map, fromJS} from 'immutable'
import { RECEIVE_DATA, UPDATE_ACTIVITY_FEEDBACK, ENABLE_ACTIVITY_FEEDBACK } from '../actions'
import transformJSONResponse from '../core/transform-json-response'
const INITIAL_ACTIVITY_FEEDBACK_STATE = Map({})

function updateActivityFeedback (state, action) {
  const {activityFeedbackKey, feedback} = action
  // eslint-disable-next-line
  const [activityId, studentId] = activityFeedbackKey.split('-')
  const record = state.get(activityFeedbackKey) || fromJS({
    studentId: parseInt(studentId),
    key: activityFeedbackKey,
    feedbacks: [{
      feedback: '',
      hasBeenReviewed: false,
      score: 0
    }]
  })
  return state.set(activityFeedbackKey, record.mergeIn(['feedbacks', 0], feedback))
}

function markAnswersNeedReview (state, action) {
  // Mark all keys in our state, and set `hasBeenReviewed: false`
  return state.map(value => value.setIn(['feedbacks', 0, 'hasBeenReviewed'], false))
}

export function activityFeedbackReducer (state = INITIAL_ACTIVITY_FEEDBACK_STATE, action) {
  switch (action.type) {
    case RECEIVE_DATA:
      const data = transformJSONResponse(action.response)
      const feedbacks = Immutable.fromJS(data.entities.activityFeedbacks || {})
      return feedbacks
    case UPDATE_ACTIVITY_FEEDBACK:
      return updateActivityFeedback(state, action)
    case ENABLE_ACTIVITY_FEEDBACK:
      return markAnswersNeedReview(state, action)
    default:
      return state
  }
}
