import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import Sticky from 'react-stickynode';

import Section from './section'
import FeedbackButton from './feedback-button';
import ActivityFeedbackPanel from '../containers/activity-feedback-panel';
import { getActivityFeedbacks, getFeedbacksNeedingReview } from '../core/activity-feedback-data'

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
    const { activity, reportFor} = this.props
    const activityName = activity.get('name')
    const showFeedback = this.showFeedback
    const hideFeedback = this.hideFeedback
    const needsReviewCount = this.props.numFeedbacksNeedingReview
    const feedbackEnabled = (activity.get('scoreType') != 'none') || activity.get('enableTextFeedback')

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
        ""

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
  const feedbacksNeedingReview = getFeedbacksNeedingReview(feedbacks)
  const numFeedbacksNeedingReview =feedbacksNeedingReview.size
  return { feedbacks, feedbacksNeedingReview, numFeedbacksNeedingReview }
}

const mapDispatchToProps = (dispatch, ownProps) => {return {}}

export default connect(mapStateToProps, mapDispatchToProps)(Activity)