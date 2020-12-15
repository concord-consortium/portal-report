import React from "react";
import { connect } from "react-redux";
import { makeGetAutoScores, makeGetComputedMaxScore } from "../../selectors/activity-feedback-selectors";
import { FeedbackControls } from "../../components/portal-dashboard/feedback-controls";

interface IProps {
  activity: Map<any, any>;
  computedMaxScore: number;
  autoScores: any;
  settings: any;
  rubric: any;
}

class FeedbackSettings extends React.PureComponent<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  render() {
    return (
      <div>
        <FeedbackControls />
      </div>
    );
  }

}

function mapStateToProps() {
  return (state: any, ownProps: any) => {
    const getMaxScore: any = makeGetComputedMaxScore();
    const getAutoscores: any = makeGetAutoScores();
    const computedMaxScore = getMaxScore(state, ownProps);
    const autoScores = getAutoscores(state, ownProps);
    const rubric = state.getIn(["feedback", "settings", "rubric"]);
    return {
      settings: state.getIn(["feedback", "settings"]),
      rubric: rubric && rubric.toJS()
    };
  };
}

export default connect(mapStateToProps)(FeedbackSettings);
