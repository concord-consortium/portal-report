import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import Sticky from 'react-stickynode';

import Section from '../components/section'
import FeedbackButton from '../components/feedback-button';
import ActivityFeedbackForStudent from '../components/activity-feedback-for-student'
import ActivityFeedbackPanel from './activity-feedback-panel';
import { getActivityFeedbacks, getFeedbacksNeedingReview, getComputedMaxScore} from '../core/activity-feedback-data'

import '../../css/activity.less'

class Activity extends PureComponent {
  constructor(props) {
    super()
    this.state = {
      showFeedbackPanel: false
    }
    this.showFeedback = this.showFeedback.bind(this)
    this.hideFeedback = this.hideFeedback.bind(this)
  }

  showFeedback() {
    this.setState({
      showFeedbackPanel: true
    })
  }

  hideFeedback() {
    this.setState({
      showFeedbackPanel: false
    })
  }

  render() {
    const { activity, reportFor, needsReviewCount, feedbacks} = this.props
    const activityName = activity.get('name')
    const showText = activity.get('enableTextFeedback')
    const scoreType = activity.get('scoreType')
    const showScore = (scoreType != 'none')
    const showFeedback = this.showFeedback
    const hideFeedback = this.hideFeedback
    const feedbackEnabled = showScore || showText

    const feedbackPanel = (reportFor == "class" && this.state.showFeedbackPanel)
      ?
        <ActivityFeedbackPanel
          hide={hideFeedback }
          activity={activity}
        />
      :
        ""

    const feedbackButton = reportFor == "class"
      ?
        <span className="feedback">
          <FeedbackButton
            text="Provide overall feedback"
            needsReviewCount={needsReviewCount}
            feedbackEnabled={feedbackEnabled}
            showFeedback={showFeedback}
          />
        </span>
      :
        <ActivityFeedbackForStudent
          student={reportFor}
          feedbacks ={feedbacks}
          showScore = {showScore}
          showText = {showText}
          feedbackEnabled = {feedbackEnabled}
        />

    return (
      <div className={`activity ${activity.get('visible') ? '' : 'hidden'}`}>
        <Sticky top={60}>
          <div>
            <h3>{activityName} </h3>
            { feedbackButton }
          </div>
        </Sticky>
        <div>
          {feedbackPanel}
          {activity.get('children').map(s => <Section key={s.get('id')} section={s} reportFor={reportFor}/>)}
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  const actId = ownProps.activity.get('id')
  const feedbacks = getActivityFeedbacks(state, actId)
  const computedMaxScore = getComputedMaxScore(state,actId)
  const feedbacksNeedingReview = getFeedbacksNeedingReview(feedbacks)
  const numFeedbacksNeedingReview =feedbacksNeedingReview.size
  return { feedbacks, feedbacksNeedingReview, numFeedbacksNeedingReview }
}

const mapDispatchToProps = (dispatch, ownProps) => {return {}}

export default connect(mapStateToProps, mapDispatchToProps)(Activity)