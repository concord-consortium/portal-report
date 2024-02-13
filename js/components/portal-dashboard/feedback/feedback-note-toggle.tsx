import React, { useState }  from "react";
import { FeedbackNoteModal } from "./feedback-note-modal";
import { FeedbackLevel } from "../../../util/misc";

import css from "../../../../css/portal-dashboard/feedback/feedback-note-toggle.less";

interface IProps {
  feedbackLevel: FeedbackLevel;
}

export const FeedbackNoteToggle: React.FC<IProps> = (props) => {
  const { feedbackLevel } = props;

  const [modalOpen, setModalOpen] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);

  const handleShowModal = (show: boolean) => () => {
    setButtonActive(!buttonActive);
    setModalOpen(show);
  };

  const noteLabel = props.feedbackLevel === "Activity" ? "activity-level" : "question-level";
  const title = `Note on ${noteLabel} feedback`;
  const buttonClass = buttonActive ? `${css.feedbackNoteToggleButton} ${css.active}` : css.feedbackNoteToggleButton;

  return (
    <div className={css.feedbackNoteToggle} data-cy="feedback-note-toggle">
      <button className={buttonClass} onClick={handleShowModal(true)} data-cy="feedback-note-toggle-button" title={title} />
      <FeedbackNoteModal
        backdrop={false}
        feedbackLevel={feedbackLevel}
        onHide={handleShowModal(false)}
        show={modalOpen}
      />
    </div>
  );
};
