import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { showCompareView, trackEvent } from "../../actions/index";
import Report from "../../components/report/report";
import getReportTree from "../../selectors/report-tree";
import Button from "../../components/common/button";

export class ShowCompareButton extends PureComponent {

  onCompareButtonClick = () => {
    const { reportTree, answer, onClick, trackEvent } = this.props;
    trackEvent("Report", "Compare/Project", reportTree.get("name"));
    return onClick(answer.get("questionId"));
  }

  render() {
    const { answer } = this.props;
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

const mapDispatchToProps = dispatch => {
  return {
    onClick: questionId => dispatch(showCompareView(questionId)),
    trackEvent: (category, action, label) => dispatch(trackEvent(category, action, label)),
  };
};

const ShowCompareContainer = connect(mapStateToProps, mapDispatchToProps)(ShowCompareButton);
export default ShowCompareContainer;
