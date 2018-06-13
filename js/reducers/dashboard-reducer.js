import { Map } from 'immutable'

const INITIAL_DASHBOARD_STATE = Map({
  sortBy: 'name',
  expandedActivities: Map(),
  expandedStudents: Map()
})

export default function dashboardReducer (state = INITIAL_DASHBOARD_STATE, action) {
  switch (action.type) {
    default:
      return state
  }
}
