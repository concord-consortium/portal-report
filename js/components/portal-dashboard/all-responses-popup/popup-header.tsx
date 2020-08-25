import React from "react";
import AssignmentIcon from "../../../../img/svg-icons/assignment-icon.svg";
// Removed for MVP: import FeedbackIcon from "../../../../img/svg-icons/feedback-icon.svg";
import GroupIcon from "../../../../img/svg-icons/group-icon.svg";
import SmallCloseIcon from "../../../../img/svg-icons/small-close-icon.svg";

import css from "../../../../css/portal-dashboard/all-responses-popup/popup-header.less";

interface IProps {
  handleCloseAllResponsesPopup: (show: boolean) => void;
}
interface IState {
  inFeedbackMode: boolean;
}

export class PopupHeader extends React.PureComponent<IProps, IState>{

  state = {
    inFeedbackMode: false
  };

  render() {
    const popupHeaderClass: string = `${css.popupHeader}` + (this.state.inFeedbackMode? ` ${css.inFeedbackMode}` : "");

    return (
      <div className={popupHeaderClass} data-cy="popup-header">
        {this.renderHeaderLeft()}
        {this.renderResponseFeedbackToggle()}
        {this.renderHeaderRight()}
      </div>
    );
  }

  private renderHeaderLeft = () => {
    const activityName = "Hurricane Module V2 Activity 1: Hurricane Risk";
    return (
      <div className={css.headerLeft}>
        <AssignmentIcon className={`${css.assignmentIcon} ${css.icon}`} />
        <div className={css.title} data-cy="popup-header-title">{activityName}</div>
      </div>
    );
  }

  private renderResponseFeedbackToggle = () => {
    // Removed for MVP: const feedbackToggleClass: string = `${css.feedbackToggle}` + (!this.state.inFeedbackMode? ` ${css.toggleOff}` : "");
    const responsesToggleClass: string = `${css.responseToggle}` + (this.state.inFeedbackMode? ` ${css.toggleOff}` : "");

    return (
      <div className={`${css.toggleResponsesFeedback}`}>
        <div className={css.toggleHolder}>
          <div className={responsesToggleClass} id="responses-toggle" data-cy="all-students-responses-toggle" onClick={this.setFeedbackMode(false)}>
            <GroupIcon className={`${css.icon} ${css.toggleIcon} ${css.responseIcon}`} />
            <div className={`${css.toggleTitle} ${css.responseTitle} `}>All Student Responses</div>
          </div>
        </div>
        {/* Removed for MVP:
        <div className={css.toggleHolder}>
          <div className={feedbackToggleClass} id="feedback-toggle" data-cy="feedback-toggle" onClick = {this.setFeedbackMode(true)} >
            <div className={`${css.toggleTitle} ${css.feedbackTitle}`}>Feedback to Students</div>
            <FeedbackIcon className={`${css.icon} ${css.toggleIcon} ${css.feedbackIcon}`} />
          </div>
        </div>
        */ }
      </div>
    );
  }

  private setFeedbackMode = (value: boolean) => () => {
    this.setState({
      inFeedbackMode: value
    });
  }

  private renderHeaderRight = () => {
    const  closeIconClass: string = `${css.closeIcon}` + (this.state.inFeedbackMode?  ` ${css.inFeedbackMode}` : "");

    return (
      <div className={css.headerRight}>
        <div className={closeIconClass} data-cy="close-popup-button" onClick={this.handleCloseAllResponsesButtonClick}>
          <SmallCloseIcon className={css.closeIconSVG} />
        </div>
      </div>
    );
  }

  private handleCloseAllResponsesButtonClick = () => {
    this.props.handleCloseAllResponsesPopup(false);
  }
}
