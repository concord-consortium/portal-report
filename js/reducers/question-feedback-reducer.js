import Immutable, { Map } from "immutable";
import {
  RECEIVE_QUESTION_FEEDBACKS
} from "../actions";
import { preprocessFeedbacks } from "../core/transform-json-response";

const INITIAL_FEEDBACK_STATE = Map({});

export default function questionFeedbackReducer(state = INITIAL_FEEDBACK_STATE, action) {
  switch (action.type) {
    case RECEIVE_QUESTION_FEEDBACKS:
      const feedbacks = preprocessFeedbacks(action.response).reduce((map, feedback) => {
        map[feedback.answerId] = feedback;
        return map;
      }, {});
      return Immutable.fromJS(feedbacks);
    default:
      return state;
  }
}
