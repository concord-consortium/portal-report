import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Activity from './activity'
import Sticky from 'react-stickynode';
import '../../css/investigation.less'

@pureRender
export default class Investigation extends Component {
  render() {
    const { investigation, reportFor } = this.props
    const investigationName = investigation.get('name')
    return (
      <div>
        <Sticky top={40} className='investigation'>
            <h2>{investigationName}</h2>
        </Sticky>
        <div>
            {investigation.get('children').map(a => <Activity key={a.get('id')} activity={a} reportFor={reportFor} investigationName={investigationName}/>)}
        </div>
      </div>
    )
  }
}
