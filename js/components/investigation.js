import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Activity from './activity'

import '../../css/investigation.less'

@pureRender
export default class Investigation extends Component {
  render() {
    const { investigation, reportFor } = this.props
    const investigationName = investigation.get('name')
    return (
      <div className='investigation'>
        <h2>{investigationName}</h2>
        <div>
          {investigation.get('children').map(a => <Activity key={a.get('id')} activity={a} reportFor={reportFor} investigationName={investigationName}/>)}
        </div>
      </div>
    )
  }
}
