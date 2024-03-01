import React, { useState }  from "react";
import { Map } from "immutable";
import FeedbackSettingsModal from "./feedback-settings-modal";

import css from "../../../../css/portal-dashboard/feedback/feedback-settings-toggle.less";

interface IProps {
  activity: Map<any, any>;
}

export const FeedbackSettingsToggle: React.FC<IProps> = (props) => {
  const { activity } = props;
  const [modalOpen, setModalOpen] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);

  const handleShowModal = (show: boolean) => () => {
    setButtonActive(!buttonActive);
    setModalOpen(show);
  };

  const title = "Activity score settings";
  const buttonClass = buttonActive ? `${css.feedbackSettingsToggleButton} ${css.active}` : css.feedbackSettingsToggleButton;

  return (
    <div className={css.feedbackSettingsToggle} data-cy="feedback-settings-toggle">
      <button className={buttonClass} onClick={handleShowModal(true)} data-cy="feedback-settings-toggle-button" title={title} />
      <div className={css.feedbackSettingsLabel}>Activity Score:</div> <div className={css.feedbackSettingsValue}>TDB</div>
      <FeedbackSettingsModal
        activity={activity}
        backdrop={false}
        onHide={handleShowModal(false)}
        show={modalOpen}
      />
    </div>
  );
};