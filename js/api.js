import fetch from 'isomorphic-fetch'
import fakeData from './data/report.json'

const warn = (message) => {
  if (console && typeof console.warn == 'function') {
    console.warn(message);
  }
}
const urlParams = (() => {
  const query = window.location.search.substring(1)
  const rawVars = query.split("&")
  let params = {}
  rawVars.forEach((v) => {
    let arr = v.split("=")
    let pair = arr.splice(0, 1);
    pair.push(arr.join("="));
    params[pair[0]] = decodeURIComponent(pair[1])
  })
  return params
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
