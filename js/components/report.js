import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Investigation from './investigation'
import Button from './button'

import '../../css/report.less'

@pureRender
export default class Report extends Component {
  constructor(props) {
    super(props)
    this.printStudentReports = this.printStudentReports.bind(this)
    this.printMediaQueryListener = this.printMediaQueryListener.bind(this)
  }

  renderClassReport() {
    const { report } = this.props
    return (
      <div className='report-content'>
        <h1>Report for: {report.get('clazzName')}</h1>
        <Investigation investigation={report.get('investigation')} reportFor={'class'}/>
      </div>
    )
  }

  renderStudentReports() {
    const { report } = this.props
    return [...report.get('students').values()].filter(s => s.get('startedOffering')).map(s =>
      <div key={s.get('id')} className='report-content'>
        <h1>Report for: {s.get('name')}</h1>
        <Investigation investigation={report.get('investigation')} reportFor={s}/>
      </div>
    )
  }

  printStudentReports() {
    // Change report style to "per student" style.
    const { setType } = this.props
    setType('student')
    // setTimeout is necessary, as and re-render is async. Not the nicest way, but it's simple and self-contained.
    setTimeout(() => window.print(), 1)
    this.setupAfterPrintListener()
  }

  afterPrint() {
    // Go back to the default report style ("per class").
    const { setType } = this.props
    setType('class')
    this.cleanupAfterPrintListener()
  }

  // It's difficult to detect when user closes the print dialog in a cross-browser way.
  // This method seems to work for our needs in modern browsers. See:
  // http://stackoverflow.com/a/11060206
  setupAfterPrintListener() {
    this.mediaQueryList = window.matchMedia('print')
    this.mediaQueryList.addListener(this.printMediaQueryListener)
  }

  cleanupAfterPrintListener() {
    this.mediaQueryList.removeListener(this.printMediaQueryListener)
  }

  printMediaQueryListener(mql) {
    if (!mql.matches) {
      this.afterPrint()
    }
  }

  render() {
    const { report, showSelectedQuestions, showAllQuestions, setAnonymous } = this.props
    const isAnonymous = report.get('anonymous')
    const showSelectedDisabled = !report.get('has_selected_questions')
    return (
      <div>
        <div className='report-header'>
          <div className='controls'>
            <Button onClick={showSelectedQuestions} disabled={showSelectedDisabled}>Show selected</Button>
            <Button onClick={showAllQuestions}>Show all</Button>
            <Button onClick={() => setAnonymous(!isAnonymous)}>{isAnonymous ? 'Show names' : 'Hide names'}</Button>
            <Button onClick={this.printStudentReports}>Print student reports</Button>
          </div>
        </div>
        {report.get('type') === 'class' ? this.renderClassReport() : this.renderStudentReports()}
      </div>
    )
  }
}
