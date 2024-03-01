import { Rubric } from "../components/portal-dashboard/feedback/rubric-utils";
import { RUBRIC_SCORE, NO_SCORE, AUTOMATIC_SCORE, MANUAL_SCORE } from "./scoring-constants";

// the scoring constants are defined in a JavaScript file so we create the sum type here
const scoreTypes = [MANUAL_SCORE, NO_SCORE, RUBRIC_SCORE, AUTOMATIC_SCORE] as const;
export type ScoreType = typeof scoreTypes[number];

export interface ScoringSettings {
  scoreType: ScoreType;
  maxScore: number;
}

export const getScoringSettings = (initialSettings?: ScoringSettings, options?: { rubric?: Rubric }): ScoringSettings => {
  const hasRubric = !!options?.rubric;
  const defaultScoreType = hasRubric ? RUBRIC_SCORE : NO_SCORE;

  const settings: ScoringSettings = {
    scoreType: initialSettings?.scoreType ?? defaultScoreType,
    maxScore: initialSettings?.maxScore ?? 10,
  };

  if (settings.scoreType === RUBRIC_SCORE && !hasRubric) {
    settings.scoreType = NO_SCORE;
  }

  return settings;
};
