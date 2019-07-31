import React, { PureComponent } from "react";
import RubricSummary from "./rubric-summary";
import "../../../css/report/summary-indicator.less";

export default class SummaryIndicator extends PureComponent {
  renderLabel(label) {
    return <span className="label"> {label} : </span>;
  }

  renderAvgScore(label) {
    const {scores, maxScore} = this.props;
    const avgScore = scores.reduce((p, c) => p + Number(c), 0) / scores.length;
    const roundedAvg = Math.round(avgScore * 10) / 10;
    return avgScore
      ? <span className="value"> {roundedAvg} / {maxScore}</span>
      : null;
  }

  render() {
    const {scores, useRubric, showScore, rubricFeedbacks, rubric} = this.props;
    const showScoreFinal = showScore && scores && scores.length > 0;
    const showRubric = useRubric && rubricFeedbacks && rubricFeedbacks.length > 0;
    const showLabel = showRubric || showScoreFinal;
    const label = showScoreFinal
      ? "Avg. Score"
      : "Rubric Summary";
    return (
      <div className="summary-indicator">
        <div className="avg-score">
          { showLabel ? this.renderLabel(label) : null }
          { showScoreFinal ? this.renderAvgScore() : null}
        </div>
        <RubricSummary rubric={rubric} useRubric={useRubric} rubricFeedbacks={rubricFeedbacks} />
      </div>
    );
  }
}
