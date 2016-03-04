import { Map, Set } from 'immutable'
import {
  REQUEST_DATA, RECEIVE_DATA, INVALIDATE_DATA, SET_ANONYMOUS,
  SET_QUESTION_SELECTED, SHOW_SELECTED_QUESTIONS, SHOW_ALL_QUESTIONS } from '../actions'

// Note that raw data obtained from server has JSON suffix, so it's clear it's not ImmutableJS structure.
// It's static data, so it doesn't make sense to convert it back into ImmutableJS objects
// and complicate regular, "dumb" components.

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

function report(state = Map(), action) {
  switch (action.type) {
    case RECEIVE_DATA:
      const data = action.data
      return Map({
        isExternalActivity: data.is_offering_external,
        name: data.class.name,
        // Raw data from server.
        reportJSON: Object.freeze(data.report)
      })
    default:
      return state
  }
}

function visibilityFilter(state = Map(), action) {
  switch (action.type) {
    case RECEIVE_DATA:
      const data = action.data.visibility_filter
      return Map({
        active: data.active,
        visibleQuestions: Set(data.questions),
        selectedQuestions: Set(data.questions)
      })
    case SET_QUESTION_SELECTED:
      const selQuestions = state.get('selectedQuestions')
      const { key, value } = action
      return state.set('selectedQuestions', value ? selQuestions.add(key) : selQuestions.delete(key))
    case SHOW_SELECTED_QUESTIONS:
      return state.set('visibleQuestions', state.get('selectedQuestions'))
                  .set('active', true)
    case SHOW_ALL_QUESTIONS:
      return state.set('active', false)
    default:
      return state
  }
}

function students(state = Map(), action) {
  // Reduce list of students into Map(ID -> name).
  const getStudentNames = (studentsJSON, anonymous) => {
    return studentsJSON.reduce((map, studentJSON, index) => {
      return map.set(studentJSON.id, anonymous ? `Student ${index}` : studentJSON.name)
    }, Map())
  }
  switch (action.type) {
    case RECEIVE_DATA:
      const data = action.data
      return Map({
        // Raw data from server.
        studentsJSON: Object.freeze(data.class.students),
        anonymous: data.anonymous_report,
        studentName: getStudentNames(data.class.students, data.anonymous_report)
      })
    case SET_ANONYMOUS:
      return state.set('anonymous', action.value)
                  // Theoretically we wouldn't have to regenerate this map, we could just use  `anonymous` flag.
                  // However this approach makes it a bit more bulletproof, any code that needs to get student name
                  // will simply work, it wouldn't have to worry about the flag value.
                  .set('studentName', getStudentNames(state.get('studentsJSON'), action.value))
    default:
      return state
  }
}

export default function reducer(state = Map(), action) {
  return Map({
    data: data(state.get('data'), action),
    report: report(state.get('report'), action),
    visibilityFilter: visibilityFilter(state.get('visibilityFilter'), action),
    students: students(state.get('students'), action)
  })
}
