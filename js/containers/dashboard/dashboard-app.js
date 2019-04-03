import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { fetchDataIfNeeded, invalidateData, trackEvent } from '../../actions/index'
import {
  setActivityExpanded,
  setStudentExpanded,
  setStudentsExpanded,
  setQuestionExpanded,
  setStudentSort,
  selectQuestion
} from '../../actions/dashboard'
import Dashboard from '../../components/dashboard/dashboard'
import SortByDropdown from '../../components/dashboard/sort-by-dropdown'
import Header from '../../components/common/header'
import DataFetchError from '../../components/report/data-fetch-error'
import LoadingIcon from '../../components/report/loading-icon'
import { getActivityTrees } from '../../selectors/report-tree'
import { getStudentProgress, getSortedStudents, getSelectedQuestion } from '../../selectors/dashboard-selectors'
import css from '../../../css/dashboard/dashboard-app.less'

// Make icons available.
import '../../../css/icomoon.css'

const AUTO_REFRESH_INTERVAL = 10000 // ms

class DashboardApp extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      initialLoading: true
    }
    this.autoRefreshHandler = this.autoRefreshHandler.bind(this)
  }

  componentDidMount () {
    const { fetchDataIfNeeded } = this.props
    fetchDataIfNeeded()

    this.autoRefreshId = setInterval(this.autoRefreshHandler, AUTO_REFRESH_INTERVAL)
  }

  componentWillUnmount () {
    this.stopAutoRefresh()
  }

  componentDidUpdate (prevProps) {
    const { initialLoading } = this.state
    const { isFetching, error } = this.props
    if (initialLoading && !isFetching && prevProps.isFetching) {
      this.setState({ initialLoading: false })
    }
    if (error) {
      // Stop polling in case of error. The most likely reason for error to happen is that auth token has expired.
      // In this case, user needs to go back to Portal and run Portal again. In case of other errors, it doesn't seem
      // useful to keep polling Portal either.
      this.stopAutoRefresh()
    }
  }

  autoRefreshHandler () {
    const { invalidateData, fetchDataIfNeeded } = this.props
    invalidateData()
    fetchDataIfNeeded()
  }

  stopAutoRefresh () {
    clearInterval(this.autoRefreshId)
  }

  render () {
    const { initialLoading } = this.state
    const { error, clazzName, clazzId, activityTrees, students, lastUpdated, studentProgress, expandedStudents, expandedActivities, expandedQuestions, setActivityExpanded, setStudentExpanded, setQuestionExpanded, setStudentsExpanded, setStudentSort, selectedQuestion, selectQuestion, trackEvent } = this.props
    return (
      <div className={css.dashboardApp}>
        <Header lastUpdated={lastUpdated} background='#6fc6da' />
        {activityTrees &&
          <div>
            <div className={css.title}>
              <h1>Report for { clazzName }</h1>
              <SortByDropdown setStudentSort={setStudentSort} trackEvent={trackEvent} />
            </div>
            <Dashboard
              activities={activityTrees}
              students={students}
              studentProgress={studentProgress}
              expandedActivities={expandedActivities}
              expandedStudents={expandedStudents}
              expandedQuestions={expandedQuestions}
              setActivityExpanded={setActivityExpanded}
              setStudentExpanded={setStudentExpanded}
              setStudentsExpanded={setStudentsExpanded}
              setQuestionExpanded={setQuestionExpanded}
              setStudentSort={setStudentSort}
              selectedQuestion={selectedQuestion}
              selectQuestion={selectQuestion}
              trackEvent={trackEvent}
            />
          </div>
        }
        {error && <DataFetchError error={error} />}
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
    clazzName: dataDownloaded && state.getIn(['report', 'clazzName']),
    students: dataDownloaded && getSortedStudents(state),
    activityTrees: dataDownloaded && getActivityTrees(state),
    studentProgress: dataDownloaded && getStudentProgress(state),
    expandedActivities: state.getIn(['dashboard', 'expandedActivities']),
    expandedStudents: state.getIn(['dashboard', 'expandedStudents']),
    expandedQuestions: state.getIn(['dashboard', 'expandedQuestions']),
    selectedQuestion: dataDownloaded && getSelectedQuestion(state)
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchDataIfNeeded: () => dispatch(fetchDataIfNeeded()),
    invalidateData: () => dispatch(invalidateData()),
    setActivityExpanded: (activityId, value) => dispatch(setActivityExpanded(activityId, value)),
    setStudentExpanded: (studentId, value) => dispatch(setStudentExpanded(studentId, value)),
    setStudentsExpanded: (studentIds, value) => dispatch(setStudentsExpanded(studentIds, value)),
    setQuestionExpanded: (studentId, value) => dispatch(setQuestionExpanded(studentId, value)),
    setStudentSort: (value) => dispatch(setStudentSort(value)),
    selectQuestion: (value) => dispatch(selectQuestion(value)),
    trackEvent: (category, action, label) => dispatch(trackEvent(category, action, label))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardApp)
