import Immutable, { Map, Set } from 'immutable'
import {
  REQUEST_DATA, RECEIVE_DATA, INVALIDATE_DATA, SET_ANONYMOUS,
  SET_QUESTION_SELECTED, SHOW_SELECTED_QUESTIONS, SHOW_ALL_QUESTIONS } from '../actions'
import transformJSONResponse from '../core/transform-json-response'

function data(state = Map(), action) {
  switch (action.type) {
    case INVALIDATE_DATA:
      return state.set('didInvalidate', true)
    case REQUEST_DATA:
      return state.set('isFetching', true)
    case RECEIVE_DATA:
      return state.set('isFetching', false)
                  .set('didInvalidate', false)
                  .set('lastUpdated', action.receivedAt)
    default:
      return state
  }
}

function report(state = null, action) {
  switch (action.type) {
    case RECEIVE_DATA:
      const data = transformJSONResponse(action.data)
      return Map({
        students: Immutable.fromJS(data.entities.students),
        investigations: Immutable.fromJS(data.entities.investigations),
        activities: Immutable.fromJS(data.entities.activities),
        sections: Immutable.fromJS(data.entities.sections),
        pages: Immutable.fromJS(data.entities.pages),
        questions: Immutable.fromJS(data.entities.questions),
        answers: Immutable.fromJS(data.entities.answers),
        clazzName: data.result.class.name,
        visibilityFilterActive: data.result.visibilityFilter.active,
        anonymousReport: data.result.anonymousReport,
        hideSectionNames: data.result.isOfferingExternal
      })
    case SET_QUESTION_SELECTED:
      return state.setIn(['questions', action.key, 'selected'], action.value)
    case SHOW_SELECTED_QUESTIONS:
      // For each question: visible = selected
      return state.withMutations(state => {
        state.set('visibilityFilterActive', true)
        state.get('questions').forEach((value, key) => {
          state = state.setIn(['questions', key, 'visible'], state.getIn(['questions', key, 'selected']))
        })
        return state
      })
    case SHOW_ALL_QUESTIONS:
      return state.set('visibilityFilterActive', false)
    case SET_ANONYMOUS:
      return state.set('anonymousReport', action.value)
    default:
      return state
  }
}

export default function reducer(state = Map(), action) {
  return Map({
    data: data(state.get('data'), action),
    report: report(state.get('report'), action)
  })
}
