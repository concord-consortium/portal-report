import { fromJS } from "immutable";
import {
  RECEIVE_QUESTION_FEEDBACKS,
  RECEIVE_FEEDBACK_SETTINGS,
  RECEIVE_ACTIVITY_FEEDBACKS
} from "../actions";

const INITIAL_FEEDBACK_STATE = fromJS({
  settings: {},
  questionFeedbacks: {},
  activityFeedbacks: {}
});

export default function feedbackReducer(state = INITIAL_FEEDBACK_STATE, action) {
  switch (action.type) {
    case RECEIVE_FEEDBACK_SETTINGS:
      return state.set("settings", fromJS(action.response));
    case RECEIVE_QUESTION_FEEDBACKS:
      const feedbacks = action.response.reduce((map, feedback) => {
        map[feedback.answerId] = feedback;
        return map;
      }, {});
      return state.set("questionFeedbacks", fromJS(feedbacks));
    case RECEIVE_ACTIVITY_FEEDBACKS:
      const actFeedbacks = action.response.reduce((map, feedback) => {
        map[feedback.activityId] = feedback;
        return map;
      }, {});
      return state.set("activityFeedbacks", fromJS(actFeedbacks));
    default:
      return state;
  }
}
