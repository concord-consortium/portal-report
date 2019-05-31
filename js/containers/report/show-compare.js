import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { showCompareView, trackEvent } from "../../actions/index";
import CompareView from "../../components/report/compare-view";
import Report from "../../components/report/report";
import DataFetchError from "../../components/report/data-fetch-error";
import LoadingIcon from "../../components/report/loading-icon";
import getReportTree from "../../selectors/report-tree";
import getCompareViewData from "../../selectors/compare-view-data";
import Button from "../../components/common/button";

export class ShowCompareButton extends PureComponent {

  onCompareButtonClick = () => {
    const { reportTree, answer, onClick, trackEvent } = this.props;
    trackEvent("Report", "Compare/Project", reportTree.get("name"));
    return onClick(answer.get("embeddableKey"));
  }

  render() {
    const { reportTree, answer, onClick, trackEvent } = this.props;
    return (
      <Button className="select-answer" onClick={this.onCompareButtonClick} disabled={!answer.get("selectedForCompare")}>
        Compare/project
      </Button>
    );
  }
}

function mapStateToProps(state) {
  const data = state.get("data");
  const error = data.get("error");
  const dataDownloaded = !error && !data.get("isFetching");
  return {
    reportTree: dataDownloaded && getReportTree(state),
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClick: (embeddableKey) => dispatch(showCompareView(embeddableKey)),
    trackEvent: (category, action, label) => dispatch(trackEvent(category, action, label)),
  };
};

const ShowCompareContainer = connect(mapStateToProps, mapDispatchToProps)(ShowCompareButton);
export default ShowCompareContainer;
