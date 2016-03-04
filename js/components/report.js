import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Button from './button'
import Investigation from './investigation'
import Activity from './activity'

import '../../css/report.less'

@pureRender
export default class Report extends Component {
  render() {
    const { reportName, reportJSON, showSelectedQuestions, showAllQuestions, isAnonymous, setAnonymous } = this.props
    return (
      <div className='report'>
        <div className='report-header'>
          <h1>
            Report for: {reportName}
          </h1>
          <div className='controls'>
            <Button onClick={showSelectedQuestions}>Show selected</Button>
            <Button onClick={showAllQuestions}>Show all</Button>
            <Button onClick={() => setAnonymous(!isAnonymous)}>{isAnonymous ? 'Show names' : 'Hide names'}</Button>
          </div>
        </div>
        {reportJSON.type === 'Investigation' ?
          <Investigation investigationJSON={reportJSON}/> :
          <Activity activityJSON={reportJSON}/>}
      </div>
    )
  }
}
