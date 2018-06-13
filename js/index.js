import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import ReportApp from './containers/report/report-app'
import DashboardApp from './containers/dashboard/dashboard-app'
import configureStore from './store/configure-store'
import queryString from 'query-string'

const store = configureStore()
window.store = store

const { dashboard } = queryString.parse(window.location.search)

render(
  <Provider store={store}>
    { dashboard ? <DashboardApp /> : <ReportApp /> }
  </Provider>,
  document.getElementById('app')
)
