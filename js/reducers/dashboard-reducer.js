import { Map } from 'immutable'
import { SET_ACTIVITY_EXPANDED, SET_STUDENT_EXPANDED, SET_STUDENTS_EXPANDED, SET_STUDENT_SORT, SORT_BY_NAME } from '../actions/dashboard'

const INITIAL_DASHBOARD_STATE = Map({
  sortBy: SORT_BY_NAME,
  expandedActivities: Map(),
  expandedStudents: Map()
})

export default function dashboardReducer (state = INITIAL_DASHBOARD_STATE, action) {
  switch (action.type) {
    case SET_ACTIVITY_EXPANDED:
      return state.setIn(['expandedActivities', action.activityId.toString()], action.value)
    case SET_STUDENT_EXPANDED:
      return state.setIn(['expandedStudents', action.studentId.toString()], action.value)
    case SET_STUDENTS_EXPANDED:
      action.studentIds.forEach((studentId) => {
        state = state.setIn(['expandedStudents', studentId.toString()], action.value)
      })
      return state
    case SET_STUDENT_SORT:
      return state.set('sortBy', action.value)
    default:
      return state
  }
}
