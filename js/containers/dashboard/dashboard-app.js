import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { fetchDataIfNeeded, invalidateData } from '../../actions/index'
import { setActivityExpanded, setStudentExpanded } from '../../actions/dashboard'
import Dashboard from '../../components/dashboard/dashboard'
import Header from '../../components/common/header'
import DataFetchError from '../../components/report/data-fetch-error'
import LoadingIcon from '../../components/report/loading-icon'
import getReportTree from '../../selectors/report-tree'
import { getStudentProgress, getSortedStudents } from '../../selectors/dashboard-selectors'
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
    const { error, reportTree, students, lastUpdated, studentProgress, expandedStudents, expandedActivities, setActivityExpanded, setStudentExpanded } = this.props
    return (
      <div className={css.dashboardApp}>
        <Header lastUpdated={lastUpdated} />
        <div>
          {reportTree && <Dashboard
            report={reportTree}
            students={students}
            studentProgress={studentProgress}
            expandedActivities={expandedActivities}
            expandedStudents={expandedStudents}
            setActivityExpanded={setActivityExpanded}
            setStudentExpanded={setStudentExpanded}
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
    students: dataDownloaded && getSortedStudents(state),
    reportTree: dataDownloaded && getReportTree(state),
    studentProgress: dataDownloaded && getStudentProgress(state),
    expandedActivities: state.getIn(['dashboard', 'expandedActivities']),
    expandedStudents: state.getIn(['dashboard', 'expandedStudents'])
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchDataIfNeeded: () => dispatch(fetchDataIfNeeded()),
    setActivityExpanded: (activityId, value) => dispatch(setActivityExpanded(activityId, value)),
    setStudentExpanded: (studentId, value) => dispatch(setStudentExpanded(studentId, value))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardApp)
