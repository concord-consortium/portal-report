import React from "react";
import { ToggleControl } from "./toggle-control";

import css from "../../../css/portal-dashboard/feedback/feedback-controls.less";

interface IProps {
  provideWrittenFeedback: boolean;
  setProvideWrittenFeedback: (value: boolean) => void;
  giveScore: boolean;
  setGiveScore: (value: boolean) => void;
  scoringType: string;
  setScoringType: (value: string) => void;
  maxScore: number;
  setMaxScore: (value: number) => void;
}

export const FeedbackControls: React.FC<IProps> = (props) => {
  return (
    <div className={css.feedbackControls}>
      <div className={css.titleWrapper}>
        <div className={css.title}>Feedback Level:</div>
      </div>
      <div className={css.provideWrittenFeedback} data-cy="provide-written-feedback">
        <ToggleControl id="writtenFeedbackToggle" toggleState={props.provideWrittenFeedback} onToggle={props.setProvideWrittenFeedback}/>
        <label htmlFor="writtenFeedbackToggle" className={css.label}>
          Provide written feedback
        </label>
      </div>
      <div className={css.giveScore} data-cy="give-score">
        <ToggleControl id="giveScoreToggle" toggleState={props.giveScore} onToggle={props.setGiveScore}/>
        <label htmlFor="giveScoreToggle" className={css.label}>
          Give score
        </label>
      </div>
      <div className={css.scoring} data-cy="scoring">
        <div className={css.manualScoring} data-cy="manual-scoring">
          <input type="radio" name="scoringType[]" value="manual" checked={props.scoringType === "manual"} onSelect={props.setScoringType}/>
          <label htmlFor="scoringTypeManual" className={css.label}>
            Manual scoring
          </label>
          <div className={css.maxScore}>
            <label htmlFor="maxScore">Max. score:</label>
            <input id="maxScore" name="maxScore" />
          </div>
        </div>
        <div className={css.autoScoring} data-cy="automatic-scoring">
          <input type="radio" id="scoringTypeAutomatic" name="scoringType[]" value="automatic" checked={props.scoringType === "automcatic"} onSelect={props.setScoringType}/>
          <label htmlFor="scoringTypeAutomatic" className={css.label}>
            Automatic score from questions
          </label>
        </div>
      </div>
    </div>
  );
};