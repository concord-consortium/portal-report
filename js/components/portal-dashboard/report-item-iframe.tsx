import React, { PureComponent } from "react";
import iframePhone from "iframe-phone";
import { /* handleGetAttachmentUrl, */ IReportItemInitInteractive, IStudentHTML } from "@concord-consortium/interactive-api-host";

interface Props {
  question: any;
  view: "singleAnswer" | "multipleAnswer";
}

interface State {
  requestedHeight: number|null;
  src?: string;
}

export default class ReportItemIframe extends PureComponent<Props, State> {
  private iframePhone: any;

  constructor (props: Props) {
    super(props);
    this.state = {
      // Height requested by interactive itself, using iframe-phone.
      requestedHeight: null,
      src: props.question.get("reportItemUrl")
    };
  }

  componentDidMount() {
    this.connect();
  }

  componentWillUnmount() {
    this.disconnect();
  }

  connect() {
    const phoneAnswered = () => {
      const initMessage: IReportItemInitInteractive = {
        version: 1,
        mode: "reportItem",
        hostFeatures: {}, // TODO
        authoredState: {}, // TODO
        interactiveItemId: this.props.question.get("id"),
        view: this.props.view,
        students: {} // TODO: Record<string, {hasAnswer: boolean}>,
      };
      this.iframePhone.post("initInteractive", initMessage);
    };
    // eslint-disable-next-line react/no-string-refs
    this.iframePhone = new iframePhone.ParentEndpoint(this.refs.iframe, phoneAnswered);

    this.iframePhone.addListener("studentHTML", this.handleStudentHTML);
    this.iframePhone.addListener("height", this.handleHeight);
    // this.iframePhone.addListener("getAttachmentUrl", this.handleGetAttachmentUrl);
  }

  handleStudentHTML = (response: IStudentHTML) => {
    // TODO
  }

  /*

  TODO LATER

  handleGetAttachmentUrl = (request) => {
    const answerMeta = this.props.answer.toJS();
    return handleGetAttachmentUrl({ request, answerMeta })
      .then(response => {
        this.iframePhone.post("attachmentUrl", response);
        return response;
      })
      .catch(console.error);
  }
  */

  handleHeight = (height: number) => {
    this.setState({ requestedHeight: height });
  }

  disconnect() {
    if (this.iframePhone) {
      this.iframePhone.disconnect();
      this.iframePhone = null;
    }
  }

  render() {
    const { requestedHeight, src } = this.state;

    if (!src) {
      return null;
    }

    return (
      // eslint-disable-next-line react/no-string-refs
      <iframe ref="iframe"
        src={src}
        height={requestedHeight || "300px"}
        style={{border: "none", marginTop: "0.5em"}}
      />
    );
  }
}
