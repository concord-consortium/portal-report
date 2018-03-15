import fetch from 'isomorphic-fetch'
import { enableActivityFeedback } from './index'

export const LOAD_RUBRIC = 'LOAD_RUBRIC'
export const REQUEST_RUBRIC = 'REQUEST_RUBRIC'

const exists = (immutable, fieldName) => {
  const value = immutable.get(fieldName)
  return (value && value.length && value.length > 0) ||
         (value && value.size && value.size > 0)
}

const urlCache = {}
const addRubric = (data) => {
  const {url, rubric} = data
  return (dispatch, getState) => {
    const activities = getState().getIn(['report', 'activities'])
    const updatable = activities
      .filter(act => !exists(act, 'rubric'))
      .filter(act => act.get('rubricUrl') === url)

    urlCache[url] = rubric
    dispatch({
      type: LOAD_RUBRIC,
      url,
      rubric
    })

    updatable.forEach(act => {
      const activityId = act.get('id')
      const activityFeedbackId = act.get('activityFeedbackId')
      const feedbackFlags = {
        activityFeedbackId,
        rubric,
        rubricUrl: url
      }
      dispatch(enableActivityFeedback(activityId, feedbackFlags))
    })
  }
}

const notInCache = (url) => {
  return (!urlCache[url])
}

export function loadRubric (data) {
  const isUrl = (string) => string && string.length && string.length > 0
  const rubricUrl = data
  return new Promise((resolve, reject) => {
    if (isUrl(rubricUrl)) {
      if (notInCache(rubricUrl)) {
        fetch(rubricUrl)
          .then(response => response.json())
          .then((newRurbic) => {
            resolve({url: rubricUrl, rubric: newRurbic})
          })
          .catch((e) => {
            console.error(e)
            console.error(`unable to load rubric at: ${rubricUrl}`)
            reject(e)
          })
      } else {
        resolve({rubricUrl, rubric: urlCache[rubricUrl]})
      }
    } else {
      resolve({})
    }
  })
}

export function requestRubric () {
  return (dispatch, getState) => {
    const state = getState()
    const activities = state.getIn(['report', 'activities'])
    const withRubric = activities.filter(act => exists(act, 'rubric') && exists(act, 'rubricUrl'))
    const withoutRubric = activities.filter(act => !exists(act, 'rubric'))
    const needingFetch = withoutRubric.filter(act => exists(act, 'rubricUrl'))

    withRubric.forEach(a => {
      dispatch({
        type: LOAD_RUBRIC,
        url: a.get('rubricUrl'),
        rubric: a.get('rubric')
      })
    })

    needingFetch.map(a => a.get('rubricUrl'))
      .forEach((u) => {
        dispatch({
          type: REQUEST_RUBRIC,
          callAPI: {
            type: 'loadRubric',
            data: u,
            successAction: addRubric
          }
        })
      })
  }
}
