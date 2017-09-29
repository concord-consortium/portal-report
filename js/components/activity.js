import React, { PureComponent } from 'react'
import Section from './section'
import Sticky from 'react-stickynode';
import FeedbackButton from './feedback-button';
import ActivityFeedbackPanel from './activity-feedback-panel';
import '../../css/activity.less'

export default class Activity extends PureComponent {
  constructor(props) {
    super()
    this.state = {
      showFeedbackPanel: false,
      showText: false,
      showScore: false,
      maxScore: 10
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

  // "enable_text_feedback": true,
  // "enable_score": true,
  // "enable_auto_score": true,
  // "max_score": 10,

  render() {
    const { activity, reportFor} = this.props
    const activityName = activity.get('name')
    const showFeedback = this.showFeedback
    const hideFeedback = this.hideFeedback
    const feedbackPanel = this.state.showFeedbackPanel
      ?
        <ActivityFeedbackPanel
          hide={hideFeedback }
          activity={activity}
        />
      :
        ""

    return (
      <div className={`activity ${activity.get('visible') ? '' : 'hidden'}`}>
        <Sticky top={60}>
          <div>
            <h3>{activityName} </h3>
            <span className="feedback">
              <FeedbackButton
                text="Provide overall feedback"
                showFeedback={showFeedback}
                />
            </span>
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
