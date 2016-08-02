import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

@pureRender
export default class FeedbackOverview extends Component {

  render() {
    const numNoAnswers     = this.props.numNoAnswers
    const numNeedsFeedback = this.props.numNeedsFeedback
    const numFeedbackGiven = this.props.numFeedbackGiven
    return (
      <div className="feedback-overview">
        <dl>
          <dt>Students awaiting feedback</dt>
          <dd>{numNeedsFeedback}</dd>
          <dt>Students scored/provided feedback</dt>
          <dd>{numFeedbackGiven}</dd>
          <dt>Students with no answer</dt>
          <dd>{numNoAnswers}</dd>
        </dl>
      </div>
    )
  }

}