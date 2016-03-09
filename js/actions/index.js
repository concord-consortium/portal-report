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
export const SET_ANSWER_SELECTED_FOR_COMPARE = 'SET_ANSWER_SELECTED_FOR_COMPARE'
export const SHOW_COMPARE_VIEW = 'SHOW_COMPARE_VIEW'
export const HIDE_COMPARE_VIEW = 'HIDE_COMPARE_VIEW'

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

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

function fetchData() {
  return dispatch => {
    dispatch(requestData())
    if (REPORT_URL) {
      return fetch(REPORT_URL)
        .then(checkStatus)
        .then(response => response.json())
        .then(json => dispatch(receiveData(json)))
        .catch(error => dispatch(receiveData(null)))
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

export function setAnswerSelectedForCompare(key, value) {
  return {type: SET_ANSWER_SELECTED_FOR_COMPARE, key, value}
}

export function showCompareView(embeddableKey) {
  return {type: SHOW_COMPARE_VIEW, embeddableKey}
}

export function hideCompareView() {
  return {type: HIDE_COMPARE_VIEW}
}
