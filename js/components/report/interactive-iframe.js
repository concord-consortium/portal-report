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
      this.iframePhone.post("initInteractive", typeof state === "string" ? JSON.parse(state) : state);
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
        // FIXME: if this is a teacher viewing the report of a student there will be a studentId
        // but the token will be for a teacher, so then the resourceLinkId should be null
        // I don't understand this comment anymore
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
