import React, { PureComponent } from "react";
import iframePhone from "iframe-phone";
import { fetchOfferingData, fetchClassData, fetchFirestoreJWT } from "../../api";
import { urlParam } from "../../util/misc";

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
  }

  handleGetFirebaseJWT = (options) => {
    return Promise.all([fetchOfferingData(), fetchClassData()])
      .then(([offeringData, classData]) => {
        const resourceLinkId = offeringData.id.toString();
        // only pass resourceLinkId if there is a studentId
        // This could be a teacher or researcher viewing the report of a student
        // The studentId is sent in the firestore JWT request as the target_user_id
        return fetchFirestoreJWT(classData.class_hash, urlParam("studentId") ? resourceLinkId : null, urlParam("studentId"), options.firebase_app);
      })
      .then(json => {
        this.iframePhone.post("firebaseJWT", json);
        return json;
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
