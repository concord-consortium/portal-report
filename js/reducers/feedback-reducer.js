import Immutable, { Map } from "immutable";
import { RECEIVE_RESOURCE_STRUCTURE, UPDATE_FEEDBACK } from "../actions";

const INITIAL_FEEDBACK_STATE = Map({});

export default function feedbackReducer(state = INITIAL_FEEDBACK_STATE, action) {
  function updateFeedback(state, action) {
    const {answerKey, feedback} = action;
    return state.mergeIn([answerKey], feedback);
  }

  switch (action.type) {
    case RECEIVE_RESOURCE_STRUCTURE:
      // Old source of feedbacks won't work anymore.
      // const data = normalizeResourceJSON(action.response);
      // return Immutable.fromJS(data.entities.feedbacks || {});
      return Immutable.fromJS({});
    case UPDATE_FEEDBACK:
      return updateFeedback(state, action);
    default:
      return state;
  }
}
