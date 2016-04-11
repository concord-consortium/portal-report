import fetch from 'isomorphic-fetch'
import { fetchReportData } from '../api'

export const INVALIDATE_DATA = 'INVALIDATE_DATA'
export const REQUEST_DATA = 'REQUEST_DATA'
export const RECEIVE_DATA = 'RECEIVE_DATA'
export const RECEIVE_ERROR = 'RECEIVE_ERROR'
export const SET_NOW_SHOWING = 'SET_NOW_SHOWING'
export const SET_ANONYMOUS = 'SET_ANONYMOUS'
export const SET_QUESTION_SELECTED = 'SET_QUESTION_SELECTED'
export const SHOW_SELECTED_QUESTIONS = 'SHOW_SELECTED_QUESTIONS'
export const SHOW_ALL_QUESTIONS = 'SHOW_ALL_QUESTIONS'
export const SET_ANSWER_SELECTED_FOR_COMPARE = 'SET_ANSWER_SELECTED_FOR_COMPARE'
export const SHOW_COMPARE_VIEW = 'SHOW_COMPARE_VIEW'
export const HIDE_COMPARE_VIEW = 'HIDE_COMPARE_VIEW'

// When fetch succeeds, receiveData action will be called with the response object (json in this case).
// REQUEST_DATA action will be processed by the reducer immediately.
// See: api-middleware.js
function requestData() {
  return {
    type: REQUEST_DATA,
    callAPI: {
      type: 'fetchReportData',
      successAction: receiveData,
      errorAction: receiveError
    }
  }
}

function receiveData(response) {
  return {
    type: RECEIVE_DATA,
    response: response,
    receivedAt: Date.now()
  }
}

function receiveError(response) {
  return {
    type: RECEIVE_ERROR,
    response: response,
    receivedAt: Date.now()
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
      return dispatch(requestData())
    }
  }
}

export function invalidateData() {
  return {type: INVALIDATE_DATA}
}

export function setQuestionSelected(key, value) {
  return (dispatch, getState) => {
    const questionsMap = getState().getIn(['report', 'questions'])
    // the questionsMap represents the previous state of the checkboxes so the filter needs to special case the current key
    const selectedQuestionKeys = [...questionsMap.values()].filter(q => q.get('key') === key ? value : q.get('selected')).map(q => q.get('key'))
    dispatch({
      type: SET_QUESTION_SELECTED,
      key, value,
      // Send data to server. Don't care about success or failure. See: api-middleware.js
      callAPI: {
        type: 'updateReportSettings',
        data: {
          visibility_filter: {
            questions: selectedQuestionKeys
          }
        }
      }
    })
  }
}

export function showSelectedQuestions() {
  return (dispatch, getState) => {
    const questionsMap = getState().getIn(['report', 'questions'])
    dispatch({
      type: SHOW_SELECTED_QUESTIONS,
      // Send data to server. Don't care about success or failure. See: api-middleware.js
      callAPI: {
        type: 'updateReportSettings',
        data: {
          visibility_filter: {
            active: true
          }
        }
      }
    })
  }
}

export function showAllQuestions() {
  return {
    type: SHOW_ALL_QUESTIONS,
    // Send data to server. Don't care about success or failure. See: api-middleware.js
    callAPI: {
      type: 'updateReportSettings',
      data: {
        visibility_filter: {
          active: false
        }
      }
    }
  }
}

export function setNowShowing(value) {
  return {
    type: SET_NOW_SHOWING,
    value
  }
}

export function setAnonymous(value) {
  return {
    type: SET_ANONYMOUS,
    value,
    // Send data to server. Don't care about success or failure. See: api-middleware.js
    callAPI: {
      type: 'updateReportSettings',
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
