import Immutable, { Map, Set} from 'immutable'
import {
  REQUEST_DATA, RECEIVE_DATA, RECEIVE_ERROR, INVALIDATE_DATA, SET_NOW_SHOWING, SET_ANONYMOUS,
  SET_QUESTION_SELECTED, SHOW_SELECTED_QUESTIONS, SHOW_ALL_QUESTIONS,
  SET_ANSWER_SELECTED_FOR_COMPARE, SHOW_COMPARE_VIEW, HIDE_COMPARE_VIEW, ENABLE_FEEDBACK} from '../actions'

import feedbackReducer from './feedback-reducer'

import transformJSONResponse from '../core/transform-json-response'
import { noSelection } from '../calculations'


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

function setAnonymous(state, anonymous) {
  let idx = 1
  const newStudents = state.get('students').map(s => s.set('name', anonymous ? `Student ${idx++}` : s.get('realName')))
  return state.set('anonymous', anonymous)
              .set('students', newStudents)
}

function setVisibilityFilterActive(state, filterActive) {
  return state.withMutations(state => {

    state.set('visibilityFilterActive', filterActive)
    state.get('questions').forEach((value, key) => {
      const questionSelected = state.getIn(['questions', key, 'selected'])
      // Question is visible if it's selected, visibility filter is inactive, or none are selected
      state = state.setIn(['questions', key, 'visible'], questionSelected || !filterActive || noSelection(state))
    })
    return state
  })
}


function enableFeedback(state, action) {
  const {embeddableKey, feedbackFlags} = action
  return state.mergeIn(['questions', embeddableKey], feedbackFlags)
}


const INITIAL_REPORT_STATE = Map({
  type: 'class'
})


function report(state = INITIAL_REPORT_STATE, action) {
  switch (action.type) {
    case RECEIVE_DATA:
      const data = transformJSONResponse(action.response)
      state = state
        .set('students', Immutable.fromJS(data.entities.students))
        .set('investigations', Immutable.fromJS(data.entities.investigations))
        .set('activities', Immutable.fromJS(data.entities.activities))
        .set('sections', Immutable.fromJS(data.entities.sections))
        .set('pages', Immutable.fromJS(data.entities.pages))
        .set('questions', Immutable.fromJS(data.entities.questions))
        .set('answers', Immutable.fromJS(data.entities.answers))
        .set('clazzName', data.result.class.name)
        .set('hideSectionNames', data.result.isOfferingExternal)
        .set('type', data.type)
        .set('nowShowing', data.type)
        .set('hideControls', data.result.hideControls)
      state = setAnonymous(state, data.result.anonymousReport)
      state = setVisibilityFilterActive(state, data.result.visibilityFilter.active && !data.result.hideControls)
      return state
    case SET_NOW_SHOWING:
      return state.set('nowShowing', action.value)
    case SET_QUESTION_SELECTED:
      return state.setIn(['questions', action.key, 'selected'], action.value)
    case SHOW_SELECTED_QUESTIONS:
      return setVisibilityFilterActive(state, true)
    case SHOW_ALL_QUESTIONS:
      return setVisibilityFilterActive(state, false)
    case SET_ANONYMOUS:
      return setAnonymous(state, action.value)
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
    case ENABLE_FEEDBACK:
      return enableFeedback(state, action)
    default:
      return state
  }
}

export default function reducer(state = Map(), action) {
  return Map({
    data: data(state.get('data'), action),
    report: report(state.get('report'), action),
    feedbacks: feedbackReducer(state.get('feedbacks'), action)
  })
}
