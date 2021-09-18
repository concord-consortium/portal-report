import React, { PureComponent } from "react";
import { connect } from "react-redux";
import queryString from "query-string";
import { fetchAndObserveData } from "../../actions/index";
import DataFetchError from "../../components/report/data-fetch-error";
import LoadingIcon from "../../components/report/loading-icon";
import InteractiveIframe from "../../components/report/interactive-iframe";
import Answer from "../../components/report/answer";

import "../../../css/report/report-app.less";
import "../../../css/report/iframe-standalone-app.less";
import config from "../../config";

class IframeStandaloneApp extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { fetchAndObserveData } = this.props;
    fetchAndObserveData();
  }

  renderIframe() {
    const { report, answers } = this.props;
    const { iframeQuestionId } = queryString.parse(window.location.search);

    const question = report.get("questions").get(iframeQuestionId);

    const studentId = config("studentId");
    const answer = answers.filter(a =>
      a.get("questionId") === iframeQuestionId &&
      a.get("platformUserId") === studentId
    ).first();

    if (!answer) {
      const errorText =
        !iframeQuestionId ? "Parameter 'iframeQuestionId' is missing" :
        !studentId ? "Parameter 'studentId' is missing" :
        `No data for question '${iframeQuestionId}' by student '${studentId}'`;
      return <DataFetchError error={{title: "Unable to fetch data", body: errorText}} />;
    }

    const answerType = answer.get("type");
    if (answerType === "interactive_state" || answerType === "external_link") {
      // This will handle the main use case - rendering of the interactive iframe. Note that Answer component would
      // also handle it if we provided alwaysOpen=true, but it wouldn't try to make it full screen, and so on.
      // It seems to be easier to render custom InteractiveIframe here.
      let url;
      let state;
      // There are two supported answer types handled by iframe question: simple link or interactive state.
      if (answerType === "external_link") {
        // Answer field is just the reportable URL. We don't need any state.
        url = answer.get("answer");
        state = null;
      } else if (answerType === "interactive_state") {
        // URL field is provided by question. Answer field is a state that will be passed
        // to the iframe using iframe-phone.
        url = question.get("url");
        state = answer.get("answer");
      }
      return (
        <InteractiveIframe src={url} state={state} answer={answer} style={{border: "none"}} width="100%" height="100%" />
      );
    } else {
      // This will handle all the other answers like open response, multiple choice, or image question.
      return <Answer question={question} answer={answer} />;
    }
  }

  render() {
    const { report, error, isFetching } = this.props;
    return (
      <div className="report-app full-size">
        <div className="report full-size" style={{ opacity: isFetching ? 0.3 : 1 }} data-cy="standaloneIframe">
          {report && this.renderIframe()}
          {error && <DataFetchError error={error} />}
        </div>
        {isFetching && <LoadingIcon />}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const data = state.get("data");
  const error = data.get("error");
  const reportState = state.get("report");
  const answers = reportState && reportState.get("answers");
  const dataDownloaded = !error && !data.get("isFetching");
  return {
    report: dataDownloaded && reportState,
    answers,
    isFetching: data.get("isFetching"),
    error,
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchAndObserveData: () => dispatch(fetchAndObserveData())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(IframeStandaloneApp);
