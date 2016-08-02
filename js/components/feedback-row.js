import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { updateFeedback } from '../actions'
import { connect } from 'react-redux'

@pureRender
class FeedbackRow extends Component {

  constructor(props) {
    super(props)
    this.state = {
      disableComplete: true
    }
    this.scoreChange = this.scoreChange.bind(this)
    this.feedbackChange = this.feedbackChange.bind(this)
    this.completeChange = this.completeChange.bind(this)
    this.changeFeedback = this.changeFeedback.bind(this)
  }

  changeFeedback(answerKey, feedback) {
    console.log(feedback)
    this.props.updateFeedback(answerKey, feedback)
  }

  scoreChange(e, answerKey) {
    this.changeFeedback(answerKey, {score: e.target.value})
  }

  feedbackChange(e, answerKey) {
    this.changeFeedback(answerKey, {feedback: e.target.value})
  }

  completeChange(e, answerKey) {
    this.changeFeedback(answerKey, {hasBeenReviewed: e.target.checked})
  }

  render() {
    const answer           = this.props.answer
    const name             = answer.get('student').get('realName')
    const answered         = answer.get('answered')  || false
    const allFeedbacks     = this.props.feedbacks
    const feedbackRecords  = answer.get('feedbacks').map( feedbackKey => allFeedbacks.get(feedbackKey))
    const feedbackRecord   = feedbackRecords.last()
    const answerKey        = feedbackRecord ? feedbackRecord.get('answerKey')        : null
    const feedback         = feedbackRecord ? feedbackRecord.get('feedback')         : "(no feedback)"
    const score            = feedbackRecord ? feedbackRecord.get('score')            : 0
    const complete         = feedbackRecord ? feedbackRecord.get('hasBeenReviewed')  : false
    const disableFeedback  = (!feedbackRecord) || complete
    const realAnswer       = answer.get('answer')

    return (
      <div className="feedback-row">
        <h3>{name}</h3>
        <div className="student-answer">
          <h4>{name}'s Answer</h4>
          <p>{realAnswer}</p>
        </div>
        <div className="feedback-interface">
          <h4>Your Feedback</h4>
          <div className="feedback-content">
            <textarea rows="10" cols="20" disabled={disableFeedback} onChange={(e) => this.feedbackChange(e, answerKey)} value={feedback} />
            <div className="score">Score <input disabled={disableFeedback} onChange={(e) => this.scoreChange(e, answerKey) } defaultvalue={score}/></div>
            <div className="feedback-complete">
              <input disabled={!answered} checked={complete} type="checkbox" onChange={(e) => this.completeChange(e, answerKey)}/> Feedback Complete
            </div>
          </div>
        </div>
      </div>
    )
  }

}



function mapStateToProps(state) {
  return { feedbacks: state.getIn(['report','feedbacks']) }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updateFeedback: (answerKey, feedback) => dispatch(updateFeedback(answerKey, feedback))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackRow)
