import React, { PureComponent } from "react";
import iframePhone from "iframe-phone";
import { /* handleGetAttachmentUrl, */ IReportItemInitInteractive, IStudentHTML } from "@concord-consortium/interactive-api-host";
import { getSortedStudents } from "../../selectors/report";
import { RootState } from "../../reducers";
import { connect } from "react-redux";
import { getAnswersByQuestion } from "../../selectors/report-tree";

import css from "../../../css/portal-dashboard/report-item-iframe.less";
import { registerReportItem, unregisterReportItem, setStudentHTML } from "../../actions";

interface IProps {
  question: any;
  view: "singleAnswer" | "multipleAnswer";
  students: any;
  answersByQuestion: any;
  registerReportItem: (questionId: string, iframePhone: any) => void;
  unregisterReportItem: (questionId: string) => void;
  setStudentHTML: (questionId: string, studentId: string, html: string) => void;
}

interface IState {
  requestedHeight: number|null;
  src?: string;
}

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
      const authoredState = this.props.question.get("authored_state") || {};
      const students = this.getStudentsForInitMessage();

      const initMessage: IReportItemInitInteractive = {
        version: 1,
        mode: "reportItem",
        hostFeatures: {}, // no host features supported in report-items
        authoredState,
        interactiveItemId: questionId,
        view: this.props.view,
        students,
      };
      this.iframePhone.post("initInteractive", initMessage);
    };
    // eslint-disable-next-line react/no-string-refs
    this.iframePhone = new iframePhone.ParentEndpoint(this.refs.iframe, phoneAnswered);

    this.iframePhone.addListener("studentHTML", this.handleStudentHTML);
    this.iframePhone.addListener("height", this.handleHeight);
    this.iframePhone.addListener("reportItemClientReady", () => {
      this.props.registerReportItem(this.props.question.get("id"), this.iframePhone);
    });
    // this.iframePhone.addListener("getAttachmentUrl", this.handleGetAttachmentUrl);
  }

  getStudentsForInitMessage() {
    const questionId = this.props.question.get("id");
    const answers = this.props.answersByQuestion.get(questionId);

    // construct a map of student id to answer present
    const studentHasAnswers = answers?.reduce((acc: Record<string, boolean>, answer: any) => {
      acc[answer.get("platformUserId")] = true;
      return acc;
    }, {});

    // construct a map of all students to answer present
    const students = this.props.students.reduce((acc: Record<string, {hasAnswer: boolean}>, student: any) => {
      const id = student.get("id");
      acc[id] = {hasAnswer: !!studentHasAnswers?.[id]};
      return acc;
    }, {});

    return students;
  }

  handleStudentHTML = (response: IStudentHTML) => {
    this.props.setStudentHTML(this.props.question.get("id"), response.studentId, response.html);
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

    const className = this.props.view === "singleAnswer"
      ? css.singleAnswerReportItemIframe
      : css.multipleAnswerReportItemIframe;

    const requestedHeight = this.state.requestedHeight || 0;
    const style = requestedHeight > 0 ? {height: requestedHeight} : {};

    return (
      // eslint-disable-next-line react/no-string-refs
      <iframe key={this.props.question.get("id")} ref="iframe" className={className} src={src} style={style} onLoad={this.handleIframeLoaded} />
    );
  }
}

function mapStateToProps(state: RootState): Partial<IProps> {
  const data = state.get("data");
  const error = data.get("error");
  const dataDownloaded = !error && !data.get("isFetching");

  return {
    students: dataDownloaded && getSortedStudents(state),
    answersByQuestion: dataDownloaded && getAnswersByQuestion(state)
  };
}

const mapDispatchToProps = (dispatch: any, ownProps: any): Partial<IProps> => {
  return {
    registerReportItem: (questionId: string, iframePhone: any) => dispatch(registerReportItem(questionId, iframePhone)),
    unregisterReportItem: (questionId: string) => dispatch(unregisterReportItem(questionId)),
    setStudentHTML: (questionId: string, studentId: string, html: string) => dispatch(setStudentHTML(questionId, studentId, html)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ReportItemIframe);
