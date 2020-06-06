import React from "react";

import css from "../../../css/portal-dashboard/student-responses-popup.less";

interface IProps {
    currentActivity: any;
}

export class PopupHeader extends React.PureComponent<IProps>{
    render() {
        // eslint-disable-next-line no-console
        console.log("current activity: ", this.props.currentActivity);

        return (
            <div className={css.popupHeader} data-cy="popup-header">
                <div className={css.headerLeft}>
                    <svg className={`${css.assignmentIcon} ${css.icon}`}>
                        <use xlinkHref={"#icon-assignment"} />
                    </svg>
                    <div className={css.title}>Hurricane Module V2 Activity 1:Hurricane Risk</div>
                </div>
                <div className={`${css.toggleResponsesFeedback}`}>
                    <div className={`${css.responseToggle} `}>
                        <svg className={`${css.icon} ${css.toggleIcon} ${css.responseIcon}`}>
                            <use xlinkHref={"#icon-group"} />
                        </svg>
                        <div className={`${css.toggleTitle} ${css.responseTitle} `}>All Student Responses</div>
                    </div>
                    <div className={`${css.feedbackToggle}  ${css.toggleOff}`}>
                        <div className={`${css.toggleTitle} ${css.feedbackTitle}  ${css.toggleOff}`}>Feedback to Students</div>
                        <svg className={`${css.icon} ${css.toggleIcon} ${css.feedbackIcon}  ${css.toggleOff}`}>
                            <use xlinkHref={"#icon-feedback-button"} />
                        </svg>
                    </div>
            </div>
                <div className={css.headerRight}>
                    <svg className={css.closeIcon}>
                        <use xlinkHref={"#icon-close"} />
                    </svg>
                </div>
            </div>
        );
    }
}