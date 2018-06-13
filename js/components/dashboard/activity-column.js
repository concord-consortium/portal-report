import React, { PureComponent } from 'react'
import ProgressBar from './progress-bar'

import css from '../../../css/dashboard/activity-column.less'

export default class ActivityColumn extends PureComponent {
  render () {
    const { students, studentsProgress } = this.props
    return (
      <div className={css.activityColumn}>
        {
          students.toArray().map(s =>
            <ProgressBar key={s.get('id')} progress={studentsProgress.get(s.get('id').toString())} />
          )
        }
      </div>
    )
  }
}
