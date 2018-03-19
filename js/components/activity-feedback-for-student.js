import React, { PureComponent } from 'react'
import FeedbackPanelForStudent from '../components/feedback-panel-for-student'

export default class ActivityFeedbackForStudent extends PureComponent {
  render () {
    const {
      student,
      feedbacks,
      feedbackEnabled,
      useRubric,
      rubric,
      showScore,
      maxScore,
      showText,
      autoScore
    } = this.props
    let feedback = null
    if (!feedbackEnabled) { return null }
    const _feedbacks = feedbacks
      .find((f) => f.get('studentId') === student.get('id'))

    if (_feedbacks) {
      const fblist = _feedbacks.get('feedbacks')
      if (fblist && fblist.size > 0) {
        feedback = fblist.first().toJS()
      }
    }
    const showFeedback = (feedback && feedback.hasBeenReviewed)
    const score = autoScore == null
      ? feedback && feedback.score
      : autoScore
    const textFeedback = feedback && feedback.feedback
    const hasBeenReviewed = feedback && feedback.hasBeenReviewed
    const rubricFeedback = feedback && feedback.rubricFeedback
    return (
      <FeedbackPanelForStudent
        student={student}
        showScore={showScore}
        maxScore={maxScore}
        feedbackEnabled={showFeedback}
        showText={showText}
        textFeedback={textFeedback}
        score={score}
        hasBeenReviewed={hasBeenReviewed}
        useRubric={useRubric}
        rubric={rubric}
        rubricFeedback={rubricFeedback}
        autoScore={autoScore}
        isOverall
      />)
  }
}
