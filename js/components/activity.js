import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Section from './section'

@pureRender
export default class Activity extends Component {
  render() {
    const { activity } = this.props
    return (
      <div className={`activity ${activity.get('visible') ? '' : 'hidden'}`}>
        <h3>{activity.get('name')}</h3>
        <div>
          {activity.get('children').map(s => <Section key={s.get('id')} section={s}/>)}
        </div>
      </div>
    )
  }
}
