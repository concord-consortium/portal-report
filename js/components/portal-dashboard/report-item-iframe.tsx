import React, { PureComponent } from "react";
import iframePhone from "iframe-phone";
import { handleGetAttachmentUrl, IAttachmentUrlRequest, IReportItemAnswer, IReportItemHandlerMetadata, IReportItemInitInteractive } from "@concord-consortium/interactive-api-host";
import { connect } from "react-redux";
import { Map } from "immutable";

import { getSortedStudents } from "../../selectors/report";
import { RootState } from "../../reducers";
import { getAnswersByQuestion } from "../../selectors/report-tree";
import { registerReportItem, unregisterReportItem, setReportItemAnswer } from "../../actions";

import css from "../../../css/portal-dashboard/report-item-iframe.less";

interface IProps {
  question: any;
  view: "singleAnswer" | "multipleAnswer" | "hidden";
  users: any;
  answersByQuestion: any;
  registerReportItem: (questionId: string, iframePhone: any, metadata: IReportItemHandlerMetadata) => void;
  unregisterReportItem: (questionId: string) => void;
  setReportItemAnswer: (answer: Map<string, any>, reportItemAnswer: IReportItemAnswer) => void;
}

interface IState {
  requestedHeight: number|null;
  src?: string;
}

const className = {
  singleAnswer: css.singleAnswerReportItemIframe,
  multipleAnswer: css.multipleAnswerReportItemIframe,
  hidden: css.hidden
};

class ReportItemIframe extends PureComponent<IProps, IState> {
  private iframePhone: any;

  constructor (props: IProps) {
    super(props);
    this.state = {
      // Height requested by interactive itself, using iframe-phone.
      requestedHeight: null,
      src: props.question.get("reportItemUrl")
    };
  }

  componentWillUnmount() {
    this.disconnect();
  }

  UNSAFE_componentWillReceiveProps(newProps: IProps) {
    if (newProps.question.get("id") !== this.props.question.get("id")) {
      this.disconnect();
    }
  }

  connect() {
    const phoneAnswered = () => {
      const questionId = this.props.question.get("id");
      const users = this.getUsersForInitMessage();

      const initMessage: IReportItemInitInteractive = {
        version: 1,
        mode: "reportItem",
        hostFeatures: {},
        interactiveItemId: questionId,
        view: this.props.view,
        users,
      };
      this.iframePhone.post("initInteractive", initMessage);
    };
    // eslint-disable-next-line react/no-string-refs
    this.iframePhone = new iframePhone.ParentEndpoint(this.refs.iframe, phoneAnswered);

    this.iframePhone.addListener("reportItemAnswer", this.handleReportItemAnswer);
    this.iframePhone.addListener("height", this.handleHeight);
    this.iframePhone.addListener("reportItemClientReady", (reportItemMetadata: IReportItemHandlerMetadata) => {
      this.props.registerReportItem(this.props.question.get("id"), this.iframePhone, reportItemMetadata);
    });
    this.iframePhone.addListener("getAttachmentUrl", this.handleGetAttachmentUrl.bind(this));
  }

  getUsersForInitMessage() {
    const questionId = this.props.question.get("id");
    const answers = this.props.answersByQuestion.get(questionId);

    // construct a map of user id to answer present
    const userHasAnswers = answers?.reduce((acc: Record<string, boolean>, answer: Map<string, any>) => {
      acc[answer.get("platformUserId")] = true;
      return acc;
    }, {});

    // construct a map of all users to answer present
    const users = this.props.users.reduce((acc: Record<string, {hasAnswer: boolean}>, user: any) => {
      const id = user.get("id");
      acc[id] = {hasAnswer: !!userHasAnswers?.[id]};
      return acc;
    }, {});

    return users;
  }

  handleReportItemAnswer = (reportItemAnswer: IReportItemAnswer) => {
    this.props.setReportItemAnswer(this.props.question.get("id"), reportItemAnswer);
  }

  handleGetAttachmentUrl = async (request: IAttachmentUrlRequest) => {
    const questionId = this.props.question.get("id");
    const answers = this.props.answersByQuestion.get(questionId);
    const answer = answers.get(request.platformUserId);
    const attachments = answer?.get("attachments")?.toJS() || undefined;

    if (attachments) {
      const response = await handleGetAttachmentUrl({
        request,
        answerMeta: {attachments}
      });

      this.iframePhone.post("attachmentUrl", response);
    }
  }

  handleHeight = (height: number) => {
    this.setState({ requestedHeight: height });
  }

  handleIframeLoaded = () => {
    this.connect();
  }

  disconnect() {
    if (this.iframePhone) {
      this.props.unregisterReportItem(this.props.question.get("id"));
      this.iframePhone.disconnect();
      this.iframePhone = null;
    }
  }

  render() {
    const { src } = this.state;

    if (!src) {
      return null;
    }

    const requestedHeight = this.state.requestedHeight || 0;
    const style = requestedHeight > 0 ? {height: requestedHeight} : {};

    return (
      // eslint-disable-next-line react/no-string-refs
      <iframe key={this.props.question.get("id")} ref="iframe" className={className[this.props.view]} src={src} style={style} onLoad={this.handleIframeLoaded} />
    );
  }
}

function mapStateToProps(state: RootState): Partial<IProps> {
  const data = state.get("data");
  const error = data.get("error");
  const dataDownloaded = !error && !data.get("isFetching");

  return {
    users: dataDownloaded && getSortedStudents(state),
    answersByQuestion: dataDownloaded && getAnswersByQuestion(state)
  };
}

const mapDispatchToProps = (dispatch: any, ownProps: any): Partial<IProps> => {
  return {
    registerReportItem: (questionId: string, iframePhone: any, reportItemMetadata: IReportItemHandlerMetadata) => dispatch(registerReportItem(questionId, iframePhone, reportItemMetadata)),
    unregisterReportItem: (questionId: string) => dispatch(unregisterReportItem(questionId)),
    setReportItemAnswer: (answer: Map<string, any>, reportItemAnswer: IReportItemAnswer) => dispatch(setReportItemAnswer(answer, reportItemAnswer)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ReportItemIframe);
