import fetch from 'isomorphic-fetch'
import fakeData from './data/report.json'
import queryString from 'query-string'

const warn = (message) => {
  if (console && typeof console.warn == 'function') {
    console.warn(message);
  }
}
const urlParams = (() => {
  return  queryString.parse(window.location.search)
})()

// Report URL and auth tokens are provided as an URL parameters.
const REPORT_URL = urlParams['reportUrl']
const AUTH_HEADER = `Bearer ${urlParams['token']}`

export function fetchReportData() {
  if (REPORT_URL) {
    return fetch(REPORT_URL, {headers: {'Authorization': AUTH_HEADER}})
      .then(checkStatus)
      .then(response => response.json())
  } else {
    // Use fake data if REPORT_URL is not available.
    return new Promise(resolve => setTimeout(() => resolve(fakeData), 500))
  }
}

export function updateReportSettings(data) {
  if (REPORT_URL) {
    return fetch(REPORT_URL, {
      method: 'put',
      headers: {
        'Authorization': AUTH_HEADER,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
  }
  else {
    warn("No REPORT_URL. Faking put method.");
    return new Promise(resolve => {})
  }
}

export class APIError {
  constructor(statusText, response) {
    this.message = statusText
    this.response = response
  }
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    throw new APIError(response.statusText, response)
  }
}
