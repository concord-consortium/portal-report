import Immutable, { Map, Set } from 'immutable'
import {
  REQUEST_DATA, RECEIVE_DATA, RECEIVE_ERROR, INVALIDATE_DATA, SET_ANONYMOUS,
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

function report(state = null, action) {
  switch (action.type) {
    case RECEIVE_DATA:
      const data = transformJSONResponse(action.response)
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
