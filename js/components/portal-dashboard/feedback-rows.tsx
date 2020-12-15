import React from "react";

import css from "../../../css/portal-dashboard/feedback/feedback-rows.less";

interface IProps {
  feedback: any;
}

export const FeedbackRows: React.FC<IProps> = (props) => {
  return (
    <div className={css.feedbackRows}>
      Feedback rows go here.
    </div>
  );
};
