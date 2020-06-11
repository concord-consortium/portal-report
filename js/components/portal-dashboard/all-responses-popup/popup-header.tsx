import React from "react";

import css from "../../../../css/portal-dashboard/all-responses-popup/popup-header.less";

interface IState {
    inFeedbackMode: boolean;
  }

export class PopupHeader extends React.PureComponent<IState>{
    constructor() {
        super();
        this.state = {
            inFeedbackMode: false
        };
    }

    render() {
        // const activityName = this.props.activityName;  Activity name should be passed in
        const activityName = "Hurricane Module V2 Activity 1: Hurricane Risk";
        let feedbackToggleClass: any,
            popupHeaderClass: any,
            responsesToggleClass: any,
            closeIconClass: any;
        if (!this.state.inFeedbackMode) {
                feedbackToggleClass =css.feedbackToggle+ " " + css.toggleOff;
                popupHeaderClass = css.popupHeader;
                responsesToggleClass = css.responseToggle;
                closeIconClass = css.closeIcon;
        } else {
            feedbackToggleClass = css.feedbackToggle;
            popupHeaderClass = css.popupHeader + " " + css.inFeedbackMode;
            responsesToggleClass = css.responseToggle + " " + css.toggleOff;
            closeIconClass = css.closeIcon + " " + css.inFeedbackMode;
        }
        return (
            <div className={popupHeaderClass} data-cy="popup-header">
                <div className={css.headerLeft}>
                    <svg className={`${css.assignmentIcon} ${css.icon}`}>
                        <use xlinkHref={"#icon-assignment"} />
                    </svg>
                    <div className={css.title}>{activityName}</div>
                </div>
                <div className={`${css.toggleResponsesFeedback}`}>
                    <div className={responsesToggleClass} data-cy="all-students-responses-toggle" onClick={this.handleResponsesToggleClick}>
                        <svg className={`${css.icon} ${css.toggleIcon} ${css.responseIcon}`}>
                            <use xlinkHref={"#icon-group"} />
                        </svg>
                        <div className={`${css.toggleTitle} ${css.responseTitle} `}>All Student Responses</div>
                    </div>
                    <div className={feedbackToggleClass} data-cy="feedback-toggle" onClick={this.handleFeedbackToggleClick}>
                        <div className={`${css.toggleTitle} ${css.feedbackTitle}`}>Feedback to Students</div>
                        <svg className={`${css.icon} ${css.toggleIcon} ${css.feedbackIcon}`}>
                            <use xlinkHref={"#icon-feedback-button"} />
                        </svg>
                    </div>
                </div>
                <div className={css.headerRight}>
                    <div className={closeIconClass} data-cy="close-popup-button">
                        <svg className={css.closeIconSVG}>
                            <use xlinkHref={"#icon-close"} />
                        </svg>
                    </div>
                </div>
            </div>
        );
    }

    private handleFeedbackToggleClick=()=>{
        if(!this.state.inFeedbackMode){
            this.setState({
                inFeedbackMode: !this.state.inFeedbackMode
              });
        }
    }
    private handleResponsesToggleClick=()=>{
        if(this.state.inFeedbackMode){
            this.setState({
                inFeedbackMode: !this.state.inFeedbackMode
              });
        }
    }
}
