import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { connect } from 'react-redux'

import '../../css/answer-feedback.less'


@pureRender
class Feedback extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  feedbackEnabled() {
    return this.props.question.get("feedbackEnabled")
  }

  scoreEnabled() {
    return this.props.question.get("scoreEnabled")
  }

  getLatestFeedback() {
    const feedbackKey = this.props.answer.get('feedbacks') && this.props.answer.get('feedbacks').last()
    return this.props.feedbacks.get(feedbackKey)
  }

  renderScore(feedback) {
    const score = feedback.get("score")
    if(this.scoreEnabled()) {
      return (
        <div className="feedback-section score">
          <h1>
            Score:
          </h1>
          <span className="score">
            {score}
          </span>
        </div>
     )
    }
    return ""
  }

  renderFeedback(feedback) {
    if(this.feedbackEnabled()) {
      return (
        <div className="feedback-section written-feedback">
          <h1>
            Teacher Feedback:
          </h1>
          <span>
            {feedback.get("feedback")}
          </span>
        </div>
      )
    }
    return ""
  }

  render() {
    const forWho = this.props.for || ""  // student or teacher
    const className = `answer-feedback ${forWho}`
    const feedback = this.getLatestFeedback()
    const feedbackDisabled = !(this.feedbackEnabled() || this.scoreEnabled())
    const hasBeenReviewed = feedback && feedback.get('hasBeenReviewed')
    const noFeedbackMessage = this.props.answer.get('answered') ?
      "No Feedback yet." :
      "Not answered yet."
    if (feedbackDisabled) {
      return (<div className={`${className} disabled`}>No feedback yet.</div>)
    }

    else if (hasBeenReviewed) {
      return (
        <div className={className}>
          {this.renderFeedback(feedback)}
          {this.renderScore(feedback)}
        </div>
      )
    }

    else {
      return (<div className={className}>{noFeedbackMessage}</div>)
    }
  }
}


function mapStateToProps(state) {
  return { feedbacks: state.get('feedbacks') }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(Feedback)
