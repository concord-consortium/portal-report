import React from "react";
import { Map } from "immutable";
import { FeedbackLegend } from "../../../components/portal-dashboard/feedback/feedback-legend";
import { FeedbackLevel, ListViewMode } from "../../../util/misc";
import { ScoringSettings } from "../../../util/scoring";

import css from "../../../../css/portal-dashboard/feedback/feedback-info.less";

interface IProps {
  feedbackLevel: FeedbackLevel;
  listViewMode: ListViewMode;
  setFeedbackLevel: (value: string) => void;
  activity: Map<any, any>;
  scoringSettings: ScoringSettings;
}

export const FeedbackInfo: React.FC<IProps> = (props) => {
  const {activity, feedbackLevel, listViewMode, setFeedbackLevel, scoringSettings } = props;

  const handleActivityButtonClick = () => {
    setFeedbackLevel("Activity");
  };

  const handleQuestionButtonClick = () => {
    setFeedbackLevel("Question");
  };

  const activityButtonClass = feedbackLevel === "Activity"
                              ? css.active + " " + css.viewToggleButtonActivity
                              : css.viewToggleButtonActivity;
  const questionButtonClass = feedbackLevel !== "Activity"
                              ? css.active + " " + css.viewToggleButtonQuestion
                              : css.viewToggleButtonQuestion;

  return (
    <div className={css.feedbackInfo} data-cy="feedback-info">
      <div className={css.titleWrapper}>
        <div className={css.title}>Feedback Level:</div>
        <div className={css.viewToggle}>
          <button className={activityButtonClass} onClick={handleActivityButtonClick} disabled={listViewMode === "Question"} data-cy="activity-level-feedback-button">
            Activity
          </button>
          <button className={questionButtonClass} onClick={handleQuestionButtonClick} data-cy="question-level-feedback-button">
            Questions
          </button>
        </div>
      </div>
      <FeedbackLegend feedbackLevel={feedbackLevel} activity={activity} scoringSettings={scoringSettings} />
    </div>
  );

};

