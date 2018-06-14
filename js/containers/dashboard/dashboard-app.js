import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { fetchDataIfNeeded, invalidateData } from '../../actions/index'
import { setActivityExpanded } from '../../actions/dashboard'
import Dashboard from '../../components/dashboard/dashboard'
import Header from '../../components/common/header'
import DataFetchError from '../../components/report/data-fetch-error'
import LoadingIcon from '../../components/report/loading-icon'
import getReportTree from '../../selectors/report-tree'
import { getActivityProgress, sortedStudents } from '../../selectors/dashboard-selectors'
import css from '../../../css/dashboard/dashboard-app.less'

class DashboardApp extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      initialLoading: true
    }
  }

  componentDidMount () {
    const { fetchDataIfNeeded } = this.props
    fetchDataIfNeeded()
  }

  componentDidUpdate (prevProps) {
    const { initialLoading } = this.state
    const { isFetching } = this.props
    if (initialLoading && !isFetching && prevProps.isFetching) {
      this.setState({ initialLoading: false })
    }
  }

  render () {
    const { initialLoading } = this.state
    const { error, reportTree, students, lastUpdated, activityProgress, expandedActivities, setActivityExpanded } = this.props
    return (
      <div className={css.dashboardApp}>
        <Header lastUpdated={lastUpdated} />
        <div>
          {reportTree && <Dashboard
            report={reportTree}
            students={students}
            activityProgress={activityProgress}
            expandedActivities={expandedActivities}
            setActivityExpanded={setActivityExpanded}
          />}
          {error && <DataFetchError error={error} />}
        </div>
        {initialLoading && <LoadingIcon />}
      </div>
    )
  }
}

function mapStateToProps (state) {
  const data = state.get('data')
  const error = data.get('error')
  const dataDownloaded = !error && !!data.get('lastUpdated')
  return {
    isFetching: data.get('isFetching'),
    lastUpdated: data.get('lastUpdated'),
    error: error,
    students: dataDownloaded && sortedStudents(state),
    reportTree: dataDownloaded && getReportTree(state),
    activityProgress: dataDownloaded && getActivityProgress(state),
    expandedActivities: state.getIn(['dashboard', 'expandedActivities'])
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchDataIfNeeded: () => dispatch(fetchDataIfNeeded()),
    invalidateData: () => dispatch(invalidateData()),
    setActivityExpanded: (activityId, value) => dispatch(setActivityExpanded(activityId, value))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardApp)
