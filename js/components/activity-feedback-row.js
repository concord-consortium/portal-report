import React, { PureComponent } from 'react'
import Answer from './answer'
import FeedbackBox from './feedback-box'
import ScoreBox from './score-box'
import StudentReportLink from './student-report-link'

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

  changeFeedback(answerKey, newData) {
    const oldData = this.fieldValues()
    this.props.updateFeedback(answerKey, Object.assign({}, oldData, newData))
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

  fieldValues() {
    const studentActivityFeedback  = this.props.studentActivityFeedback
    const feedbackRecord           = studentActivityFeedback.get('feedbacks').first()
    return {
      learnerId:          this.props.studentActivityFeedback.get("learnerId"),
      activityFeedbackId: this.props.activityFeedbackId,
      score:              parseInt(feedbackRecord ? feedbackRecord.get('score') : "0"),
      feedback:           feedbackRecord ? feedbackRecord.get('feedback') : "",
      complete:           feedbackRecord ? feedbackRecord.get('hasBeenReviewed')  : false
    }
  }

  renderFeedbackSection(studentFeedback) {
    const activityFeedbackKey  = studentFeedback.get('key')

    const {feedback, score, complete, learnerId}  = this.fieldValues()

    const scoreEnabled     = this.props.scoreEnabled
    const feedbackEnabled  = this.props.feedbackEnabled

    const disableFeedback  = (!learnerId) || complete

    return (
      <div className="feedback-interface">
        <h4>Your Feedback</h4>
        <div className="feedback-content">
          { feedbackEnabled ? this.renderFeedbackForm(activityFeedbackKey, disableFeedback, feedback) :  ""}
          { scoreEnabled ? this.renderScore(activityFeedbackKey, disableFeedback, score) : "" }
          { feedbackEnabled || scoreEnabled ? this.renderComplete(activityFeedbackKey, complete) : ""}
        </div>
      </div>
    )
  }

  render() {
    const studentActivityFeedback  = this.props.studentActivityFeedback
    const student = studentActivityFeedback.get("student")
    const name = student.get("realName")
    const link = "http://google.com/"
    const learnerId = studentActivityFeedback.get("learnerId")

    const noFeedbackSection =
      <p>
        This user hasn't started yet
      </p>

    const feedback = learnerId
      ? this.renderFeedbackSection(studentActivityFeedback)
      : noFeedbackSection

    return (
      <div className="feedback-row">
        <div className="student-answer">
          <h3>{name}'s work</h3>
          <p>
            <StudentReportLink student={student} started={learnerId} />
          </p>
        </div>
        {feedback}
      </div>
    )
  }

}

