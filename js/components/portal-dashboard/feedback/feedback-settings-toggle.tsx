import React, { useState }  from "react";
import { Map } from "immutable";
import classNames from "classnames";
import FeedbackSettingsModal from "./feedback-settings-modal";
import { ScoringSettings } from "../../../util/scoring";
import { TrackEventFunction } from "../../../actions";

import css from "../../../../css/portal-dashboard/feedback/feedback-settings-toggle.less";

interface IProps {
  activity: Map<any, any>;
  scoringSettings: ScoringSettings;
  feedbacks: any;
  trackEvent: TrackEventFunction;
  isResearcher: boolean;
}

export const FeedbackSettingsToggle: React.FC<IProps> = (props) => {
  const { activity, scoringSettings, feedbacks, trackEvent, isResearcher } = props;
  const [modalOpen, setModalOpen] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);

  const handleShowModal = (show: boolean) => () => {
    // researchers can't change the settings
    if (isResearcher) {
      return;
    }
    if (show) {
      trackEvent("Portal-Dashboard", "OpenActivityScoreSettings", {label: activity.get("id")});
    }
    setButtonActive(!buttonActive);
    setModalOpen(show);
  };

  const title = "Activity score settings";
  const buttonClass = classNames(css.feedbackSettingsToggleButton, {
    [css.active]: buttonActive,
    [css.notClickable]: isResearcher
  });

  return (
    <div className={css.feedbackSettingsToggle} data-cy="feedback-settings-toggle">
      <button className={buttonClass} onClick={handleShowModal(true)} data-cy="feedback-settings-toggle-button" title={title} />
      <div className={css.feedbackSettingsLabel}>Activity Score:</div> <div className={css.feedbackSettingsValue}>{scoringSettings.scoreType}</div>
      {modalOpen && <FeedbackSettingsModal
        activity={activity}
        backdrop={false}
        onHide={handleShowModal(false)}
        show={true}
        scoringSettings={scoringSettings}
        feedbacks={feedbacks}
        trackEvent={trackEvent}
      />}
    </div>
  );
};
