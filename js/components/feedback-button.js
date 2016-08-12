import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import '../../css/feedback-button.less'


@pureRender
export default class FeedbackButton extends Component {

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