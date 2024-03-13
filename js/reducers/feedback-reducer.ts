import { Map, fromJS } from "immutable";
import {
  RECEIVE_QUESTION_FEEDBACKS,
  RECEIVE_FEEDBACK_SETTINGS,
  RECEIVE_ACTIVITY_FEEDBACKS,
  RECEIVE_RESOURCE_STRUCTURE
} from "../actions";
import { RecordFactory } from "../util/record-factory";
import { normalizeResourceJSON } from "../core/transform-json-response";
import { getScoringSettings } from "../util/scoring";
import { MANUAL_SCORE, RUBRIC_SCORE } from "../util/scoring-constants";
import { Rubric } from "../components/portal-dashboard/feedback/rubric-utils";

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

  switch (action.type) {
    case RECEIVE_FEEDBACK_SETTINGS:
      return state.set("settings", fromJS(action.response) as Map<any, any>);
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
      const actFeedbacks = action.response.reduce((map: any, feedback: any) => {
        if (feedback.activityId) {
          feedback.hasBeenReviewed = computeHasBeenReviewed({feedback, settings, hasScoredQuestions});
        }
        map[`${feedback.activityId}-${feedback.platformStudentId}`] = feedback;
        return map;
      }, {});
      return state.set("activityFeedbacks", fromJS(actFeedbacks) as Map<any, any>);
    default:
      return state;
  }
}

export const computeHasBeenReviewed = (params: {feedback: any; settings: any; hasScoredQuestions: any}) => {
  const {feedback, settings, hasScoredQuestions} = params;

  const rubric: Rubric|undefined = settings?.rubric;
  const initialScoringSettings = settings?.activitySettings?.[feedback.activityId];
  const scoreType = getScoringSettings(initialScoringSettings, {
    rubric,
    hasScoredQuestions: hasScoredQuestions?.[feedback.activityId],
  }).scoreType;

  const hasScore = !isNaN(parseInt(feedback.score, 10));
  const hasText = (feedback.feedback ?? "").length > 0;

  let hasFilledRubric = false;
  const rubricFeedback = feedback.rubricFeedback;
  if (rubric && rubricFeedback) {
    const scoredValues = Object.values(rubricFeedback).filter((v: any) => v.score > 0);
    hasFilledRubric = scoredValues.length === rubric.criteria.length;
  }

  switch (scoreType) {
    case MANUAL_SCORE:
      return hasScore;

    case RUBRIC_SCORE:
      return hasFilledRubric;

    default:
      return hasText || hasFilledRubric;
  }
};
