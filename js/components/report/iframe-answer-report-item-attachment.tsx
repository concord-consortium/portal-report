import React, { PureComponent } from "react";
import { Map } from "immutable";
import { handleGetAttachmentUrl, IAttachmentUrlRequest } from "@concord-consortium/interactive-api-host";

interface IProps {
  name: string;
  answer: Map<any, any>;
}

interface IState {
  loading: boolean;
  url?: string;
  error?: string;
  contentType?: string;
}

export class IframeAnswerReportItemAttachment extends PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      loading: true
    };
  }

  UNSAFE_componentWillMount() {
    const { name, answer } = this.props;
    const answerMeta = answer.toJS();
    // TODO: the next step, I believe is to the get attachment info from
    // answerMeta.attachments[name] to get contentType and save it in the state
  }

  handleLoadAttachment() {
    const { name, answer } = this.props;
    const answerMeta = answer.toJS();

    const request: IAttachmentUrlRequest = {
      name,
      operation: "read",
      requestId: Math.round(Math.random() * Number.MAX_SAFE_INTEGER)
    };
    handleGetAttachmentUrl({ request, answerMeta})
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
    const { name } = this.props;
    const { loading, url, error, contentType} = this.state;

    if (contentType) {
      const majorType = contentType.split("/").shift();
      switch (majorType) {
        case "audio":
          if (error) {
            return <div>{error}</div>;
          }
          if (loading) {
            return <div>Loading...</div>;
          }
          if (url) {
            return <audio controls src={url} />;
          }
          return <div onClick={this.handleLoadAttachment}>Click to load...</div>;

        default:
          return <div>Attachments of type {contentType} are not yet handled</div>
      }
    } else {
      return <div>Can't load {name}, content type not known.</div>
    }
  }
}
