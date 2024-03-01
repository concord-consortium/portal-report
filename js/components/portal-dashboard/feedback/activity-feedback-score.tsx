import React, { useState, useCallback } from "react";
import { throttle } from "lodash";
import { TrackEventFunction } from "../../../actions";
import { ScoreInput } from "./score-input";
import { ScoringSettings } from "../../../util/scoring";
import { MANUAL_SCORE, NO_SCORE } from "../../../util/scoring-constants";

interface IProps {
  activityId: string | null;
  activityIndex: number;
  activityStarted: boolean;
  score: number;
  setFeedbackSortRefreshEnabled: (value: boolean) => void;
  studentId: string;
  updateActivityFeedback?: (activityId: string, activityIndex: number, platformStudentId: string, feedback: any) => void;
  trackEvent: TrackEventFunction;
  className: string;
  scoringSettings: ScoringSettings;
}

export const ActivityFeedbackScore: React.FC<IProps> = (props) => {
  const { activityId, activityIndex, activityStarted, score, studentId, updateActivityFeedback, trackEvent, className, scoringSettings } = props;
  const scoreType = scoringSettings.scoreType ?? NO_SCORE;
  const [ scoreChanged, setScoreChanged ] = useState(false);

  const handleScoreChange = (newScore: number) => {
    setScoreChanged(true);
    updateScoreThrottledAndNotLogged(newScore);
  };

  const updateScore = (score: number, logUpdate?: boolean) => {
    if (activityId && studentId && updateActivityFeedback) {
      if (logUpdate) {
        trackEvent("Portal-Dashboard", "AddActivityLevelScore", { label: `${score}`, parameters: { activityId, studentId }});
      }
      props.setFeedbackSortRefreshEnabled(true);
      updateActivityFeedback(activityId, activityIndex, studentId, {score, hasBeenReviewed: true});
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateScoreThrottledAndNotLogged = useCallback(throttle((score: number) => updateScore(score, false), 2000), []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateScoreLogged = useCallback((score: number) => updateScore(score, true), []);

  if (!activityStarted || scoreType === NO_SCORE) {
    return null;
  }

  if (scoreType === MANUAL_SCORE) {
    return (
      <ScoreInput
        score={score}
        minScore={0}
        disabled={false}
        className={className}
        onChange={handleScoreChange}
        onBlur={scoreChanged ? updateScoreLogged : undefined}
      >
        <div>Score</div>
      </ScoreInput>
    );
  }

  // const displayScore = score; // TBD: get autoscore

  return (
    <div>
      <div>Score</div>
      <div style={{fontWeight: "bold"}}>TBD</div>
    </div>
  );

};
