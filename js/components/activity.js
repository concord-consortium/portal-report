import React, { PureComponent } from 'react'
import Section from './section'
import Sticky from 'react-stickynode';
import '../../css/activity.less'

export default class Activity extends PureComponent {
  render() {
    const { activity, reportFor} = this.props
    const activityName = activity.get('name')
    return (
      <div className={`activity ${activity.get('visible') ? '' : 'hidden'}`}>
        <Sticky top={60}>
          <h3>{activityName}</h3>
        </Sticky>
        <div>
          {activity.get('children').map(s => <Section key={s.get('id')} section={s} reportFor={reportFor}/>)}
        </div>
      </div>
    )
  }
}
