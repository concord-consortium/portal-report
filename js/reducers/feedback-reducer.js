import Immutable, { Map } from "immutable";
import {
  RECEIVE_RESOURCE_STRUCTURE,
  UPDATE_FEEDBACK,
  RECEIVE_FEEDBACKS
} from "../actions";

import {
  preprocessFeedbacks
} from "../core/transform-json-response";

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
    case RECEIVE_FEEDBACKS:
      const feedbacks = action.response.reduce((map, feedback) => {
        map[feedback.answerKey] = feedback;
        return map;
      }, {});
      return Immutable.fromJS(feedbacks);
    case UPDATE_FEEDBACK:
      // Just trigger the API middleware side-effect.
      // return updateFeedback(state, action);
      return state;
    default:
      return state;
  }
}
