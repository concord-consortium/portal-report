import React from "react";
import { Map } from "immutable";
import AwaitingFeedbackActivityBadgeIcon from "../../../../img/svg-icons/awaiting-feedback-activity-badge-icon.svg";
import GivenFeedbackActivityBadgeIcon from "../../../../img/svg-icons/given-feedback-activity-badge-icon.svg";
import AwaitingFeedbackQuestionBadgeIcon from "../../../../img/svg-icons/awaiting-feedback-question-badge-icon.svg";
import GivenFeedbackQuestionBadgeIcon from "../../../../img/svg-icons/given-feedback-question-badge-icon.svg";
import UpdateFeedbackQuestionBadgeIcon from "../../../../img/svg-icons/update-feedback-question-badge-icon.svg";
import { FeedbackLevel } from "../../../util/misc";
import { FeedbackNoteToggle } from "./feedback-note-toggle";
import { FeedbackSettingsToggle } from "./feedback-settings-toggle";
import { ScoringSettings } from "../../../util/scoring";
import { NO_SCORE } from "../../../util/scoring-constants";

import css from "../../../../css/portal-dashboard/feedback/feedback-legend.less";

interface IProps {
  feedbackLevel: FeedbackLevel;
  activity: Map<any, any>;
  scoringSettings: ScoringSettings;
}

export const FeedbackLegend: React.FC<IProps> = (props) => {
  const { feedbackLevel, activity, scoringSettings } = props;
  const awaitingFeedbackIcon = feedbackLevel === "Activity"
                               ? <AwaitingFeedbackActivityBadgeIcon />
                               : <AwaitingFeedbackQuestionBadgeIcon />;
  const givenFeedbackIcon = feedbackLevel === "Activity"
                            ? <GivenFeedbackActivityBadgeIcon />
                            : <GivenFeedbackQuestionBadgeIcon />;
  const updateFeedbackIcon = <UpdateFeedbackQuestionBadgeIcon />;
  const showAvgScore = scoringSettings.scoreType !== NO_SCORE;

  return (
    <aside className={css.feedbackBadgeLegend} data-cy="feedback-badge-legend">
      <div className={css.feedbackBadgeLegend__heading_container}>
        <h2 className={css.feedbackBadgeLegend__heading}>{feedbackLevel}-level Feedback Key</h2>
        <FeedbackNoteToggle feedbackLevel={feedbackLevel} />
      </div>
      <dl className={css.feedbackBadgeLegend__list}>
        <dt>{awaitingFeedbackIcon}</dt>
        <dd>Awaiting feedback</dd>
        <dt>{givenFeedbackIcon}</dt>
        <dd>Feedback given</dd>
        { feedbackLevel === "Question" &&
          <React.Fragment>
            <dt>{updateFeedbackIcon}</dt>
            <dd>Student answer updated since feedback given</dd>
          </React.Fragment>
        }
      </dl>
      {feedbackLevel === "Activity" &&
        <div className={css.feedbackBadgeLegend__rubric}>
          <div className={css.feedbackBadgeLegend__rubric_settings}>
            <FeedbackSettingsToggle activity={activity} scoringSettings={scoringSettings} />
          </div>
          <div className={css.feedbackBadgeLegend__rubric_score}>
            {showAvgScore && <div className={css.feedbackBadgeLegend__rubric_score_avg}>
              Avg. Score:
              <div className={css.feedbackBadgeLegend__rubric_score_avg_value}>TBD</div>
            </div>}
            <div className={css.feedbackBadgeLegend__rubric_summary}>
              Summary:
              <div className={css.feedbackBadgeLegend__rubric_summary_icon}>
                TBD
              </div>
            </div>
          </div>
        </div>
      }
    </aside>
  );
};
