import React from "react";
import AwaitingFeedbackBadgeIcon from "../../../img/svg-icons/awaiting-feedback-badge-icon.svg";
import GivenFeedbackBadgeIcon from "../../../img/svg-icons/given-feedback-badge-icon.svg";
import UpdateFeedbackBadgeIcon from "../../../img/svg-icons/update-feedback-badge-icon.svg";

import css from "../../../css/portal-dashboard/feedback/feedback-legend.less";

interface IProps {
  feedbackLevel: "Activity" | "Question";
}

export const FeedbackLegend: React.FC<IProps> = (props) => {
  return (
    <aside className={css.feedbackBadgeLegend}>
    <h2 className={css.feedbackBadgeLegend__heading}>Question-level Feedback Key</h2>
    <dl className={css.feedbackBadgeLegend__list}>
      <dt><AwaitingFeedbackBadgeIcon /></dt>
      <dd>Awaiting feedback</dd>
      <dt><GivenFeedbackBadgeIcon /></dt>
      <dd>Feedback given</dd>
      { props.feedbackLevel === "Question" && 
        <React.Fragment>
          <dt><UpdateFeedbackBadgeIcon /></dt>
          <dd>Student answer updated since feedback given</dd>
        </React.Fragment>
      }
    </dl>
  </aside>
  );
};
