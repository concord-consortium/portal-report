import { Map, fromJS } from "immutable";
import {
  RECEIVE_QUESTION_FEEDBACKS,
  RECEIVE_FEEDBACK_SETTINGS,
  RECEIVE_ACTIVITY_FEEDBACKS
} from "../actions";
import { RecordFactory } from "../util/record-factory";
import { Rubric } from "../components/portal-dashboard/feedback/rubric-utils";

export interface IFeedbackState {
  settings: Map<any, any>;
  questionFeedbacks: Map<any, any>;
  activityFeedbacks: Map<any, any>;
  rubric: Rubric;
}

const INITIAL_FEEDBACK_STATE = RecordFactory<IFeedbackState>({
  settings: Map({}),
  questionFeedbacks: Map({}),
  activityFeedbacks: Map({}),
  rubric: Map({}) as any,
});

export class FeedbackState extends INITIAL_FEEDBACK_STATE implements IFeedbackState {
  constructor(config: Partial<IFeedbackState>) {
    super(config);
  }
  settings: Map<any, any>;
  questionFeedbacks: Map<any, any>;
  activityFeedbacks: Map<any, any>;
  rubric: Rubric;
}

export default function feedback(state = new FeedbackState({}), action: any) {
  switch (action.type) {
    case RECEIVE_FEEDBACK_SETTINGS:
      return state.set("settings", fromJS(action.response) as Map<any, any>);
    case RECEIVE_QUESTION_FEEDBACKS:
      const feedbacks = action.response.reduce((map: any, feedback: any) => {
        map[feedback.answerId] = feedback;
        return map;
      }, {});
      return state.set("questionFeedbacks", fromJS(feedbacks) as Map<any, any>);
    case RECEIVE_ACTIVITY_FEEDBACKS:
      const actFeedbacks = action.response.reduce((map: any, feedback: any) => {
        map[`${feedback.activityId}-${feedback.platformStudentId}`] = feedback;
        return map;
      }, {});
      return state.set("activityFeedbacks", fromJS(actFeedbacks) as Map<any, any>);
    default:
      return state;
  }
}
