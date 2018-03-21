import fetch from 'isomorphic-fetch'
import { enableActivityFeedback } from './index'

export const LOAD_RUBRIC = 'LOAD_RUBRIC'
export const REQUEST_RUBRIC = 'REQUEST_RUBRIC'

const rubricUrlCache = {}

const notInCache = (url) => {
  return (!rubricUrlCache[url])
}

const exists = (immutable, fieldName) => {
  const value = immutable.get(fieldName)
  return (value && value.length && value.length > 0) ||
         (value && value.size && value.size > 0)
}

/*
  addRubric is called after we have received the rubric
  data by making a request to rubricUrl. We cache the response
  and also update the portal activity feedback settings to include
  the complete json for the rubric.
*/
const addRubric = (data) => {
  const {url, rubric} = data
  return (dispatch, getState) => {
    const activities = getState().getIn(['report', 'activities'])

    // Activities from the portal without rubric _content_.
    // If the activities specify a rubricUrl and that url is
    // the same as we just received prepare to update the portal
    const needToSaveRubricActs = activities
      .filter(act => !exists(act, 'rubric'))
      .filter(act => act.get('rubricUrl') === url)

    rubricUrlCache[url] = rubric
    dispatch({
      type: LOAD_RUBRIC,
      url,
      rubric
    })

    needToSaveRubricActs.forEach(act => {
      const activityId = act.get('id')
      const activityFeedbackId = act.get('activityFeedbackId')
      const feedbackFlags = {
        activityFeedbackId,
        rubric,
        rubricUrl: url
      }
      // Event will trigger API call that will update the rubric in the portal.
      // Doesn't require that we invalidate student answers though.
      dispatch(enableActivityFeedback(activityId, feedbackFlags, false))
    })
  }
}

// The api-middlewear calls this function when we need
// to load rubric in from a rubricUrl.
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
        resolve({rubricUrl, rubric: rubricUrlCache[rubricUrl]})
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

    // We load existing rubric (in complete activites) into the store
    // and into the rubricUrlCache ...
    withRubric.forEach(a => {
      dispatch({
        type: LOAD_RUBRIC,
        url: a.get('rubricUrl'),
        rubric: a.get('rubric')
      })
    })

    // Make requests for all the missing rubric
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
