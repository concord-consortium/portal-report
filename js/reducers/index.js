import Immutable, { Map, Set } from 'immutable'
import {
  REQUEST_DATA, RECEIVE_DATA, RECEIVE_ERROR, INVALIDATE_DATA, SET_TYPE, SET_ANONYMOUS,
  SET_QUESTION_SELECTED, SHOW_SELECTED_QUESTIONS, SHOW_ALL_QUESTIONS,
  SET_ANSWER_SELECTED_FOR_COMPARE, SHOW_COMPARE_VIEW, HIDE_COMPARE_VIEW} from '../actions'

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
                  .set('error', null)
                  .set('lastUpdated', action.receivedAt)
    case RECEIVE_ERROR:
      return state.set('isFetching', false)
                  .set('didInvalidate', false)
                  .set('error', action.response)
                  .set('lastUpdated', action.receivedAt)
    default:
      return state
  }
}

const INITIAL_REPORT_STATE = Map({
  type: 'class'
})
function report(state = INITIAL_REPORT_STATE, action) {
  switch (action.type) {
    case RECEIVE_DATA:
      const data = transformJSONResponse(action.response)
      return state.set('students', Immutable.fromJS(data.entities.students))
                  .set('investigations', Immutable.fromJS(data.entities.investigations))
                  .set('activities', Immutable.fromJS(data.entities.activities))
                  .set('sections', Immutable.fromJS(data.entities.sections))
                  .set('pages', Immutable.fromJS(data.entities.pages))
                  .set('questions', Immutable.fromJS(data.entities.questions))
                  .set('answers', Immutable.fromJS(data.entities.answers))
                  .set('clazzName', data.result.class.name)
                  .set('visibilityFilterActive', data.result.visibilityFilter.active)
                  .set('anonymous', data.result.anonymousReport)
                  .set('hideSectionNames', data.result.isOfferingExterna)
    case SET_TYPE:
      return state.set('type', action.value)
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
      let idx = 1
      const newStudents = state.get('students').map(s => s.set('name', action.value ? `Student ${idx++}` : s.get('realName')))
      return state.set('anonymous', action.value)
                  .set('students', newStudents)
    case SET_ANSWER_SELECTED_FOR_COMPARE:
      const compareViewAns = state.get('compareViewAnswers')
      if (compareViewAns) {
        // If compare view is open and user unselect given answer, remove it from the compare set too.
        // It's possible, as there is "Remove" link in the compare view.
        state = state.set('compareViewAnswers', compareViewAns.delete(action.key))
      }
      return state.setIn(['answers', action.key, 'selectedForCompare'], action.value)
    case SHOW_COMPARE_VIEW:
      const selectedAnswerKeys = state.get('answers')
                                      .filter(a => a.get('selectedForCompare') && a.get('embeddableKey') === action.embeddableKey)
                                      .map(a => a.get('key'))
                                      .values()
      return state.set('compareViewAnswers', Set(selectedAnswerKeys))
    case HIDE_COMPARE_VIEW:
      return state.set('compareViewAnswers', null)
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
