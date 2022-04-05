import React, { PureComponent } from "react";
import { Map } from "immutable";
import { IReportItemAnswerItem } from "@concord-consortium/interactive-api-host";
import { renderHTML } from "../../util/render-html";
import { IframeAnswerReportItemAttachment } from "./iframe-answer-report-item-attachment";

interface IProps {
  answer: Map<any, any>;
  item: IReportItemAnswerItem;
  answerText: any;
  renderLink: (options?: {hideViewInNewTab?: boolean; hideViewInline?: boolean}) => JSX.Element;
}

interface IState {
  height: number;
}

export class IframeAnswerReportItem extends PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      height: 0
    };
    this.handleIFrameLoaded = this.handleIFrameLoaded.bind(this);
  }

  handleIFrameLoaded(e: any) {
    const contentDocument = e.target.contentDocument;
    const body = contentDocument.body;
    const html = contentDocument.documentElement;
    const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

    this.setState({height});
  }

  render() {
    const { answer, item, answerText, renderLink } = this.props;
    const { height } = this.state;

    switch (item.type) {
      case "answerText":
        return <div>{ renderHTML(answerText) }</div>;

      case "attachment":
        return <IframeAnswerReportItemAttachment item={item} answer={answer} />;

      case "html":
        return <iframe className="iframe-answer-report-item-html" style={{height}} srcDoc={item.html} onLoad={this.handleIFrameLoaded} />;

      case "links":
        const {hideViewInNewTab, hideViewInline} = item;
        return renderLink({hideViewInNewTab, hideViewInline});
    }
  }
}
