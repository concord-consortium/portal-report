import React from 'react'
import ReportApp from '../containers/report/report-app'
import DashboardApp from '../containers/dashboard/dashboard-app'
import queryString from 'query-string'

export default class App extends React.PureComponent {
  render () {
    const { dashboard } = queryString.parse(window.location.search)
    return dashboard ? <DashboardApp /> : <ReportApp />
  }
}
