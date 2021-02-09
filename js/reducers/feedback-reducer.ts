import { Map, fromJS } from "immutable";
import {
  RECEIVE_QUESTION_FEEDBACKS,
  RECEIVE_FEEDBACK_SETTINGS,
  RECEIVE_ACTIVITY_FEEDBACKS
} from "../actions";
import { RecordFactory } from "../util/record-factory";

export interface IFeedbackState {
  settings: Map<any, any>;
  questionFeedbacks: Map<any, any>;
  activityFeedbacks: Map<any, any>;
  rubric: any;
}

const INITIAL_FEEDBACK_STATE = RecordFactory<IFeedbackState>({
  settings: fromJS({}),
  questionFeedbacks: fromJS({}),
  activityFeedbacks: fromJS({}),
  rubric: fromJS({}),

});

export class FeedbackState extends INITIAL_FEEDBACK_STATE implements IFeedbackState {
  constructor(config: Partial<IFeedbackState>) {
    super(config);
  }
  settings: Map<any, any>;
  questionFeedbacks: Map<any, any>;
  activityFeedbacks: Map<any, any>;
  rubric: any;
}

export default function feedback(state = new FeedbackState({}), action: any) {
  switch (action.type) {
    case RECEIVE_FEEDBACK_SETTINGS:
      return state.set("settings", fromJS(action.response));
    case RECEIVE_QUESTION_FEEDBACKS:
      const feedbacks = action.response.reduce((map: any, feedback: any) => {
        map[feedback.answerId] = feedback;
        return map;
      }, {});
      return state.set("questionFeedbacks", fromJS(feedbacks));
    case RECEIVE_ACTIVITY_FEEDBACKS:
      const actFeedbacks = action.response.reduce((map: any, feedback: any) => {
        map[`${feedback.activityId}-${feedback.platformStudentId}`] = feedback;
        return map;
      }, {});
      return state.set("activityFeedbacks", fromJS(actFeedbacks));
    default:
      return state;
  }
}
