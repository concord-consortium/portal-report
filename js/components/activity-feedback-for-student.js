import React, { PureComponent } from 'react'
import '../../css/activity-feedback.less'
import '../../css/activity-feedback-for-student.less'

export default class ActivityFeedbackForStudent extends PureComponent {
  renderRubricSection (feedback) {
    const { useRubric } = this.props
    const rubricFeedbacks = feedback.rubricFeedbacks || [
      {
        description: `Evaluate the explaination based on data on the transfer
                      of energy and matter to and from producers about the claim
                      evidence and reasining in the explaination`,
        rating: '– Proficient' },
      {
        description: `Identifty specific evidence from data on the transfer
                      energy and or mater to and from the producers.`,
        rating: '– Begining'
      }
    ]

    if (useRubric && rubricFeedbacks && rubricFeedbacks.length > 0) {
      return (
        <div className='rubricFeedback'>
          {
            rubricFeedbacks.map((r) => {
              return (
                <div className='criterion' key={r.label}>
                  <span className='description'>{r.description}</span>
                  <span className='rating'>{r.rating}</span>
                </div>
              )
            })
          }
        </div>
      )
    }
    return null
  }

  renderTextSection (feedback) {
    const { showText } = this.props
    if (showText) {
      return (
        <div className='feedback-section written-feedback'>
          <span>{feedback.feedback}</span>
        </div>
      )
    }
    return null
  }

  renderScoreSection (feedback) {
    const { showScore, maxScore, autoScore } = this.props
    const score = autoScore || feedback.score
    if (showScore) {
      return (
        <div className='feedback-section score'>
          <span className='scoreLabel'>Overall Score:</span>
          <span className='studentScore'> {score} </span>
          of
          <span className='maxScore'> {maxScore} </span>
        </div>
      )
    }
    return null
  }

  render () {
    const {student, feedbacks, feedbackEnabled} = this.props
    let feedback = null

    if (!feedbackEnabled) { return <div /> }
    const _feedbacks = feedbacks
      .find((f) => f.get('studentId') === student.get('id'))

    if (_feedbacks) {
      const fblist = _feedbacks.get('feedbacks')
      if (fblist && fblist.size > 0) {
        feedback = fblist.first().toJS()
      }
    }

    const showFeedback = (feedback && feedback.hasBeenReviewed)
    // const showFeedback = true
    const feedbackDiv =
      <div className='actFeedbackPanel'>
        <div className='heading'>Teacher Feedback:</div>
        { this.renderRubricSection(feedback) }
        { this.renderTextSection(feedback) }
        { this.renderScoreSection(feedback) }
      </div>

    const noFeedbackDiv =
      <div className='heading'>
        No overall feedback yet.
      </div>

    const displayDiv = showFeedback ? feedbackDiv : noFeedbackDiv
    return (
      <div className='activity-feedback'>
        { displayDiv }
      </div>
    )
  }
}
