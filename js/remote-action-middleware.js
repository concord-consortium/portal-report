import fetch from 'isomorphic-fetch'
import { REPORT_URL } from './api-urls'

export default store => next => action => {
  const remote = action.remote
  if (remote) {
    fetch(remote.url || REPORT_URL, {
      method: remote.method || 'put',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body:  JSON.stringify(remote.data)
    })
  }
  return next(action);
}
