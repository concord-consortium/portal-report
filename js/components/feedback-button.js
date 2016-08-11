import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import '../../css/feedback-button.less'


@pureRender
export default class FeedbackButton extends Component {

  render() {
    const {feedbackEnabled, needsReviewCount, showFeedback} = this.props
    const circleText = needsReviewCount > 0 ? needsReviewCount : "✔"
    const counterDiv = feedbackEnabled ? (<div className='need-review-count'> {circleText} </div>) : " "

    var countClassName =  needsReviewCount > 0 ? 'notification-circle' : 'notification-circle complete'

    countClassName  = feedbackEnabled ? countClassName : "notification-circle hidden"

    return (
      <div className='feedback-button cc-button' onClick={showFeedback}>
        <div className={countClassName}>
          {counterDiv}
        </div>
        Provide Feedback
      </div>
    )
  }
}