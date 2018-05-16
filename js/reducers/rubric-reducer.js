import { Map } from 'immutable'
import { LOAD_RUBRIC } from '../actions/rubric'

const INITIAL_RUBRIC_STATE = Map({})

export function rubricReducer (state = INITIAL_RUBRIC_STATE, action) {
  switch (action.type) {
    case LOAD_RUBRIC:
      const { url, rubric } = action
      return state.set(url, Map(rubric))
    default:
      return state
  }
}
