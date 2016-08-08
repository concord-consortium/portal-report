import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import '../../css/feedback-overview.less'

@pureRender
export default class FeedbackOverview extends Component {

  render() {
    const numNoAnswers     = this.props.numNoAnswers
    const numNeedsFeedback = this.props.numNeedsFeedback
    const numFeedbackGiven = this.props.numFeedbackGiven
    return (
      <div className="feedback-overview">
        <div>
          <span className="label">Students awaiting feedback</span>
          <span className="value">{numNeedsFeedback}</span>
        </div><div>
          <span className="label">Students scored/provided feedback</span>
          <span className="value">{numFeedbackGiven}</span>
        </div><div>
          <span className="label">Students with no answer</span>
          <span className="value">{numNoAnswers}</span>
        </div>
      </div>
    )
  }

}