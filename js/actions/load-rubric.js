import fetch from 'isomorphic-fetch'

export const LOAD_RUBRIC = 'LOAD_RUBRIC'
export const REQUEST_RUBRIC = 'REQUEST_RUBRIC'

const urlCache = {}
const addRubric = (data) => {
  const {url, rubric} = data
  return (dispatch, getState) => {
    urlCache[url] = rubric
    dispatch({
      type: LOAD_RUBRIC,
      url,
      rubric
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
    const urls = state.getIn(['report', 'activities']).map(a => a.get('rubricUrl'))
    urls.filter(u => u).forEach((u) => {
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
