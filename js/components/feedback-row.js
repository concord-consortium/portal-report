import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

@pureRender
export default class FeedbackRow extends Component {

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
    this.props.updateFeedback(answerKey, feedback)
  }

  scoreChange(e, answerKey) {
    const value = parseInt(e.target.value) || null
    this.changeFeedback(answerKey, {score: value})
  }

  feedbackChange(e, answerKey) {
    this.changeFeedback(answerKey, {feedback: e.target.value})
  }

  completeChange(e, answerKey) {
    this.changeFeedback(answerKey, {hasBeenReviewed: e.target.checked})
  }

  renderFeedbackForm(answerKey, disableFeedback, feedback) {
    return  (
      <textarea
        rows="10"
        cols="20"
        disabled={disableFeedback}
        onChange={(e) => this.feedbackChange(e, answerKey)} value={feedback} />
    )
  }

  renderScore(answerKey, disableFeedback, score) {
    return(
      <div className="score">
        Score
        <input
          disabled={disableFeedback}
          onChange={(e) => this.scoreChange(e, answerKey) } value={score}/>
      </div>
    )
  }
  renderComplete(answerKey, answered, complete) {
    return(
      <div className="feedback-complete">
        <input
          disabled={!answered}
          checked={complete}
          type="checkbox"
          onChange={(e) => this.completeChange(e, answerKey)}/>
        Feedback Complete
    </div>
    )
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
    const score            = feedbackRecord ? parseInt(feedbackRecord.get('score')) || ""            : 0
    const complete         = feedbackRecord ? feedbackRecord.get('hasBeenReviewed')  : false
    const disableFeedback  = (!feedbackRecord) || complete
    const realAnswer       = answer.get('answer')
    const scoreEnabled     = this.props.scoreEnabled
    const feedbackEnabled  = this.props.feedbackEnabled
    return (
      <div className="feedback-row">
        <div className="student-answer">
          <h3>{name}'s Answer</h3>
          <p>{realAnswer}</p>
        </div>
        <div className="feedback-interface">
          <h4>Your Feedback</h4>
          <div className="feedback-content">
            { feedbackEnabled ? this.renderFeedbackForm(answerKey, disableFeedback, feedback) : "" }
            { scoreEnabled ? this.renderScore(answerKey, disableFeedback, score) : "" }
            { feedbackEnabled || scoreEnabled ? this.renderComplete(answerKey, answered, complete) : ""}

          </div>
        </div>
      </div>
    )
  }

}

