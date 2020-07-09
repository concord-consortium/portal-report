/* eslint-disable no-console */
import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { fetchAndObserveData } from "../../actions/index";
import DataFetchError from "../report/data-fetch-error";
import LoadingIcon from "../report/loading-icon";

import "../../../css/report/report-app.less";
import "../../../css/report/iframe-standalone-app.less";

class ExportApp extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { fetchAndObserveData } = this.props;
    fetchAndObserveData();
  }

  renderExport() {
    const { report, answers } = this.props;
    report && console.log("answers: ", answers);
    return (
      <div style={{fontSize: "12px"}}>
        {answers && (JSON.stringify(answers)).toString()
        }
      </div>
    );
  }

  render() {
    const { report, error, isFetching } = this.props;
    return (
      <div className="report-app full-size">
        <div className="report full-size" style={{ opacity: isFetching ? 0.3 : 1 }} data-cy="export-page">
          {report && this.renderExport()}
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

export default connect(mapStateToProps, mapDispatchToProps)(ExportApp);
