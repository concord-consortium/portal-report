import React, { PureComponent } from "react";
import InteractiveIframe from "./interactive-iframe";

import "../../../css/report/iframe-answer.less";

export default class IframeAnswer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      iframeVisible: false,
    };
    this.toggleIframe = this.toggleIframe.bind(this);
  }

  toggleIframe(event) {
    const { question } = this.props;
    if (question.get("displayInIframe")) {
      // If displayInIframe == true, we won't follow the link.
      event.preventDefault();
      this.setState({iframeVisible: !this.state.iframeVisible});
    }
  }

  getLinkURL(answer) {
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
      const interactiveState = JSON.parse(json.interactiveState);
      return interactiveState.lara_options.reporting_url;
    } catch (e) {
      return answer;
    }
  }

  renderLink() {
    const { answer, question } = this.props;
    const linkUrl = this.getLinkURL(answer.get("answer"));
    const decorator = question.get("displayInIframe") ? "" : <span className="pr-icon-external-link" />;
    return <a href={linkUrl} onClick={this.toggleIframe} target="_blank">View Work {decorator}</a>;
  }

  renderIframe() {
    const { answer, question, alwaysOpen } = this.props;
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
      <div>
        {!alwaysOpen ? <div><a href="#" onClick={this.toggleIframe}>Hide</a></div> : ""}
        <InteractiveIframe src={url} state={state} width={question.get("width")} height={question.get("height")} />
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
    return (
      <div className="iframe-answer" data-cy="iframe-answer">
        {this.shouldRenderIframe() ? this.renderIframe() : this.renderLink()}
      </div>
    );
  }
}
