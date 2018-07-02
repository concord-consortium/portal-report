import React from 'react'
import ReportApp from './report/report-app'
import DashboardApp from './dashboard/dashboard-app'
import { connect } from 'react-redux'
import { DASHBOARD } from '../reducers'

export class App extends React.PureComponent {
  render () {
    const { viewType } = this.props
    return viewType === DASHBOARD ? <DashboardApp /> : <ReportApp />
  }
}

const mapStateToProps = state => ({
  viewType: state.getIn(['view', 'type'])
})

export default connect(mapStateToProps)(App)
