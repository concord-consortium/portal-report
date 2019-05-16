import React, { PureComponent } from "react";

import "../../../css/report/feedback-button.less";

export default class FeedbackButton extends PureComponent {
  render() {
    const text = this.props.text || "Provide Feedback";
    const {disabled, feedbackEnabled, needsReviewCount, showFeedback} = this.props;

    const circleText = needsReviewCount > 0 ? needsReviewCount : "✔";
    const counterDiv = feedbackEnabled ? (<div className="need-review-count"> {circleText} </div>) : " ";
    const buttonClass = disabled ? "feedback-button cc-button disabled" : "feedback-button cc-button";
    const clickAction = disabled ? () => {} : showFeedback;
    let countClassName = needsReviewCount > 0 ? "notification-circle" : "notification-circle complete";
    countClassName = feedbackEnabled && (!disabled) ? countClassName : "notification-circle hidden";

    return (
      <div className={buttonClass} onClick={clickAction} data-cy="feedbackButton">
        <div className={countClassName}>
          {counterDiv}
        </div>
        {text}
      </div>
    );
  }
}
