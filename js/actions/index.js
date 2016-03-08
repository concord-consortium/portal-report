import fetch from 'isomorphic-fetch'
import fakeData from 'json!../data/report.json'
import { REPORT_URL } from '../api'

export const INVALIDATE_DATA = 'INVALIDATE_DATA'
export const REQUEST_DATA = 'REQUEST_DATA'
export const RECEIVE_DATA = 'RECEIVE_DATA'
export const SET_ANONYMOUS = 'SET_ANONYMOUS'
export const SET_QUESTION_SELECTED = 'SET_QUESTION_SELECTED'
export const SHOW_SELECTED_QUESTIONS = 'SHOW_SELECTED_QUESTIONS'
export const SHOW_ALL_QUESTIONS = 'SHOW_ALL_QUESTIONS'

function requestData() {
  return {type: REQUEST_DATA}
}

export function invalidateData() {
  return {type: INVALIDATE_DATA}
}

function receiveData(json) {
  return {
    type: RECEIVE_DATA,
    data: json,
    receivedAt: Date.now()
  }
}

function fetchData() {
  return dispatch => {
    dispatch(requestData())
    if (REPORT_URL) {
      return fetch(REPORT_URL)
        .then(response => response.json())
        .then(json => dispatch(receiveData(json)))
    } else {
      setTimeout(() => dispatch(receiveData(fakeData)), 500)
    }
  }
}

function shouldFetchData(state) {
  const data = state.get('data')
  if (data.get('isFetching')) {
    return false
  }
  return data.get('didInvalidate') || !data.get('lastUpdated')
}

export function fetchDataIfNeeded() {
  return (dispatch, getState) => {
    if (shouldFetchData(getState())) {
      return dispatch(fetchData())
    }
  }
}

export function setQuestionSelected(key, value) {
  return {type: SET_QUESTION_SELECTED, key, value}
}

export function showSelectedQuestions() {
  return (dispatch, getState) => {
    const questionsMap = getState().getIn(['report', 'questions'])
    const selectedQuestionKeys = [...questionsMap.values()].filter(q => q.get('selected')).map(q => q.get('key'))
    dispatch({
      type: SHOW_SELECTED_QUESTIONS,
      // Send data to server. See: remote-action-middleware.js
      remote: {
        data: {
          visibility_filter: {
            active: true,
            questions: selectedQuestionKeys
          }
        }
      }
    })
  }
}

export function showAllQuestions() {
  return {
    type: SHOW_ALL_QUESTIONS,
    // Send data to server. See: remote-action-middleware.js
    remote: {
      data: {
        visibility_filter: {
          active: false
        }
      }
    }
  }
}

export function setAnonymous(value) {
  return {
    type: SET_ANONYMOUS,
    value,
    // Send data to server. See: remote-action-middleware.js
    remote: {
      data: {
        anonymous_report: value
      }
    }
  }
}
