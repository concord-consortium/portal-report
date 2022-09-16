import React, { PureComponent } from "react";
import { Map } from "immutable";
import { handleGetAttachmentUrl, IAttachmentUrlRequest, IReportItemAnswerItemAttachment } from "@concord-consortium/interactive-api-host";
import { IframeAnswerReportItemAttachmentAudio } from "./iframe-answer-report-item-attachment-audio";

interface IProps {
  answer: Map<any, any>;
  item: IReportItemAnswerItemAttachment;
  request?: any;
}

interface IState {
  contentType?: string;
  error?: string;
  loading: boolean;
  url?: string;
}

export class IframeAnswerReportItemAttachment extends PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      loading: true
    };
    this.handleLoadAttachment = this.handleLoadAttachment.bind(this);
  }

  UNSAFE_componentWillMount() {
    const { item, answer } = this.props;
    const answerMeta: any = answer.toJS();
    const attachment = answerMeta.attachments[item.name];
    const contentType = attachment.contentType;
    this.setState({contentType});
    // Do not load audio files by default because there may be a lot of them and we want to
    // minimize page load time.
    if (contentType === "audio/mpeg") {
      this.setState({loading: false});
    }
  }

  handleLoadAttachment() {
    const { item, answer } = this.props;
    const answerMeta = answer.toJS();
    this.setState({loading: true});

    const request: IAttachmentUrlRequest = {
      name: item.name,
      operation: "read",
      requestId: Math.round(Math.random() * Number.MAX_SAFE_INTEGER)
    };

    handleGetAttachmentUrl({ request, answerMeta })
      .then(response => {
        this.setState({url: response.url, error: response.error});
      })
      .catch(err => {
        this.setState({error: err.toString()});
      })
      .finally(() => {
        this.setState({loading: false});
      });
  }

  render() {
    const { item } = this.props;
    const { loading, url, error, contentType } = this.state;

    if (contentType) {
      const majorType = contentType.split("/").shift();
      switch (majorType) {
        case "audio":
          if (error) {
            return <div>{error}</div>;
          }
          return (
            <IframeAnswerReportItemAttachmentAudio
              handleLoadAttachment={this.handleLoadAttachment}
              loading={loading}
              url={url ? url : undefined}
            />
          );

        default:
          return <div>Attachments of type {contentType} are not yet handled</div>;
      }
    } else {
      return <div>Can't load {item.name}, content type not known.</div>;
    }
  }
}
