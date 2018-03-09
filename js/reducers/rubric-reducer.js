import { Map } from 'immutable'
import { LOAD_RUBRIC, REQUEST_RUBRIC } from '../actions/load-rubric'

const INITIAL_RUBRIC_STATE = Map({})

export function rubricReducer (state = INITIAL_RUBRIC_STATE, action) {
  switch (action.type) {
    case REQUEST_RUBRIC:
      // NOOP for now.
      return state
    case LOAD_RUBRIC:
      const {url, rubric} = action
      return state.set(url, rubric)

    default:
      return state
  }
}
