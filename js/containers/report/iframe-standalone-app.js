import React, { PureComponent } from "react";
import { connect } from "react-redux";
import {
  fetchAndObserveData, hideCompareView,
  hideUnselectedQuestions, showUnselectedQuestions, setNowShowing,
  setAnonymous, trackEvent } from "../../actions/index";
import DataFetchError from "../../components/report/data-fetch-error";
import LoadingIcon from "../../components/report/loading-icon";
import InteractiveIframe from "../../components/report/interactive-iframe";

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
    const { report, iframeQuestionId, answers } = this.props;

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
      <InteractiveIframe src={url} state={state} style={{border: "none"}} width="100%" height="100%" />
    );
  }

  render() {
    const { report, error, isFetching } = this.props;
    return (
      <div className="report-app full-size">
        <div className="report full-size" style={{ opacity: isFetching ? 0.3 : 1 }}>
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
  const iframeQuestionId = reportState && reportState.get("iframeQuestionId");
  const answers = reportState && reportState.get("answers");
  const dataDownloaded = !error && !data.get("isFetching");
  return {
    report: dataDownloaded && reportState,
    iframeQuestionId: iframeQuestionId,
    answers: answers,
    isFetching: data.get("isFetching"),
    error: error,
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchAndObserveData: () => dispatch(fetchAndObserveData()),
    hideUnselectedQuestions: () => dispatch(hideUnselectedQuestions()),
    showUnselectedQuestions: () => dispatch(showUnselectedQuestions()),
    setNowShowing: (nowShowingValue, selectedStudentIds) => dispatch(setNowShowing(nowShowingValue, selectedStudentIds)),
    setAnonymous: value => dispatch(setAnonymous(value)),
    hideCompareView: () => dispatch(hideCompareView()),
    trackEvent: (category, action, label) => dispatch(trackEvent(category, action, label)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(IframeStandaloneApp);
