import React, { PureComponent } from 'react'

import css from '../../../css/dashboard/activity-name.less'

export default class ActivityName extends PureComponent {
  constructor (props) {
    super(props)
    this.onActivityNameClick = this.onActivityNameClick.bind(this)
  }

  onActivityNameClick () {
    const { activity, expanded, setActivityExpanded } = this.props
    setActivityExpanded(activity.get('id'), !expanded)
  }

  render () {
    const { activity, width } = this.props
    return (
      <div className={css.activityName} onClick={this.onActivityNameClick} style={{ width: width }}>
        <div className={css.content}>
          { activity.get('name') }
        </div>
      </div>
    )
  }
}
