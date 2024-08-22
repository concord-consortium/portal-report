import { Map, fromJS } from "immutable";
import {
  RECEIVE_QUESTION_FEEDBACKS,
  RECEIVE_FEEDBACK_SETTINGS,
  RECEIVE_ACTIVITY_FEEDBACKS,
  RECEIVE_RESOURCE_STRUCTURE
} from "../actions";
import { RecordFactory } from "../util/record-factory";
import { normalizeResourceJSON } from "../core/transform-json-response";
import { getScoringSettings, hasFeedbackGivenScoreType } from "../util/scoring";
import { Rubric } from "../components/portal-dashboard/feedback/rubric-utils";
import migrate from "../core/rubric-migrations";

export interface IFeedbackState {
  settings: Map<any, any>;
  questionFeedbacks: Map<any, any>;
  activityFeedbacks: Map<any, any>;
  hasScoredQuestions: Map<any, boolean>;
}

const INITIAL_FEEDBACK_STATE = RecordFactory<IFeedbackState>({
  settings: Map({}),
  questionFeedbacks: Map({}),
  activityFeedbacks: Map({}),
  hasScoredQuestions: Map({}),
});

export class FeedbackState extends INITIAL_FEEDBACK_STATE implements IFeedbackState {
  constructor(config: Partial<IFeedbackState>) {
    super(config);
  }
  settings: Map<any, any>;
  questionFeedbacks: Map<any, any>;
  activityFeedbacks: Map<any, any>;
  hasScoredQuestions: Map<any, boolean>;
}

export default function feedback(state = new FeedbackState({}), action: any) {
  let hasScoredQuestions: any;
  let actFeedbacks: any;

  switch (action.type) {
    case RECEIVE_FEEDBACK_SETTINGS:
      if (action.response.rubric) {
        action.response.rubric = migrate(action.response.rubric);
      }
      const settingsMap = fromJS(action.response) as Map<any, any>;
      hasScoredQuestions = state.get("hasScoredQuestions");
      const activityFeedbacks = state.get("activityFeedbacks");
      if (activityFeedbacks.size > 0 && hasScoredQuestions !== undefined) {
        // score type may have changed so all feedback needs to be re-evaluated to see if it has been reviewed
        actFeedbacks = updateHasBeenReviewed({
          activityFeedbackValues: activityFeedbacks.toList().toJS(),
          settings: action.response,
          hasScoredQuestions: hasScoredQuestions.toJS()
        });
        return state
          .set("activityFeedbacks", fromJS(actFeedbacks) as Map<any, any>)
          .set("settings", settingsMap);
      }
      return state.set("settings", settingsMap);
    case RECEIVE_QUESTION_FEEDBACKS:
      const feedbacks = action.response.reduce((map: any, feedback: any) => {
        map[feedback.answerId] = feedback;
        return map;
      }, {});
      return state.set("questionFeedbacks", fromJS(feedbacks) as Map<any, any>);
    case RECEIVE_RESOURCE_STRUCTURE:
      const data = normalizeResourceJSON(action.response);
      const questions = data.entities.questions || {};
      hasScoredQuestions = Object.values(questions).reduce<Record<string,boolean>>((acc, question) => {
        if (question.activity) {
          const isScoredQuestion = question.type === "multiple_choice" && question.scored === true;
          acc[question.activity] = acc[question.activity] || isScoredQuestion;
        }
        return acc;
      }, {});
      return state.set("hasScoredQuestions", fromJS(hasScoredQuestions) as Map<any, any>);
    case RECEIVE_ACTIVITY_FEEDBACKS:
      const settings: any = state.get("settings")?.toJS();
      hasScoredQuestions = state.get("hasScoredQuestions")?.toJS();
      actFeedbacks = updateHasBeenReviewed({
        activityFeedbackValues: action.response,
        settings,
        hasScoredQuestions
      });
      return state.set("activityFeedbacks", fromJS(actFeedbacks) as Map<any, any>);
    default:
      return state;
  }
}

export const updateHasBeenReviewed = (params: {activityFeedbackValues: any; settings: any; hasScoredQuestions: any}) => {
  const {activityFeedbackValues, settings, hasScoredQuestions} = params;

  const result = activityFeedbackValues.reduce((map: any, feedback: any) => {
    if (feedback.activityId) {
      feedback.hasBeenReviewed = computeHasBeenReviewed({feedback, settings, hasScoredQuestions});
    }
    map[`${feedback.activityId}-${feedback.platformStudentId}`] = feedback;
    return map;
  }, {});
  return result;
};

export const computeHasBeenReviewed = (params: {feedback: any; settings: any; hasScoredQuestions: any}) => {
  const {feedback, settings, hasScoredQuestions} = params;

  const rubric: Rubric|undefined = settings?.rubric;
  const initialScoringSettings = settings?.activitySettings?.[feedback.activityId];
  const scoreType = getScoringSettings(initialScoringSettings, {
    rubric,
    hasScoredQuestions: hasScoredQuestions?.[feedback.activityId],
  }).scoreType;

  const result = hasFeedbackGivenScoreType({
    scoreType,
    textFeedback: feedback.feedback,
    scoreFeedback: feedback.score,
    rubric,
    rubricFeedback: feedback.rubricFeedback
  });

  return result;
};
