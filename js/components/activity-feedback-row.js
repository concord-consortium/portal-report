import React, { PureComponent } from 'react'
import Answer from './answer'
import FeedbackBox from './feedback-box'
import ScoreBox from './score-box'


export default class ActivityFeedbackRow extends PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      disableComplete: true
    }
    this.scoreChange = this.scoreChange.bind(this)
    this.completeChange = this.completeChange.bind(this)
    this.changeFeedback = this.changeFeedback.bind(this)
  }

  changeFeedback(answerKey, feedback) {
    this.props.updateFeedback(answerKey, feedback)
  }

  scoreChange(e, answerKey) {
    const value = parseInt(e.target.value) || 0
    this.changeFeedback(answerKey, {score: value})
  }

  completeChange(e, answerKey) {
    this.changeFeedback(answerKey, {hasBeenReviewed: e.target.checked})
  }

  renderFeedbackForm(answerKey, disableFeedback, feedback) {
    return  (
      <FeedbackBox
        rows="10"
        cols="20"
        disabled={disableFeedback}
        onChange={(textValue) => this.changeFeedback(answerKey, {feedback: textValue})}
        initialFeedback={feedback} />
    )
  }

  renderScore(answerKey, disableScore, score) {
    return(
      <ScoreBox
        disabled={disableScore}
        onChange={(value) => this.changeFeedback(answerKey, {score: value})}
        initialScore={score} />
    )
  }

  renderComplete(answerKey, complete) {
    return(
      <div className="feedback-complete">
        <input
          checked={complete}
          type="checkbox"
          onChange={(e) => this.completeChange(e, answerKey)}/>
        Feedback Complete
    </div>
    )
  }


  renderFeedbackSection(studentFeedback) {
    const allFeedbacks     = this.props.feedbacks
    const feedbackRecords  = studentFeedback.get('feedbacks')
    const feedbackRecord   = feedbackRecords.last()
    const answerKey        = feedbackRecord ? feedbackRecord.get('answerKey')             : null
    const feedback         = feedbackRecord ? feedbackRecord.get('feedback')              : "(no feedback)"
    const score            = parseInt(feedbackRecord ? feedbackRecord.get('score') : "0")

    const scoreEnabled     = this.props.scoreEnabled
    const feedbackEnabled  = this.props.feedbackEnabled
    const complete         = feedbackRecord ? feedbackRecord.get('hasBeenReviewed')  : false
    const disableFeedback  = (!feedbackRecord) || complete

    return (
      <div className="feedback-interface">
        <h4>Your Feedback</h4>
        <div className="feedback-content">
          { feedbackEnabled ? this.renderFeedbackForm(answerKey, disableFeedback, feedback) :  ""}
          { scoreEnabled ? this.renderScore(answerKey, disableFeedback, score) : "" }
          { feedbackEnabled || scoreEnabled ? this.renderComplete(answerKey, complete) : ""}
        </div>
      </div>
    )
  }

  render() {
    const studentActivityFeedback  = this.props.studentActivityFeedback
    const student = studentActivityFeedback.get("student")
    const name = student.get("realName")
    const link = "http://google.com/"
    return (
      <div className="feedback-row">
        <div className="student-answer">
          <h3>{name}'s work</h3>
          <p>
            <a href={link} target="_blank">
              Open {name}'s report
            </a>
          </p>
        </div>
        {this.renderFeedbackSection(studentActivityFeedback)}
      </div>
    )
  }

}

