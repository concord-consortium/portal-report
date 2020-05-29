import React from "react";
import { ToggleControl } from "./toggle-control";

import css from "../../../css/portal-dashboard/feedback.less";

interface IProps {
  setFeedback?: () => void;
}

export const Feedback: React.FC<IProps> = (props) => {
  return (
    <div className={css.feedback} data-cy="students-feedback">
      <ToggleControl />
      <div className={css.label}>
        Feedback
      </div>
    </div>
  );
};
