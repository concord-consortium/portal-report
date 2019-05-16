import React, { PureComponent } from "react";
import { connect } from "react-redux";
import {
  fetchDataIfNeeded, invalidateData, hideCompareView,
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

class ReportApp extends PureComponent {
  constructor(props) {
    super(props);
    this.handleRefreshClick = this.handleRefreshClick.bind(this);
  }

  componentDidMount() {
    const { fetchDataIfNeeded } = this.props;
    fetchDataIfNeeded();
  }

  handleRefreshClick(e) {
    e.preventDefault();

    const { invalidateData, fetchDataIfNeeded } = this.props;
    invalidateData();
    fetchDataIfNeeded();
  }

  renderReport() {
    const { report, reportTree, hideUnselectedQuestions, showUnselectedQuestions, setNowShowing, setAnonymous, trackEvent } = this.props;
    return <Report
      report={report}
      reportTree={reportTree}
      hideUnselectedQuestions={hideUnselectedQuestions}
      showUnselectedQuestions={showUnselectedQuestions}
      setNowShowing={setNowShowing}
      setAnonymous={setAnonymous}
      trackEvent={trackEvent}
    />;
  }

  renderCompareView() {
    const { compareViewAnswers, hideCompareView } = this.props;
    return (
      <Modal show={compareViewAnswers && compareViewAnswers.size > 0} bsStyle="compare-view" onHide={hideCompareView}>
        <Modal.Body>
          {compareViewAnswers && <CompareView answers={compareViewAnswers} />}
        </Modal.Body>
      </Modal>
    );
  }

  render() {
    const { report, error, isFetching, lastUpdated } = this.props;
    return (
      <div className="report-app">
        <Header lastUpdated={lastUpdated} isFetching={isFetching} onRefreshClick={this.handleRefreshClick} />
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
  const dataDownloaded = !error && !!data.get("lastUpdated");
  return {
    report: dataDownloaded && reportState,
    reportTree: dataDownloaded && getReportTree(state),
    compareViewAnswers: compareViewAnswers && getCompareViewData(state),
    isFetching: data.get("isFetching"),
    lastUpdated: data.get("lastUpdated"),
    error: error,
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchDataIfNeeded: () => dispatch(fetchDataIfNeeded()),
    invalidateData: () => dispatch(invalidateData()),
    hideUnselectedQuestions: () => dispatch(hideUnselectedQuestions()),
    showUnselectedQuestions: () => dispatch(showUnselectedQuestions()),
    setNowShowing: value => dispatch(setNowShowing(value)),
    setAnonymous: value => dispatch(setAnonymous(value)),
    hideCompareView: () => dispatch(hideCompareView()),
    trackEvent: (category, action, label) => dispatch(trackEvent(category, action, label)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ReportApp);
