import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { connect } from 'react-redux'
import { selectReport, fetchDataIfNeeded, invalidateData } from '../actions'
import Button from '../components/button'
import ReportContainer from './report'
import ccLogoSrc from '../../img/cc-logo.png'

import '../../css/app.less'

@pureRender
class App extends Component {
  constructor(props) {
    super(props)
    this.handleRefreshClick = this.handleRefreshClick.bind(this)
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch(fetchDataIfNeeded())
  }
  
  handleRefreshClick(e) {
    e.preventDefault()

    const { dispatch } = this.props
    dispatch(invalidateData())
    dispatch(fetchDataIfNeeded())
  }

  render() {
    const { reportName, reportJSON, isFetching, lastUpdated } = this.props
    const isEmpty = !reportJSON
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
            <ReportContainer reportJSON={reportJSON} reportName={reportName}/>
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
    reportJSON: report.get('reportJSON'),
    reportName: report.get('name'),
  }
}

export default connect(mapStateToProps)(App)
