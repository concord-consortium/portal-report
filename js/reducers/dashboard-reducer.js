import { Map } from 'immutable'
import { SET_ACTIVITY_EXPANDED, SET_STUDENT_EXPANDED } from '../actions/dashboard'

const INITIAL_DASHBOARD_STATE = Map({
  sortBy: 'name',
  expandedActivities: Map(),
  expandedStudents: Map()
})

export default function dashboardReducer (state = INITIAL_DASHBOARD_STATE, action) {
  switch (action.type) {
    case SET_ACTIVITY_EXPANDED:
      return state.setIn(['expandedActivities', action.activityId.toString()], action.value)
    case SET_STUDENT_EXPANDED:
      return state.setIn(['expandedStudents', action.studentId.toString()], action.value)
    default:
      return state
  }
}
