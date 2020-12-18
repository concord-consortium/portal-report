import React from "react";
import AwaitingFeedbackActivityBadgeIcon from "../../../img/svg-icons/awaiting-feedback-activity-badge-icon.svg";
import GivenFeedbackActivityBadgeIcon from "../../../img/svg-icons/given-feedback-activity-badge-icon.svg";
import AwaitingFeedbackQuestionBadgeIcon from "../../../img/svg-icons/awaiting-feedback-question-badge-icon.svg";
import GivenFeedbackQuestionBadgeIcon from "../../../img/svg-icons/given-feedback-question-badge-icon.svg";
import UpdateFeedbackQuestionBadgeIcon from "../../../img/svg-icons/update-feedback-question-badge-icon.svg";

import css from "../../../css/portal-dashboard/feedback/feedback-legend.less";

interface IProps {
  feedbackLevel: "Activity" | "Question";
}

export const FeedbackLegend: React.FC<IProps> = (props) => {
  const {feedbackLevel} = props;
  const awaitingFeedbackIcon = feedbackLevel === "Activity" ? <AwaitingFeedbackActivityBadgeIcon /> : <AwaitingFeedbackQuestionBadgeIcon />;
  const givenFeedbackIcon = feedbackLevel === "Activity" ? <GivenFeedbackActivityBadgeIcon /> : <GivenFeedbackQuestionBadgeIcon />;
  const updateFeedbackIcon = <UpdateFeedbackQuestionBadgeIcon />;

  return (
    <aside className={css.feedbackBadgeLegend}>
    <h2 className={css.feedbackBadgeLegend__heading}>{feedbackLevel}-level Feedback Key</h2>
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
  </aside>
  );
};
