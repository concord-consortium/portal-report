import React, { PureComponent } from "react";
import iframePhone from "iframe-phone";
import { fetchClassData, fetchFirestoreJWT } from "../../api";

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
    // eslint-disable-next-line react/no-string-refs
    this.iframePhone = new iframePhone.ParentEndpoint(this.refs.iframe, phoneAnswered);

    this.iframePhone.addListener("getFirebaseJWT", this.handleGetFirebaseJWT);
    this.iframePhone.addListener("height", this.handleHeight);
  }

  handleGetFirebaseJWT = (options) => {
    return fetchClassData()
      .then(classData => fetchFirestoreJWT(classData.class_hash, options.firebase_app))
      .then(json => {
        this.iframePhone.post("firebaseJWT", json);
        return json;
      })
      .catch(console.error);
  }

  handleHeight = (height) => {
    this.refs.iframe.height = height;
  }

  disconnect() {
    if (this.iframePhone) {
      this.iframePhone.disconnect();
      this.iframePhone = null;
    }
  }

  render() {
    const { src, width, height, style } = this.props;
    return (
      // eslint-disable-next-line react/no-string-refs
      <iframe ref="iframe"
        src={src}
        width={width || "300px"}
        height={height || "300px"}
        style={style || {border: "none", marginTop: "0.5em"}}
        allow={"fullscreen"} />
    );
  }
}
