import React, { PureComponent } from 'react'

import '../../css/feedback-button.less'


export default class FeedbackButton extends PureComponent {

  render() {
    const {disabled, feedbackEnabled, needsReviewCount, showFeedback} = this.props

    const circleText = needsReviewCount > 0 ? needsReviewCount : "✔"
    const counterDiv = feedbackEnabled ? (<div className='need-review-count'> {circleText} </div>) : " "
    const buttonClass = disabled ? 'feedback-button cc-button disabled' : 'feedback-button cc-button'
    const clickAction = disabled ? () => {} : showFeedback
    let countClassName =  needsReviewCount > 0 ? 'notification-circle' : 'notification-circle complete'
    countClassName  = feedbackEnabled && (!disabled) ? countClassName : "notification-circle hidden"

    return (
      <div className={buttonClass} onClick={clickAction}>
        <div className={countClassName}>
          {counterDiv}
        </div>
        Provide Feedback
      </div>
    )
  }
}