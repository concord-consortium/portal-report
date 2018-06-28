import React from 'react'
import ReportApp from '../containers/report/report-app'
import DashboardApp from '../containers/dashboard/dashboard-app'
import config from '../config'

export default class App extends React.PureComponent {
  render () {
    return config('dashboard') ? <DashboardApp /> : <ReportApp />
  }
}
