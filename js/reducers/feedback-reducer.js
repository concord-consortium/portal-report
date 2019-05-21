import Immutable, { Map } from "immutable";
import { RECEIVE_DATA, UPDATE_FEEDBACK } from "../actions";
import transformJSONResponse from "../core/transform-json-response";

const INITIAL_FEEDBACK_STATE = Map({});

export default function feedbackReducer(state = INITIAL_FEEDBACK_STATE, action) {
  function updateFeedback(state, action) {
    const {answerKey, feedback} = action;
    return state.mergeIn([answerKey], feedback);
  }

  switch (action.type) {
    case RECEIVE_DATA:
      const data = transformJSONResponse(action.response);
      return Immutable.fromJS(data.entities.feedbacks || {});
    case UPDATE_FEEDBACK:
      return updateFeedback(state, action);
    default:
      return state;
  }
}
