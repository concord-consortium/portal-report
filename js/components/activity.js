import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Section from './section'

import '../../css/activity.less'

@pureRender
export default class Activity extends Component {
  render() {
    const { activity, reportFor, investigationName } = this.props
    const activityName = activity.get('name')
    return (
      <div className={`activity ${activity.get('visible') ? '' : 'hidden'}`}>
        <h3>{activityName}</h3>
        <div>
          {activity.get('children').map(s => <Section key={s.get('id')} section={s} reportFor={reportFor} investigationName={investigationName} activityName={activityName} />)}
        </div>
      </div>
    )
  }
}
