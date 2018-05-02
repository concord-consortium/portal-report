export const NO_SCORE_L = 'No scoring'
export const NO_SCORE = 'none'
export const MANUAL_SCORE_L = 'Manual Scoring'
export const MANUAL_SCORE = 'manual'
export const AUTOMATIC_SCORE_L = 'Automatic Score from questions'
export const AUTOMATIC_SCORE = 'auto'
export const RUBRIC_SCORE_L = 'Score with rubric'
export const RUBRIC_SCORE = 'rubric'
export const MAX_SCORE_DEFAULT = 10
export const MAX_SCORE_MIN = 1
export const AUTOSCORE_TYPES = [AUTOMATIC_SCORE, RUBRIC_SCORE]
export const isAutoScoring = scoretype => AUTOSCORE_TYPES.indexOf(scoretype) > -1
