import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import Sticky from 'react-stickynode'
import Section from '../components/section'
import FeedbackButton from '../components/feedback-button'
import ActivityFeedbackForStudent from '../components/activity-feedback-for-student'
import ActivityFeedbackPanel from './activity-feedback-panel'
import SummaryIndicator from '../components/summary-indicator'
import {
  makeGetStudentFeedbacks,
  makeGetRubric,
  makeGetAutoScores,
  makeGetComputedMaxScore
} from '../selectors/activity-feedback-selectors'

import {
  isAutoScoring,
  MANUAL_SCORE
} from '../util/scoring-constants'

import '../../css/activity.less'

class Activity extends PureComponent {
  constructor (props) {
    super()
    this.state = {
      showFeedbackPanel: false
    }
    this.showFeedback = this.showFeedback.bind(this)
    this.hideFeedback = this.hideFeedback.bind(this)
  }

  showFeedback () {
    this.setState({
      showFeedbackPanel: true
    })
  }

  hideFeedback () {
    this.setState({
      showFeedbackPanel: false
    })
  }

  render () {
    const {
      activity,
      reportFor,
      needsReviewCount,
      feedbacks,
      computedMaxScore,
      autoScores,
      rubric,
      rubricFeedbacks,
      scores
    } = this.props
    const activityName = activity.get('name')
    const showText = activity.get('enableTextFeedback')
    const scoreType = activity.get('scoreType')
    const _maxScore = activity.get('maxScore')
    const maxScore = scoreType === MANUAL_SCORE ? _maxScore : computedMaxScore
    const summaryScores = scoreType === MANUAL_SCORE ? scores : Object.values(autoScores.toJS())
    const showScore = (scoreType !== 'none')
    const useRubric = activity.get('useRubric')
    const showFeedback = this.showFeedback
    const hideFeedback = this.hideFeedback
    const feedbackEnabled = showScore || showText

    const feedbackPanel = (reportFor === 'class' && this.state.showFeedbackPanel)
      ? <ActivityFeedbackPanel
        hide={hideFeedback}
        activity={activity}
      />
      : ''
    let summaryIndicator = null
    let feedbackButton =
      <div className='feedback'>
        <FeedbackButton
          text='Provide overall feedback'
          needsReviewCount={needsReviewCount}
          feedbackEnabled={feedbackEnabled}
          showFeedback={showFeedback}
        />
      </div>

    if (reportFor === 'class') {
      summaryIndicator = <SummaryIndicator
        scores={summaryScores}
        maxScore={maxScore}
        useRubric={useRubric}
        showScore={showScore}
        rubricFeedbacks={rubricFeedbacks}
        rubric={rubric}
      />
    } else {
      const studentId = reportFor.get('id')
      const autoScore = isAutoScoring(scoreType)
        ? autoScores.get(`${studentId}`)
        : null

      feedbackButton =
        <ActivityFeedbackForStudent
          student={reportFor}
          feedbacks={feedbacks}
          showScore={showScore}
          maxScore={maxScore}
          showText={showText}
          useRubric={useRubric}
          rubric={rubric}
          autoScore={autoScore}
          feedbackEnabled={feedbackEnabled}
        />
    }

    return (
      <div className={`activity ${activity.get('visible') ? '' : 'hidden'}`}>
        <Sticky top={60}>
          <div className='act-header'>
            <h3>{activityName} </h3>
            { feedbackButton }
          </div>
        </Sticky>
        { summaryIndicator }
        <div>
          {feedbackPanel}
          {activity.get('children').map(s => <Section key={s.get('id')} section={s} reportFor={reportFor} />)}
        </div>
      </div>
    )
  }
}

function makeMapStateToProps () {
  return (state, ownProps) => {
    const getRubric = makeGetRubric()
    const getFeedbacks = makeGetStudentFeedbacks()
    const getAutoMaxScore = makeGetComputedMaxScore()
    const getAutoScores = makeGetAutoScores()

    const rubric = getRubric(state, ownProps)
    const computedMaxScore = getAutoMaxScore(state, ownProps)
    const autoScores = getAutoScores(state, ownProps)
    const {
      feedbacksNeedingReview,
      feedbacks,
      scores,
      rubricFeedbacks } = getFeedbacks(state, ownProps)
    const needsReviewCount = feedbacksNeedingReview.size

    return { scores, rubricFeedbacks, feedbacks, feedbacksNeedingReview, rubric, needsReviewCount, autoScores, computedMaxScore }
  }
}

const mapDispatchToProps = (dispatch, ownProps) => { return {} }

export default connect(makeMapStateToProps, mapDispatchToProps)(Activity)
