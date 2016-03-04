import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import ActivityContainer from '../containers/activity'

@pureRender
export default class Investigation extends Component {
  render() {
    const { investigationJSON } = this.props
    return (
      <div className='investigation'>
        <h2>{investigationJSON.name}</h2>
        <div>
          {investigationJSON.children.map(a => <ActivityContainer key={a.id} activityJSON={a}/>)}
        </div>
      </div>
    )
  }
}
