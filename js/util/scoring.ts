import { List, Map } from "immutable";
import { Rubric } from "../components/portal-dashboard/feedback/rubric-utils";
import { RUBRIC_SCORE, NO_SCORE, AUTOMATIC_SCORE, MANUAL_SCORE } from "./scoring-constants";
import { computeRubricMaxScore, getRubricScores } from "../selectors/activity-feedback-selectors";

// the scoring constants are defined in a JavaScript file so we create the sum type here
const scoreTypes = [MANUAL_SCORE, NO_SCORE, RUBRIC_SCORE, AUTOMATIC_SCORE] as const;
export type ScoreType = typeof scoreTypes[number];

export interface ScoringSettings {
  scoreType: ScoreType;
  maxScore: number;
}

interface GetScoringSettingsOptions {
  rubric?: Rubric;
  hasScoredQuestions?: boolean;
}

export const getScoringSettingsInState = (state: any, activityId: any) => {
  return (state.getIn(["feedback", "settings", "activitySettings", activityId]) || Map({})).toJS();
};

export const getScoringSettings = (initialSettings?: ScoringSettings, options?: GetScoringSettingsOptions): ScoringSettings => {
  const hasRubric = !!options?.rubric;
  const hasScoredQuestions = !!options?.hasScoredQuestions;
  const defaultScoreType = hasRubric ? RUBRIC_SCORE : NO_SCORE;

  const settings: ScoringSettings = {
    scoreType: initialSettings?.scoreType ?? defaultScoreType,
    maxScore: initialSettings?.maxScore ?? 10,
  };

  if (settings.scoreType === RUBRIC_SCORE && !hasRubric) {
    settings.scoreType = NO_SCORE;
  }
  if (settings.scoreType === AUTOMATIC_SCORE && !hasScoredQuestions) {
    settings.scoreType = defaultScoreType;
  }

  return settings;
};

export const getScoredQuestions = (activity: any): List<any> => {
  return activity.get("questions")?.filter((q: any) =>
    q.get("visible") && q.get("type") === "multiple_choice" && q.get("scored"),
  ) ?? List();
};

export const computeAvgScore = (scoringSettings: ScoringSettings, rubric: Rubric, feedbacks: any) => {
  const { scoreType, maxScore } = scoringSettings;
  let avgScore = 0;
  let avgScoreMax = 0;

  switch (scoreType) {
    case RUBRIC_SCORE:
      const rubricScores = getRubricScores(rubric, feedbacks);
      const {totalScore, scoredQuestions} = rubricScores.reduce((acc, cur) => {
        let {totalScore, scoredQuestions} = acc;
        if (cur !== null) {
          totalScore += cur;
          scoredQuestions++;
        }
        return {totalScore, scoredQuestions};
      }, {totalScore: 0, scoredQuestions: 0});

      if (scoredQuestions > 0) {
        avgScore = totalScore / scoredQuestions;
      }
      avgScoreMax = computeRubricMaxScore(rubric);
      break;

    case MANUAL_SCORE:
      const manualScores = feedbacks.scores;
      if (manualScores.length > 0) {
        const totalScore = manualScores.reduce((acc: number, cur: number) => acc + cur, 0);
        avgScore = totalScore / manualScores.length;
      }
      avgScoreMax = maxScore;
      break;
  }

  return {avgScore, avgScoreMax};
};
