import React, { PureComponent } from "react";
import iframePhone from "iframe-phone";
import { fetchFirestoreJWTWithDefaultParams } from "../../api";
import { handleGetAttachmentUrl } from "@concord-consortium/interactive-api-host";

export default class InteractiveIframe extends PureComponent {
  constructor (props) {
    super(props);
    this.state = {
      // Height requested by interactive itself, using iframe-phone.
      requestedHeight: null
    };
  }

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
      let initMsgContent = typeof state === "string" ? JSON.parse(state) : state;
      if (initMsgContent.interactiveState && typeof initMsgContent.interactiveState === "string") {
        try {
          // Try to provide parsed interactiveState to be consistent with other LARA Interactive API providers
          // like LARA or Activity Player.
          initMsgContent = {
            ...initMsgContent,
            interactiveState: JSON.parse(initMsgContent.interactiveState)
          };
        } catch (e) {
          // InteractiveState isn't a valid JSON. Just pass it through to the interactive.
          // Note that it shouldn't happen in practice, as other systems seem to use mostly JSON states,
          // or they JSON.stringify even plain values like strings.
        }
      }
      this.iframePhone.post("initInteractive", initMsgContent);
    };
    // eslint-disable-next-line react/no-string-refs
    this.iframePhone = new iframePhone.ParentEndpoint(this.refs.iframe, phoneAnswered);

    this.iframePhone.addListener("getFirebaseJWT", this.handleGetFirebaseJWT);
    this.iframePhone.addListener("height", this.handleHeight);
    this.iframePhone.addListener("getAttachmentUrl", this.handleGetAttachmentUrl);
  }

  handleGetFirebaseJWT = (options) => {
    return fetchFirestoreJWTWithDefaultParams(options.firebase_app)
      .then(json => {
        this.iframePhone.post("firebaseJWT", json);
        return json;
      })
      .catch(console.error);
  }

  handleGetAttachmentUrl = (request) => {
    const answerMeta = this.props.answer.toJS();
    return handleGetAttachmentUrl({ request, answerMeta })
      .then(response => {
        this.iframePhone.post("attachmentUrl", response);
        return response;
      })
      .catch(console.error);
  }

  handleHeight = (height) => {
    this.setState({ requestedHeight: height });
  }

  disconnect() {
    if (this.iframePhone) {
      this.iframePhone.disconnect();
      this.iframePhone = null;
    }
  }

  render() {
    const { src, width, height, style } = this.props;
    const { requestedHeight } = this.state;
    return (
      // eslint-disable-next-line react/no-string-refs
      <iframe ref="iframe"
        src={src}
        width={width || "300px"}
        height={requestedHeight || height || "300px"}
        style={style || {border: "none", marginTop: "0.5em"}}
        allow={"fullscreen"} />
    );
  }
}
