import React, { PureComponent } from 'react'
import { Map } from 'immutable'

import css from '../../../css/dashboard/activity-name.less'

export default class ActivityName extends PureComponent {
  constructor (props) {
    super(props)
    this.onActivityNameClick = this.onActivityNameClick.bind(this)
  }

  onActivityNameClick () {
    const { activity, expanded, setActivityExpanded, trackEvent } = this.props
    setActivityExpanded(activity.get('id'), !expanded)
    trackEvent('Dashboard', 'Activity Column Click', activity.get('name'))
  }

  render () {
    const { number, activity, width, expanded } = this.props
    return (
      <div className={css.activityName} onClick={this.onActivityNameClick} style={{ width: width }} data-cy='activityName'>
        <div className={css.content}>
          <div className={css.name}>
            Act { number }: { activity.get('name') }
          </div>
          <div className={css.icon}>
            <i className={expanded ? 'icomoon-shrink2' : 'icomoon-enlarge2'} />
          </div>
        </div>
      </div>
    )
  }
}

ActivityName.defaultProps = {
  activity: Map()
}
