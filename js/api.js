import fetch from 'isomorphic-fetch'
import fakeData from 'json!./data/report.json'

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

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}
