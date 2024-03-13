import React, { useRef } from "react";
import * as firebase from "firebase";
import { TrackEventFunction } from "../../../actions";
import { ScoreInput } from "./score-input";
import { ScoringSettings, getRubricDisplayScore } from "../../../util/scoring";
import { AUTOMATIC_SCORE, MANUAL_SCORE, NO_SCORE } from "../../../util/scoring-constants";
import { Rubric } from "./rubric-utils";

import css from "../../../../css/portal-dashboard/feedback/activity-feedback-score.less";

interface IProps {
  activityId: string | null;
  activityIndex: number;
  activityStarted: boolean;
  score: number;
  setFeedbackSortRefreshEnabled: (value: boolean) => void;
  studentId: string;
  updateActivityFeedback?: (activityId: string, activityIndex: number, platformStudentId: string, feedback: any) => void;
  trackEvent: TrackEventFunction;
  scoringSettings: ScoringSettings;
  rubricFeedback: any;
  rubric: Rubric;
}

export const ActivityFeedbackScore: React.FC<IProps> = (props) => {
  const { activityId, activityIndex, activityStarted, score, studentId, updateActivityFeedback, trackEvent, scoringSettings, rubricFeedback, rubric, setFeedbackSortRefreshEnabled } = props;
  const scoreType = scoringSettings.scoreType ?? NO_SCORE;
  const loggedScore = useRef<number|undefined>(score);

  const handleChange = (newScore?: number) => {
    if (activityId && studentId && updateActivityFeedback) {
      setFeedbackSortRefreshEnabled(true);

      // delete the score if it is cleared in the input - a value of undefined
      // would be removed before it is commited to Firestore
      if (newScore === undefined) {
        newScore = firebase.firestore.FieldValue.delete() as any;
      }

      updateActivityFeedback(activityId, activityIndex, studentId, {score: newScore });
    }
  };

  const handleBlur = (currentScore?: number) => {
    if (loggedScore.current !== currentScore) {
      const label = currentScore?.toString() ?? "";
      trackEvent("Portal-Dashboard", "SetActivityManualScore", { label, parameters: { activityId, studentId }, logEmptyLabel: true});
      loggedScore.current = currentScore;
    }
  };

  if (!activityStarted || scoreType === NO_SCORE || scoreType === AUTOMATIC_SCORE) {
    return null;
  }

  if (scoreType === MANUAL_SCORE) {
    return (
      <ScoreInput
        score={score}
        minScore={0}
        disabled={false}
        className={css.activityFeedbackScore}
        onChange={handleChange}
        onBlur={handleBlur}
      >
        <div className={css.scoreLabel}>Score</div>
      </ScoreInput>
    );
  }

  const displayScore = getRubricDisplayScore(rubric, rubricFeedback);

  return (
    <div className={css.activityFeedbackScore}>
      <div className={css.scoreLabel}>Score</div>
      <div>{displayScore}</div>
    </div>
  );

};

