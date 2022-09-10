import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { showCompareView, trackEvent } from "../../actions/index";
import getReportTree from "../../selectors/report-tree";
import Button from "../../components/common/button";

export class ShowCompareButton extends PureComponent {

  onCompareButtonClick = () => {
    const { reportTree, answer, onClick, trackEvent } = this.props;
    trackEvent("Report", "Compare/Project", {label: reportTree?.name});
    return onClick(answer?.questionId);
  }

  render() {
    const { answer } = this.props;
    return (
      <Button className="select-answer" onClick={this.onCompareButtonClick} disabled={!answer?.selectedForCompare}>
        Compare/project
      </Button>
    );
  }
}

function mapStateToProps(state) {
  const data = state?.data;
  const error = data?.error;
  const dataDownloaded = !error && !data?.isFetching;
  return {
    reportTree: dataDownloaded && getReportTree(state),
  };
}

const mapDispatchToProps = dispatch => {
  return {
    onClick: questionId => dispatch(showCompareView(questionId)),
    trackEvent: (category, action, options) => dispatch(trackEvent(category, action, options)),
  };
};

const ShowCompareContainer = connect(mapStateToProps, mapDispatchToProps)(ShowCompareButton);
export default ShowCompareContainer;
