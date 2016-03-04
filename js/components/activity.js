import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import SectionContainer from '../containers/section'

@pureRender
export default class Activity extends Component {
  render() {
    const { activityJSON, hidden } = this.props
    return (
      <div className={`activity ${hidden ? 'hidden' : ''}`}>
        <h3>{activityJSON.name}</h3>
        <div>
          {activityJSON.children.map(s => <SectionContainer key={s.id} sectionJSON={s}/>)}
        </div>
      </div>
    )
  }
}
