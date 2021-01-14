import React from "react";
import { FeedbackLevel } from "../../../util/misc";

import css from "../../../../css/portal-dashboard/feedback/feedback-note-toggle.less";

interface IProps {
  feedbackLevel: FeedbackLevel;
}

export const FeedbackNoteToggle: React.FC<IProps> = (props) => {

  const handleFeedbackNoteButtonClick = () => {
    // show feedback note modal
  };

  const noteLabel = props.feedbackLevel === "Activity" ? "activity-level" : "question-level";

  return (
    <div className={css.feedbackNoteToggle}>
      <button className={css.feedbackNoteToggle__button} onClick={handleFeedbackNoteButtonClick}></button> <div>Note on {noteLabel} feedback</div>
    </div>
  );
};
