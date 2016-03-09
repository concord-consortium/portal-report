import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { connect } from 'react-redux'
import { selectReport, fetchDataIfNeeded, invalidateData, hideCompareView,
         showSelectedQuestions, showAllQuestions, setAnonymous } from '../actions'
import { Modal } from 'react-bootstrap'
import Button from '../components/button'
import CompareView from '../components/compare-view'
import Investigation from '../components/investigation'
import ccLogoSrc from '../../img/cc-logo.png'
// (...)Data functions accept some state and return data in a form suitable for 'dumb' components.
import reportData from '../core/report-data'
import compareViewData from '../core/compare-view-data'

import '../../css/app.less'
import '../../css/report.less'

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

  renderLoadingStatus() {
    const { isFetching } = this.props
    return <div className='loading-status'><h2>{isFetching ? 'Loading...' : 'Report data download failed'}</h2></div>
  }

  renderReport() {
    const { clazzName, report, isFetching, isAnonymous,
            showSelectedQuestions, showAllQuestions, setAnonymous } = this.props
    return (
      <div style={{ opacity: isFetching ? 0.5 : 1 }}>
        <div className='report'>
          <div className='report-header'>
            <h1>
              Report for: {clazzName}
            </h1>
            <div className='controls'>
              <Button onClick={showSelectedQuestions}>Show selected</Button>
              <Button onClick={showAllQuestions}>Show all</Button>
              <Button onClick={() => setAnonymous(!isAnonymous)}>{isAnonymous ? 'Show names' : 'Hide names'}</Button>
            </div>
          </div>
          <Investigation investigation={report}/>
        </div>
      </div>
    )
  }

  renderCompareView() {
    const { compareViewAnswers, hideCompareView } = this.props
    return (
      <Modal show={!!compareViewAnswers && compareViewAnswers.size > 0} bsStyle='compare-view' onHide={hideCompareView}>
        <Modal.Body>
          {compareViewAnswers ? <CompareView answers={compareViewAnswers}/> : null}
        </Modal.Body>
      </Modal>
    )
  }

  render() {
    const { report, isFetching, lastUpdated, compareView } = this.props
    return (
      <div className='report-app'>
        <div className='header'>
          <div className='header-content'>
            <img src={ccLogoSrc} className='logo'/>
            <div className='status'>
              {lastUpdated &&
                <span>
                  Last updated at {new Date(lastUpdated).toLocaleTimeString()}
                  {' '}
                </span>
              }
              {!isFetching && <Button onClick={this.handleRefreshClick}>Refresh</Button>}
            </div>
          </div>
        </div>
        {report ? this.renderReport() : this.renderLoadingStatus()}
        {this.renderCompareView()}
      </div>
    )
  }
}

function mapStateToProps(state) {
  const data = state.get('data')
  const reportState = state.get('report')
  const compareViewAnswers = reportState && reportState.get('compareViewAnswers')
  return {
    isFetching: data.get('isFetching'),
    lastUpdated: data.get('lastUpdated'),
    clazzName: reportState ? reportState.get('clazzName') : '',
    isAnonymous: reportState ? reportState.get('anonymousReport') : false,
    report: reportState ? reportData(reportState) : null,
    compareViewAnswers: compareViewAnswers ? compareViewData(reportState) : null
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchDataIfNeeded: () => dispatch(fetchDataIfNeeded()),
    invalidateData: () => dispatch(invalidateData()),
    showSelectedQuestions: () => dispatch(showSelectedQuestions()),
    showAllQuestions: () => dispatch(showAllQuestions()),
    setAnonymous: (value) => dispatch(setAnonymous(value)),
    hideCompareView: () => dispatch(hideCompareView())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
