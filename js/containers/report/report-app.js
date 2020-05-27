import React, { PureComponent } from "react";
import { connect } from "react-redux";
import {
  fetchAndObserveData, hideCompareView,
  hideUnselectedQuestions, showUnselectedQuestions, setNowShowing,
  setAnonymous, trackEvent } from "../../actions/index";
import { Modal } from "react-bootstrap";
import Header from "../../components/common/header";
import CompareView from "../../components/report/compare-view";
import Report from "../../components/report/report";
import DataFetchError from "../../components/report/data-fetch-error";
import LoadingIcon from "../../components/report/loading-icon";
import getReportTree from "../../selectors/report-tree";
import getCompareViewData from "../../selectors/compare-view-data";

import "../../../css/report/report-app.less";
import { getSortedStudents } from "../../selectors/report";

class ReportApp extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { fetchAndObserveData } = this.props;
    fetchAndObserveData();
  }

  renderReport() {
    const { report, reportTree, hideUnselectedQuestions, showUnselectedQuestions, setNowShowing, setAnonymous,
      trackEvent, isFetching, sortedStudents } = this.props;
    return <Report
      report={report}
      reportTree={reportTree}
      sortedStudents={sortedStudents}
      hideUnselectedQuestions={hideUnselectedQuestions}
      showUnselectedQuestions={showUnselectedQuestions}
      setNowShowing={setNowShowing}
      setAnonymous={setAnonymous}
      trackEvent={trackEvent}
      isFetching={isFetching}
    />;
  }

  renderCompareView() {
    const { compareViewAnswers, hideCompareView, report } = this.props;
    const showCompare = compareViewAnswers && compareViewAnswers.size > 0;
    let question = null;
    if (showCompare) {
      // All the answers belong to the same question, so we can pick any answer to find the question.
      const questionId = compareViewAnswers.first().get("questionId");
      question = report.getIn(["questions", questionId]);
    }
    return (
      <Modal show={showCompare} bsStyle="compare-view" onHide={hideCompareView}>
        <Modal.Body>
          {compareViewAnswers && <CompareView answers={compareViewAnswers} question={question} />}
        </Modal.Body>
      </Modal>
    );
  }

  render() {
    const { report, error, isFetching } = this.props;
    return (
      <div className="report-app">
        <Header />
        <div className="report" style={{ opacity: isFetching ? 0.3 : 1 }}>
          {report && this.renderReport()}
          {error && <DataFetchError error={error} />}
          {this.renderCompareView()}
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
  const compareViewAnswers = reportState && reportState.get("compareViewAnswers");
  const dataDownloaded = !error && !data.get("isFetching");
  return {
    report: dataDownloaded && reportState,
    reportTree: dataDownloaded && getReportTree(state),
    sortedStudents: dataDownloaded && getSortedStudents(state),
    compareViewAnswers: compareViewAnswers && getCompareViewData(state),
    isFetching: data.get("isFetching"),
    error,
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

export default connect(mapStateToProps, mapDispatchToProps)(ReportApp);
