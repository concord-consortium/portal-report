import { Map } from 'immutable'
import { RECEIVE_DATA } from '../actions/index'
import { LOAD_RUBRIC, REQUEST_RUBRIC } from '../actions/rubric'

const INITIAL_RUBRIC_STATE = Map({})

export function rubricReducer (state = INITIAL_RUBRIC_STATE, action) {
  switch (action.type) {
    case RECEIVE_DATA:
      const activities = action.response.report.children || []
      const nextState = activities.reduce((_state, act) => {
        return _state.set(act.rubric_url, act.rubric)
      }, state)

      return nextState
    case REQUEST_RUBRIC:
      // NOOP for now.
      return state
    case LOAD_RUBRIC:
      const {url, rubric} = action
      return state.set(url, Map(rubric))
    default:
      return state
  }
}
