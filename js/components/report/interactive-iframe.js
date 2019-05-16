import React, { PureComponent } from "react";
import iframePhone from "iframe-phone";

export default class InteractiveIframe extends PureComponent {
  componentDidMount() {
    this.connect();
  }

  componentWillUnmount() {
    this.disconnect();
  }

  connect() {
    const { state } = this.props;
    if (!state) { return; }

    const phoneAnswered = () => {
      this.iframePhone.post("initInteractive", typeof state === "string" ? JSON.parse(state) : state);
    };
    this.iframePhone = new iframePhone.ParentEndpoint(this.refs.iframe, phoneAnswered);
  }

  disconnect() {
    if (this.iframePhone) {
      this.iframePhone.disconnect();
      this.iframePhone = null;
    }
  }

  render() {
    const { src, width, height } = this.props;
    return (
      <iframe ref="iframe"
        src={src}
        width={width || "300px"}
        height={height || "300px"}
        style={{border: "none", marginTop: "0.5em"}} />
    );
  }
}
