import React, { PureComponent } from 'react'
import RubricBoxForStudent from './rubric-box-for-student'
import '../../css/activity-feedback.less'
import '../../css/feedback-panel-for-student.less'

export default class FeedbackPanelForStudent extends PureComponent {
  renderRubricSection (_rubricFeedback) {
    const { useRubric, rubric } = this.props
    const rubricFeedback = _rubricFeedback || {}
    if (!(rubric && useRubric && rubric.criteria)) {
      return null
    }
    const rFeedbacks = Object.keys(rubricFeedback).map((key) => {
      const criteria = rubric.criteria.find((c) => c.id === key)
      const rFeedback = rubricFeedback[key]
      const ratingDescription = (
        rubric.showRatingDescriptions &&
        criteria.ratingDescriptions &&
        criteria.ratingDescriptions[rFeedback.id]
      )
        ? ` (${criteria.ratingDescriptions[rFeedback.id]})`
        : ''
      if (criteria && rFeedback) {
        return (
          <div className='criterion' key={key}>
            <span className='description'>{criteria.description}</span>
            <span className='rating'> – {rFeedback.label}{ratingDescription}</span>
          </div>
        )
      }
      return null
    }).filter((f) => f)
    if (useRubric && rFeedbacks.length > 0) {
      return (
        <div className='rubricFeedback'>
          {rFeedbacks}
        </div>
      )
    }
    return null
  }

  renderTextSection (feedback) {
    const { showText } = this.props
    if (showText && feedback) {
      return (
        <div className='feedback-section written-feedback'>
          <span>{feedback}</span>
        </div>
      )
    }
    return null
  }

  renderScoreSection (score) {
    const { maxScore, showScore, isOverall } = this.props
    const scoreLabel = isOverall ? 'Overall Score' : 'Score'
    const ofLabel = 'of'
    if (score != null && showScore) {
      return (
        <div className='feedback-section score'>
          <span className='scoreLabel'>{scoreLabel}</span>
          <span className='studentScore'> {score} </span>
          {ofLabel}
          <span className='maxScore'> {maxScore} </span>
        </div>
      )
    }
    return null
  }

  render () {
    const {textFeedback, score, rubric, rubricFeedback, hasBeenReviewed} = this.props
    const hasFeedback = textFeedback || score || rubricFeedback
    const showFeedback = (hasFeedback && hasBeenReviewed)

    let feedbackDiv =
      <div>
        No feedback yet.
      </div>

    if (showFeedback) {
      feedbackDiv =
        <div className='actFeedbackPanel'>
          <div className='heading'>Teacher Feedback:</div>
          <RubricBoxForStudent
            rubric={rubric}
            rubricFeedback={rubricFeedback}
          />
          {/* { this.renderRubricSection(rubricFeedback) } */}
          { this.renderTextSection(textFeedback) }
          { this.renderScoreSection(score) }
        </div>
    }

    return (
      <div className='activity-feedback'>
        { feedbackDiv }
      </div>
    )
  }
}
