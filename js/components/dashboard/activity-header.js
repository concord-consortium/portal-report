import React, { PureComponent } from 'react'

import css from '../../../css/dashboard/activity-header.less'

export default class ActivityHeader extends PureComponent {
  render () {
    const { activity } = this.props
    return (
      <div className={css.activityHeader}>{ activity.get('name') }</div>
    )
  }
}
