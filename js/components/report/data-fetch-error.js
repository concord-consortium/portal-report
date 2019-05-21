import React, { PureComponent } from "react";

import "../../../css/report/data-fetch-error.less";

export default class DataFetchError extends PureComponent {
  renderUnauthorized() {
    return <div>
      You are not authorized to access report data. Your access token might have expired.
      Please go back to Portal and launch report again.
    </div>;
  }

  renderNetworkError(error) {
    return <div>
      <div>A network error occurred. Please go back to Portal and launch report again.</div>
      <h3>Details</h3>
      <div>{error.statusText}</div>
    </div>;
  }

  renderGenericInfo(error) {
    return (
      <div>
        <div>URL: {error.url}</div>
        <div>Status: {error.status}</div>
        <div>Status text: {error.statusText}</div>
      </div>
    );
  }

  renderError(error) {
    switch (error.status) {
      case 401:
        return this.renderUnauthorized();
      case 403:
        return this.renderUnauthorized();
      case 599:
        return this.renderNetworkError(error);
      default:
        return this.renderGenericInfo(error);
    }
  }

  render() {
    const { error } = this.props;
    return (
      <div className="data-fetch-error">
        <h2>Connection to server failed</h2>
        {this.renderError(error)}
      </div>
    );
  }
}
