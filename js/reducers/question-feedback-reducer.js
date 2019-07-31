import Immutable, { Map } from "immutable";
import {
  UPDATE_QUESTION_FEEDBACK,
  RECEIVE_QUESTION_FEEDBACKS
} from "../actions";
import { preprocessFeedbacks } from "../core/transform-json-response";

const INITIAL_FEEDBACK_STATE = Map({});

export default function questionFeedbackReducer(state = INITIAL_FEEDBACK_STATE, action) {
  switch (action.type) {
    case RECEIVE_QUESTION_FEEDBACKS:
      const feedbacks = preprocessFeedbacks(action.response).reduce((map, feedback) => {
        map[feedback.answerKey] = feedback;
        return map;
      }, {});
      return Immutable.fromJS(feedbacks);
    case UPDATE_QUESTION_FEEDBACK:
      // Just trigger the API middleware side-effect.
      return state;
    default:
      return state;
  }
}
