import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { connect } from 'react-redux'
import { selectReport, fetchDataIfNeeded, invalidateData, hideCompareView,
         showSelectedQuestions, showAllQuestions, setType, setAnonymous } from '../actions'
import { Modal } from 'react-bootstrap'
import Button from '../components/button'
import CompareView from '../components/compare-view'
import Report from '../components/report'
import DataFetchError from '../components/data-fetch-error'
import LoadingIcon from '../components/loading-icon'
import ccLogoSrc from '../../img/cc-logo.png'
// (...)Data functions accept some state and return data in a form suitable for 'dumb' components.
import reportData from '../core/report-data'
import compareViewData from '../core/compare-view-data'

import '../../css/app.less'

@pureRender
class App extends Component {
  constructor(props) {
    super(props)
    this.handleRefreshClick = this.handleRefreshClick.bind(this)
  }

  componentDidMount() {
    const { fetchDataIfNeeded } = this.props
    fetchDataIfNeeded()
  }
  
  handleRefreshClick(e) {
    e.preventDefault()

    const { invalidateData, fetchDataIfNeeded } = this.props
    invalidateData()
    fetchDataIfNeeded()
  }

  renderStatusBar() {
    const { isFetching, lastUpdated } = this.props
    return (
      <div className='status'>
        {lastUpdated && <span>Last updated at {new Date(lastUpdated).toLocaleTimeString()} </span>}
        {<Button onClick={this.handleRefreshClick} disabled={isFetching}>Refresh</Button>}
      </div>
    )
  }

  renderReport() {
    const { report, showSelectedQuestions, showAllQuestions, setType, setAnonymous } = this.props
    return <Report report={report} showSelectedQuestions={showSelectedQuestions} showAllQuestions={showAllQuestions}
                   setType={setType} setAnonymous={setAnonymous}/>
  }

  renderCompareView() {
    const { compareViewAnswers, hideCompareView } = this.props
    return (
      <Modal show={compareViewAnswers && compareViewAnswers.size > 0} bsStyle='compare-view' onHide={hideCompareView}>
        <Modal.Body>
          {compareViewAnswers && <CompareView answers={compareViewAnswers}/>}
        </Modal.Body>
      </Modal>
    )
  }

  render() {
    const { report, error, isFetching } = this.props
    return (
      <div className='report-app'>
        <div className='header'>
          <div className='header-content'>
            <img src={ccLogoSrc} className='logo'/>
            {this.renderStatusBar()}
          </div>
        </div>
        <div className='report' style={{ opacity: isFetching ? 0.3 : 1 }}>
          {report && this.renderReport()}
          {error && <DataFetchError error={error}/>}
          {this.renderCompareView()}
        </div>
        {isFetching && <LoadingIcon/>}
      </div>
    )
  }
}

function mapStateToProps(state) {
  const data = state.get('data')
  const reportState = state.get('report')
  const compareViewAnswers = reportState && reportState.get('compareViewAnswers')
  const dataDownloaded = !!data.get('lastUpdated')
  return {
    isFetching: data.get('isFetching'),
    lastUpdated: data.get('lastUpdated'),
    error: data.get('error'),
    report: dataDownloaded && reportData(reportState),
    compareViewAnswers: compareViewAnswers && compareViewData(reportState)
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchDataIfNeeded: () => dispatch(fetchDataIfNeeded()),
    invalidateData: () => dispatch(invalidateData()),
    showSelectedQuestions: () => dispatch(showSelectedQuestions()),
    showAllQuestions: () => dispatch(showAllQuestions()),
    setType: value => dispatch(setType(value)),
    setAnonymous: value => dispatch(setAnonymous(value)),
    hideCompareView: () => dispatch(hideCompareView())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
