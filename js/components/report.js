import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Investigation from './investigation'
import Button from './button'

import '../../css/report.less'

@pureRender
export default class Report extends Component {
  renderClassReport() {
    const { report } = this.props
    return (
      <div className='report-content'>
        <h1>Report for: {report.get('clazzName')}</h1>
        <Investigation investigation={report.get('investigation')} reportFor={'class'}/>
      </div>
    )
  }

  renderStudentReport() {
    const { report } = this.props
    return [...report.get('students').values()].filter(s => s.get('startedOffering')).map(s =>
      <div key={s.get('id')} className='report-content'>
        <h1>Report for: {s.get('name')}</h1>
        <Investigation investigation={report.get('investigation')} reportFor={s}/>
      </div>
    )
  }

  render() {
    const { report, showSelectedQuestions, showAllQuestions, setType, setAnonymous } = this.props
    const isAnonymous = report.get('anonymous')
    return (
      <div>
        <div className='report-header'>
          <div className='controls'>
            <select className='form-control' value={report.get('type')} onChange={(e) => setType(e.target.value)}>
              <option value='class'>Report for class</option>
              <option value='student'>Report for student</option>
            </select>
            <Button onClick={showSelectedQuestions}>Show selected</Button>
            <Button onClick={showAllQuestions}>Show all</Button>
            <Button onClick={() => setAnonymous(!isAnonymous)}>{isAnonymous ? 'Show names' : 'Hide names'}</Button>
            <Button onClick={() => window.print()}>Print</Button>
          </div>
        </div>
        {report.get('type') === 'class' ? this.renderClassReport() : this.renderStudentReport()}
      </div>
    )
  }
}
