import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import '../../css/feedback-button.less'


@pureRender
export default class FeedbackButton extends Component {

  render() {
    const {needsReviewCount, showFeedback} = this.props
    const countClassName =  needsReviewCount > 0 ? 'notification-circle' : 'notification-circle complete'
    const circleText = needsReviewCount > 0 ? needsReviewCount : "✔"
    return (
      <div className='feedback-button cc-button' onClick={showFeedback}>
        <div className={countClassName}>
          <div className='need-review-count'> {circleText} </div>
        </div>
        Provide Feedback
      </div>
    )
  }
}