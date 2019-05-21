import React, { PureComponent } from "react"; // eslint-disable-line
import "../../../css/report/feedback-overview.less";

export default class FeedbackOverview extends PureComponent {
  render() {
    const { numNoAnswers, numNeedsFeedback, numFeedbackGiven } = this.props;
    return (
      <div className="feedback-overview">
        <div>
          <span className="label">Students awaiting feedback</span>
          <span className="value">{numNeedsFeedback}</span>
        </div><div>
          <span className="label">Students scored/provided feedback</span>
          <span className="value">{numFeedbackGiven}</span>
        </div><div>
          <span className="label">Students with no answer</span>
          <span className="value">{numNoAnswers}</span>
        </div>
      </div>
    );
  }
}
