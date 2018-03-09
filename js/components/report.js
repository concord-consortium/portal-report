import React, { PureComponent } from 'react'
import Investigation from './investigation'
import Button from './button'

import '../../css/report.less'
import Sticky from 'react-stickynode'

import { noSelection } from '../calculations'

export default class Report extends PureComponent {
  constructor (props) {
    super(props)
    this.printStudentReports = this.printStudentReports.bind(this)
    this.printMediaQueryListener = this.printMediaQueryListener.bind(this)
  }

  componentDidMount () {
    const { report } = this.props
    const nowShowing = report.get('nowShowing')
    const student = report.get('students').first().get('name')
    const title = nowShowing === 'class' ? `Report for ${report.get('clazzName')}` : `Report for ${student}`
    const investigation = report.get('investigation')
    document.title = `${investigation.get('name')} ${title}`
  }

  renderReportHeader (clazzName) {
    return (
      <Sticky top={0} className='main' activeClass='active'>
        <div className='report-header'>
          <div className='title'>
            <h1>Report for: {clazzName}</h1>
          </div>
          {this.renderControls()}
        </div>
      </Sticky>
    )
  }

  renderClassReport () {
    const { report } = this.props
    const nowShowing = report.get('nowShowing')
    const className = nowShowing === 'class' ? 'report-content' : 'report-content hidden'
    return (
      <div className={className}>
        {this.renderReportHeader(report.get('clazzName'))}
        <Investigation investigation={report.get('investigation')} reportFor={'class'} />
      </div>
    )
  }

  renderStudentReports () {
    const { report } = this.props
    const nowShowing = report.get('nowShowing') === 'student'
    const selectedStudentId = report.get('selectedStudentId')
    const className = nowShowing ? 'report-content' : 'report-content hidden'
    let selectStudents = s => true
    const startedOffering = s => s.get('startedOffering')
    if (selectedStudentId) {
      const id = parseInt(selectedStudentId)
      selectStudents = (student) => id === student.get('id')
    }
    return [...report.get('students').values()]
      .filter(startedOffering)
      .filter(selectStudents)
      .map(s =>
        <div key={s.get('id')} className={className}>
          {this.renderReportHeader(s.get('name'))}
          <Investigation investigation={report.get('investigation')} reportFor={s} />
        </div>
      )
  }

  renderControls () {
    const { report, showSelectedQuestions, showAllQuestions, setAnonymous } = this.props
    const isAnonymous = report.get('anonymous')
    const nowShowing = report.get('nowShowing')
    const buttonText = (nowShowing === 'class') ? 'Print student reports' : 'Print'
    const showSelectedDisabled = noSelection(report)
    const hideControls = report.get('hideControls')
    if (!hideControls) {
      return (
        <div className='controls'>
          <Button onClick={showSelectedQuestions} disabled={showSelectedDisabled}>Show selected</Button>
          <Button onClick={showAllQuestions}>Show all</Button>
          <Button onClick={() => setAnonymous(!isAnonymous)}>{isAnonymous ? 'Show names' : 'Hide names'}</Button>
          <Button onClick={this.printStudentReports}>{buttonText}</Button>
        </div>
      )
    } else {
      return ('')
    }
  }

  printStudentReports () {
    // Change report style to "per student" style.
    const { setNowShowing } = this.props
    setNowShowing('student')
    // setTimeout is necessary, as and re-render is async. Not the nicest way, but it's simple and self-contained.
    setTimeout(() => window.print(), 1)
    this.setupAfterPrintListener()
  }

  afterPrint () {
    // Go back to the default report style ("per class").
    const { setNowShowing, report } = this.props
    const type = report.get('type')
    setNowShowing(type)
    this.cleanupAfterPrintListener()
  }

  // It's difficult to detect when user closes the print dialog in a cross-browser way.
  // This method seems to work for our needs in modern browsers. See:
  // http://stackoverflow.com/a/11060206
  setupAfterPrintListener () {
    this.mediaQueryList = window.matchMedia('print')
    this.mediaQueryList.addListener(this.printMediaQueryListener)
  }

  cleanupAfterPrintListener () {
    this.mediaQueryList.removeListener(this.printMediaQueryListener)
  }

  printMediaQueryListener (mql) {
    if (!mql.matches) {
      this.afterPrint()
    }
  }

  render () {
    return (
      <div>
        {this.renderClassReport()}
        {this.renderStudentReports()}
      </div>
    )
  }
}
