import React, { PureComponent } from "react";

import "../../../css/report/data-fetch-error.less";

export default class DataFetchError extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // In order to reuse updateBodyText we can't call it in the constructor because
  // we can't call setState until the component has been mounted
  componentDidMount() {
    this.updateBodyText();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.error !== this.props.error) {
      this.updateBodyText();
    }
  }

  updateBodyText() {
    const { error } = this.props;
    const body = error.body;
    if (typeof body === "string") {
      // This Component is used to render plain text for example in the
      // iframe-standalone-app
      this.setState({errorBodyText: body});
    } else if (typeof error.text === "function") {
      // The error is like a fetch response which has a text message to get the
      // text of the response

      // set an initial message
      this.setState({errorBodyText: "Loading error message..."});
      // load text of actual body and update state when it has been loaded
      error.text().then(text =>  this.setState({errorBodyText: text}));
    } else {
      this.setState({errorBodyText: null});
    }
  }

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

  renderGenericUrlInfo(error) {
    return (
      <div>
        <div>URL: {error.url}</div>
        <div>Status: {error.status}</div>
        <div>Status text: {error.statusText}</div>
      </div>
    );
  }

  renderGenericMessage(error) {
    return (
      <div>
        <div>{error}</div>
      </div>
    );
  }

  renderError(error) {
    if (this.state.errorBodyText) {
      return this.renderGenericMessage(this.state.errorBodyText);
    }
    switch (error.status) {
      case 401:
        return this.renderUnauthorized();
      case 403:
        return this.renderUnauthorized();
      case 599:
        return this.renderNetworkError(error);
      default:
        return this.renderGenericUrlInfo(error);
    }
  }

  render() {
    const { error } = this.props;
    return (
      <div className="data-fetch-error" data-cy="dataError">
        <h2>{error.title || "Connection to server failed"}</h2>
        {this.renderError(error)}
      </div>
    );
  }
}
