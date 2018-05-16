import React, { PureComponent } from 'react' // eslint-disable-line
import FeedbackOptionsView from './feedback-options-view'

import {
  NO_SCORE,
  MANUAL_SCORE,
  isAutoScoring
} from '../util/scoring-constants'

export default class ActivityFeedbackOptions extends PureComponent {
  constructor (props) {
    super(props)
    this.state = { lastScoreType: null }
    this.enableText = this.enableText.bind(this)
    this.enableRubric = this.enableRubric.bind(this)
    this.setMaxScore = this.setMaxScore.bind(this)
    this.changeScoreType = this.changeScoreType.bind(this)
  }

  enableText (event) {
    const activityId = this.props.activity.get('id')
    const activityFeedbackId = this.props.activity.get('activityFeedbackId')
    this.props.enableActivityFeedback(
      activityId, {
        activityFeedbackId,
        enableTextFeedback: event.target.checked
      })
  }

  enableRubric (event) {
    const activityId = this.props.activity.get('id')
    const activityFeedbackId = this.props.activity.get('activityFeedbackId')
    this.props.enableActivityFeedback(
      activityId, {
        activityFeedbackId,
        useRubric: event.target.checked
      })
  }

  setMaxScore (value) {
    const activityId = this.props.activity.get('id')
    const activityFeedbackId = this.props.activity.get('activityFeedbackId')
    this.props.enableActivityFeedback(activityId, {
      activityFeedbackId,
      maxScore: value
    })
  }

  changeScoreType (newV) {
    const activityId = this.props.activity.get('id').toString()
    const activityFeedbackId = this.props.activity.get('activityFeedbackId')
    const newFlags = { activityFeedbackId, scoreType: newV }
    if (newV !== NO_SCORE) {
      this.setState({lastScoreType: newV})
    }
    if (isAutoScoring(newV)) {
      newFlags.maxScore = this.props.computedMaxScore
    }
    this.props.enableActivityFeedback(activityId, newFlags)
  }

  render () {
    const { activity, computedMaxScore, rubric } = this.props
    const scoreType = activity.get('scoreType') || NO_SCORE
    const showText = activity.get('enableTextFeedback')
    const rubricAvailable = !!rubric
    const useRubric = rubricAvailable && activity.get('useRubric')
    const scoreEnabled = scoreType !== NO_SCORE
    const maxScore = isAutoScoring(scoreType)
      ? computedMaxScore
      : activity.get('maxScore')
    const toggleScoreEnabled = () => {
      if (scoreEnabled) {
        this.changeScoreType(NO_SCORE)
      } else {
        this.changeScoreType(this.state.lastScoreType || MANUAL_SCORE)
      }
    }

    return (
      <FeedbackOptionsView
        useRubric={useRubric}
        rubricAvailable={rubricAvailable}
        scoreEnabled={scoreEnabled}
        scoreType={scoreType}
        maxScore={maxScore}
        enableRubric={this.enableRubric}
        enableText={this.enableText}
        toggleScoreEnabled={toggleScoreEnabled}
        showText={showText}
        changeScoreType={this.changeScoreType}
        setMaxScore={this.setMaxScore}
        allowAutoScoring
      />
    )
  }
}
