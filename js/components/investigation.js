import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Activity from './activity'

@pureRender
export default class Investigation extends Component {
  render() {
    const { investigation } = this.props
    return (
      <div className='investigation'>
        <h2>{investigation.name}</h2>
        <div>
          {investigation.children.map(a => <Activity key={a.id} activity={a}/>)}
        </div>
      </div>
    )
  }
}
