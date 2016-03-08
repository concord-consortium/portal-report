import fetch from 'isomorphic-fetch'
import { REPORT_URL } from './api'

export default store => next => action => {
  const remote = action.remote
  if (!remote) return next(action)
  const url = remote.url || REPORT_URL
  // URL might not be defined if we are in test env and use mock data.
  if (!url)  return next(action)
  fetch(remote.url || REPORT_URL, {
    method: remote.method || 'put',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(remote.data)
  })
  return next(action)
}
