import React, { PureComponent } from 'react'

import '../../css/data-fetch-error.less'

export default class DataFetchError extends PureComponent {
  renderUnauthorized() {
   return <div>
      You are not authorized to access report data. Your access token might have expired.
      Please go back to Portal and launch report again.
    </div>
  }

  renderGenericInfo(error) {
    return (
      <div>
        <div>URL: {error.url}</div>
        <div>Status: {error.status}</div>
        <div>Status text: {error.statusText}</div>
      </div>
    )
  }

  renderError(error) {
    switch(error.status) {
      case 401:
        return this.renderUnauthorized()
      default:
        return this.renderGenericInfo(error)
    }
  }

  render() {
    const { error } = this.props
    return (
      <div className='data-fetch-error'>
        <h2>Report data download failed</h2>
        {this.renderError(error)}
      </div>
    )
  }
}
