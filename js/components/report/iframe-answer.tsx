import React, { PureComponent } from "react";
import queryString from "query-string";
import { connect } from "react-redux";
import { Map } from "immutable";
import { IReportItemAnswer, IReportItemAnswerItem, ReportItemsType } from "@concord-consortium/interactive-api-host";
import { renderHTML } from "../../util/render-html";
import InteractiveIframe from "./interactive-iframe";
import { getReportItemAnswer } from "../../actions";
import { IframeAnswerReportItem } from "./iframe-answer-report-item";

import "../../../css/report/iframe-answer.less";

// this exists to handle older interactives until they are updated to use the new report item api
interface IInterimReportItemAnswer extends IReportItemAnswer {
  type: "html";
  html: string;
}

interface IProps {
  answer: Map<any, any>;
  question: Map<any, any>;
  responsive: boolean;
  alwaysOpen: boolean;
  getReportItemAnswer: (questionId: string, studentId: string, itemsType: ReportItemsType) => void;
  reportItemAnswer?: IInterimReportItemAnswer;
  answerOrientation: "wide" | "tall";
}

interface IState {
  iframeVisible: boolean;
}

export class IframeAnswer extends PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      iframeVisible: false
    };
    this.toggleIframe = this.toggleIframe.bind(this);
    this.renderLink = this.renderLink.bind(this);
  }

  toggleIframe() {
    const { iframeVisible } = this.state;
    this.setState({iframeVisible: !iframeVisible});
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

  renderLink(options?: {hideViewInNewTab?: boolean; hideViewInline?: boolean}) {
    const { answer, question } = this.props;
    const { iframeVisible } = this.state;
    const linkUrl = this.getLinkURL(answer.get("answer"));
    const externalLinkIcon = <span className="pr-icon-external-link" />;
    if (question.get("displayInIframe")) {
      const toggleText = iframeVisible ? "Hide" : "View Work";
      const standaloneLinkUrl = this.getStandaloneLinkUrl(question, answer);
      return (
        <div>
          <a onClick={this.toggleIframe} target="_blank" data-cy="toggleIframe">{toggleText}</a> | {" "}
          <a href={standaloneLinkUrl} target="_blank" data-cy="standaloneIframe">Open in new tab {externalLinkIcon}</a>
        </div>
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
    const { alwaysOpen, answer, responsive, question, reportItemAnswer, answerOrientation } = this.props;
    const answerText = answer.get("answerText");
    const questionType = answer.get("questionType");
    const hasReportItemUrl = !!question?.get("reportItemUrl");
    const displayTall = answerOrientation === "tall";
    let reportItemAnswerItems: IReportItemAnswerItem[] = [];

    // request the latest student report html
    if (hasReportItemUrl) {
      setTimeout(() => {
        this.props.getReportItemAnswer(question.get("id"), answer.getIn(["student", "id"]) as string, "fullAnswer");
      }, 0);
    }

    if (reportItemAnswer) {
      // handle interactives using the older api format and create a single html item
      if (reportItemAnswer.type === "html") {
        reportItemAnswerItems.push({
          type: "html",
          html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: lato, arial, helvetica, sans-serif;
              }
              .tall {
                display: ${displayTall ? "flex" : "none"};
                flex-direction: column;
              }
              .wide {
                display: ${displayTall ? "none" : "flex"};
                flex-direction: row;
              }
            </style>
          </head>
          <body>
            ${reportItemAnswer.html}
          </body>
          </html>
        `});
      } else {
        // use the new api format which returns a list of items
        reportItemAnswerItems = reportItemAnswer.items || [];
      }
    }

    // if there are no report answer items, show the answer text or the links to view the interactive
    let maybeAnswerTextOrLinks: JSX.Element | false = false;
    if (reportItemAnswerItems.length === 0) {
      maybeAnswerTextOrLinks = answerText
        ? <div data-cy="answerText">{ renderHTML(answerText) }</div>
        : !alwaysOpen && this.renderLink(); /* This assumes only scaffolded, fill in the blank, and open response questions have answerTexts */
    }

    return (
      <div className={`iframe-answer ${responsive ? "responsive" : ""} ${questionType === "iframe_interactive" ? "scaled" : ""}`} data-cy="iframe-answer">
        {maybeAnswerTextOrLinks && (
          <div className={`iframe-answer-header ${responsive ? "responsive" : ""}`}>
            {maybeAnswerTextOrLinks}
          </div>
        )}
        {reportItemAnswerItems.map((item, index) => (
          <IframeAnswerReportItem
            key={index}
            item={item}
            answerText={answerText}
            renderLink={this.renderLink}
            answer={answer}
            iframeVisible={item.type === "links" && this.state.iframeVisible}
          />
        ))}
        {this.shouldRenderIframe() && this.renderIframe()}
      </div>
    );
  }
}

function mapStateToProps() {
  return (state: any, ownProps: any) => {
    return {
      reportItemAnswer: state.getIn(["report", "reportItemAnswersFull", ownProps.answer.get("id")])
    };
  };
}

const mapDispatchToProps = (dispatch: any, ownProps: any): Partial<IProps> => {
  return {
    getReportItemAnswer: (questionId: string, studentId: string, itemsType: ReportItemsType) => dispatch(getReportItemAnswer(questionId, studentId, itemsType)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(IframeAnswer);
