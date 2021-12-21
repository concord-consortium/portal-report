import React, { PureComponent } from "react";
import queryString from "query-string";
import { connect } from "react-redux";
import { Map } from "immutable";

import { renderHTML } from "../../util/render-html";
import InteractiveIframe from "./interactive-iframe";
import { getStudentHTML } from "../../actions";

import "../../../css/report/iframe-answer.less";

interface IProps {
  answer: Map<any, any>;
  question: Map<any, any>;
  responsive: boolean;
  alwaysOpen: boolean;
  getStudentHTML: (questionId: string, studentId: string) => void;
  reportItemHTML?: string;
}

interface IState {
  iframeVisible: boolean;
  reportItemHTMLHeight: number;
}

class IframeAnswer extends PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      iframeVisible: false,
      reportItemHTMLHeight: 0
    };
    this.toggleIframe = this.toggleIframe.bind(this);
    this.handleReportItemHTMLIFrameLoaded = this.handleReportItemHTMLIFrameLoaded.bind(this);
  }

  toggleIframe() {
    this.setState({iframeVisible: !this.state.iframeVisible});
  }

  handleReportItemHTMLIFrameLoaded(e: any) {
    // the +32 is for the hidden iframe chrome
    // TODO: figure out better height calculation
    this.setState({reportItemHTMLHeight: e.target.contentDocument.body.offsetHeight + 32});
  }

  getLinkURL(answer: string) {
    /*
    If the author initially sets the interactive to not have a report_url in LARA, then some student works on the interactive,
    then the author sets the interactive to have a report_url in LARA, the portal will send down the full interactive state to the report.
    Normally the portal will send down just the report URL as the learner state.

    This problem goes back to LARA. When the interactive is configured as having a report_url, then LARA only sends the report_url
    to the portal as its state. Otherwise LARA sends all of the interactive state. If the author switches the 'having a report_url'
    configuration after some students have done work, LARA does update the saved work in the portal.

    A possibly better fix is to have LARA send the updated work to the portal when this is configuration is changed.
    But it seems wrong to have a little checkbox possibly trigger a massive amount of processing to go on in the background.
    */
    try {
      const json = JSON.parse(answer);
      const interactiveState = json.interactiveState ? JSON.parse(json.interactiveState) : null;
      if (interactiveState && interactiveState.lara_options && interactiveState.lara_options.reporting_url) {
        return interactiveState.lara_options.reporting_url;
      }
      return null;
    } catch (e) {
      return answer;
    }
  }

  /**
   * Adds a studentId and iframeQuestionId to the existing url
   */
  getStandaloneLinkUrl(question: Map<any, any>, answer: Map<any, any>) {
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const params = queryString.parse(window.location.search);
    params.studentId = answer.get("platformUserId");
    params.iframeQuestionId = question.get("id");
    // Need to get the auth-domain from the class url
    const clazz = Array.isArray(params.class) ? params.class[0] : params.class;
    const authDomain = clazz?.split("/api")[0];
    authDomain && (params["auth-domain"] = authDomain);
    const newSearch = queryString.stringify(params);
    return `${baseUrl}?${newSearch}`;
  }

  renderLink() {
    const { answer, question } = this.props;
    const { iframeVisible } = this.state;
    const linkUrl = this.getLinkURL(answer.get("answer"));
    const externalLinkIcon = <span className="pr-icon-external-link" />;
    if (question.get("displayInIframe")) {
      const toggleText = iframeVisible ? "Hide" : "View Work";
      const standaloneLinkUrl = this.getStandaloneLinkUrl(question, answer);
      return (
        <React.Fragment>
          <a onClick={this.toggleIframe} target="_blank" data-cy="toggleIframe">{toggleText}</a> |{" "}
          <a href={standaloneLinkUrl} target="_blank" data-cy="standaloneIframe">Open in new tab {externalLinkIcon}</a>
        </React.Fragment>
      );
    } else {
      return <a href={linkUrl} target="_blank" data-cy="externalIframe">View work in new tab {externalLinkIcon}</a>;
    }
  }
  renderIframe() {
    const { answer, question, responsive } = this.props;
    let url;
    let state;
    // There are two supported answer types handled by iframe question: simple link or interactive state.
    if (answer.get("type") === "external_link") {
      // Answer field is just the reportable URL. We don't need any state.
      url = answer.get("answer");
      state = null;
    } else if (answer.get("type") === "interactive_state") {
      // URL field is provided by question. Answer field is a state that will be passed
      // to the iframe using iframe-phone.
      url = question.get("url");
      state = answer.get("answer");
    }
    return (
      <div className={`iframe-answer-content ${responsive ? "responsive" : ""}`}>
        <InteractiveIframe src={url} state={state} answer={answer} width={question.get("width")} height={question.get("height")} />
      </div>
    );
  }

  shouldRenderIframe() {
    const { question, alwaysOpen } = this.props;
    const { iframeVisible } = this.state;

    if (question.get("displayInIframe")) {
      return iframeVisible || alwaysOpen;
    } else {
      return false;
    }
  }

  render() {
    const { alwaysOpen, answer, responsive, question, reportItemHTML } = this.props;
    const { reportItemHTMLHeight } = this.state;
    const answerText = answer.get("answerText");
    const hasReportItemUrl = !!question.get("reportItemUrl");

    // request the latest student report html
    if (hasReportItemUrl) {
      setTimeout(() => {
        this.props.getStudentHTML(question.get("id"), answer.getIn(["student", "id"]));
      }, 0);
    }

    return (
      <div className={`iframe-answer ${responsive ? "responsive" : ""}`} data-cy="iframe-answer">
        <div className={`iframe-answer-header ${responsive ? "responsive" : ""}`}>
          { answerText
              ? <div>{ renderHTML(answerText) }</div>
              : !alwaysOpen && this.renderLink() /* This assumes only scaffolded questions and fill in the blank questions have answerTexts */
          }
        </div>
        {reportItemHTML && <iframe className="iframe-answer-report-item-html" style={{height: reportItemHTMLHeight}} srcDoc={reportItemHTML} onLoad={this.handleReportItemHTMLIFrameLoaded} />}
        {this.shouldRenderIframe() && this.renderIframe()}
      </div>
    );
  }
}

function mapStateToProps() {
  return (state: any, ownProps: any) => {
    return {
      reportItemHTML: state.getIn(["report", "reportItemStudentHTML", ownProps.answer.get("id")])
    };
  };
}

const mapDispatchToProps = (dispatch: any, ownProps: any): Partial<IProps> => {
  return {
    getStudentHTML: (questionId: string, studentId: string) => dispatch(getStudentHTML(questionId, studentId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(IframeAnswer);