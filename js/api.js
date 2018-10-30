import fetch from 'isomorphic-fetch'
import fakeData from './data/report.json'
import queryString from 'query-string'

const warn = (message) => {
  if (console && typeof console.warn === 'function') {
    console.warn(message)
  }
}
const urlParam = (name) => {
  return queryString.parse(window.location.search)[name]
}

// Report URL and auth tokens are provided as an URL parameters.
const getReportUrl = () => {
  const reportUrl = urlParam('reportUrl')
  const offeringUrl = urlParam('offering')
  if (reportUrl) {
    return reportUrl
  }
  if (offeringUrl) {
    // When this report is used an external report, it will be launched with offering URL parameter instead of reportUrl.
    // In this case, modify this URL to point to the correct API.
    return offeringUrl.replace('/offerings/', '/reports/')
  }
  return null
}

const getAuthHeader = () => `Bearer ${urlParam('token')}`

export function fetchReportData () {
  const reportUrl = getReportUrl()
  const authHeader = getAuthHeader()
  if (reportUrl) {
    return fetch(reportUrl, {headers: {'Authorization': authHeader}})
      .then(checkStatus)
      .then(response => response.json())
  } else {
    // Use fake data if REPORT_URL is not available.
    return new Promise(resolve => setTimeout(() => resolve(fakeData), 500))
  }
}

export function updateReportSettings (data) {
  const reportUrl = getReportUrl()
  const authHeader = getAuthHeader()
  if (reportUrl) {
    return fetch(reportUrl, {
      method: 'put',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(checkStatus)
  } else {
    warn('No REPORT_URL. Faking put method.')
    return new Promise(resolve => {})
  }
}

// The api-middleware calls this function when we need to load rubric in from a rubricUrl.
const rubricUrlCache = {}

export function fetchRubric (rubricUrl) {
  return new Promise((resolve, reject) => {
    if (!rubricUrlCache[rubricUrl]) {
      fetch(rubricUrl)
        .then(checkStatus)
        .then(response => response.json())
        .then(newRubric => {
          rubricUrlCache[rubricUrl] = newRubric
          resolve({ url: rubricUrl, rubric: newRubric })
        })
        .catch(e => {
          console.error(`unable to load rubric at: ${rubricUrl}`)
          reject(e)
        })
    } else {
      // Cache available, resolve promise immediately and return cached value.
      resolve({rubricUrl, rubric: rubricUrlCache[rubricUrl]})
    }
  })
}

export class APIError {
  constructor (statusText, response) {
    this.message = statusText
    this.response = response
  }
}

function checkStatus (response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    throw new APIError(response.statusText, response)
  }
}
