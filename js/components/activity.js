import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Section from './section'

@pureRender
export default class Activity extends Component {
  render() {
    const { activity } = this.props
    return (
      <div className={`activity ${activity.visible ? '' : 'hidden'}`}>
        <h3>{activity.name}</h3>
        <div>
          {activity.children.map(s => <Section key={s.id} section={s}/>)}
        </div>
      </div>
    )
  }
}
