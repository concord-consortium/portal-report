import React, { PureComponent } from 'react'


import '../../css/activity-feedback.less'

export default class ActivityFeedbackForStudent extends PureComponent {

  render() {
    const student = this.props.student
    const feedback = this.props.feedbacks
      .find( (f) => f.get('studentId') == student.get('id'))
      .get('feedbacks')
      .first()
      .toJS()

    const showFeedback = (feedback && feedback.hasBeenReviewed)

    const feedbackDiv =
      <div className="feedback">
        <div className="feedback-section written-feedback">
          <h1>Overall Feedback:</h1>
          <span>{feedback.feedback}</span>
        </div>
        <div className="feedback-section score">
          <h1>Overall Score:</h1>
          <span className="score">{feedback.score}</span>
        </div>
      </div>

    const noFeedbackDiv =
      <div className="feedback noFeedback">
        No overall feedback yet.
      </div>

    const displayDiv = showFeedback ? feedbackDiv : noFeedbackDiv
    return(
      <div className="activity-feedback">
        { displayDiv }
      </div>
    )
  }
}
