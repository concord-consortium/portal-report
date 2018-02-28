import React, { PureComponent } from 'react'
import RubricBox from "./rubric-box"
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
    const value = parseInt(e.target.value, 10) || 0
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
        score={score} />
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
    const { studentActivityFeedback }  = this.props
    const feedbackRecord  = studentActivityFeedback.get('feedbacks').first()
    let scoreString = ""
    let feedback = ""
    let complete = false
    if (feedbackRecord) {
      scoreString = feedbackRecord.get('score')
      feedback = feedbackRecord.get('feedback')
      complete = feedbackRecord.get('hasBeenReviewed')
    }
    const score = parseInt(scoreString, 10) || 0

    return {
      score,
      feedback,
      complete,
      learnerId: this.props.studentActivityFeedback.get("learnerId"),
      activityFeedbackId: this.props.activityFeedbackId
    }
  }

  renderFeedbackSection(studentFeedback) {
    const activityFeedbackKey  = studentFeedback.get('key')

    const {feedback, score, complete, learnerId }  = this.fieldValues()
    const {useRubric, feedbackEnabled, scoreType, autoScore} = this.props
    const scoreEnabled     = scoreType != 'none'
    const automaticScoring = scoreType == 'auto'

    const disableFeedback  = !learnerId || complete
    const disableScore     = disableFeedback || automaticScoring
    const scoreToRender    = automaticScoring ? autoScore : score

    return (
      <div className="feedback-interface">
        <h4>Your Feedback</h4>
        <div className="feedback-content">
          {
            useRubric
              ? <RubricBox rubric={this.props.rubric} />
              : null
          }
          {
            feedbackEnabled
              ? this.renderFeedbackForm(activityFeedbackKey, disableFeedback, feedback)
              :  ""
          }
          {
            scoreEnabled
              ? this.renderScore(activityFeedbackKey, disableScore, scoreToRender)
              : ""
          }
          {
            feedbackEnabled || scoreEnabled || useRubric
              ? this.renderComplete(activityFeedbackKey, complete)
              : ""
          }
        </div>
      </div>
    )
  }

  render() {
    const { studentActivityFeedback } = this.props
    const student = studentActivityFeedback.get("student")
    const name = student.get("realName")
    const learnerId = studentActivityFeedback.get("learnerId")

    const noFeedbackSection =
      <p>
        This user hasn't finished yet.
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
