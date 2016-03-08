import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { connect } from 'react-redux'
import { selectReport, fetchDataIfNeeded, invalidateData,
         showSelectedQuestions, showAllQuestions, setAnonymous } from '../actions'
import Button from '../components/button'
import Investigation from '../components/investigation'
import reportTree from '../core/report-tree'
import ccLogoSrc from '../../img/cc-logo.png'

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

  render() {
    const { clazzName, report, isFetching, lastUpdated, isAnonymous,
            showSelectedQuestions, showAllQuestions, setAnonymous } = this.props
    const isEmpty = !report
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
        {isEmpty ?
          (isFetching ? <h2>Loading...</h2> : <h2>Empty.</h2>) :
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
        }
      </div>
    )
  }
}

function mapStateToProps(state) {
  const data = state.get('data')
  const report = state.get('report')
  return {
    isFetching: data.get('isFetching'),
    lastUpdated: data.get('lastUpdated'),
    clazzName: report ? report.get('clazzName') : '',
    isAnonymous: report ? report.get('anonymousReport') : false,
    report: report ? reportTree(report) : null
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchDataIfNeeded: () => dispatch(fetchDataIfNeeded()),
    invalidateData: () => dispatch(invalidateData()),
    showSelectedQuestions: () => dispatch(showSelectedQuestions()),
    showAllQuestions: () => dispatch(showAllQuestions()),
    setAnonymous: (value) => dispatch(setAnonymous(value))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
