import React from "react";
import { Map } from "immutable";
import { connect } from "react-redux";
import { trackEvent, TrackEventCategory, TrackEventFunction, TrackEventFunctionOptions, updateActivityFeedback, updateActivityFeedbackSettings } from "../../../actions/index";
import { makeGetStudentFeedbacks, makeGetAutoScores, makeGetComputedMaxScore } from "../../../selectors/activity-feedback-selectors";
import { setFeedbackSortRefreshEnabled } from "../../../actions/dashboard";
import { ActivityLevelFeedbackStudentRows } from "../../../components/portal-dashboard/feedback/activity-level-feedback-student-rows";
import { FeedbackLevel, ListViewMode } from "../../../util/misc";

interface IProps {
  activity: Map<any, any>;
  activityIndex: number;
  autoScores: any;
  computedMaxScore: number;
  feedbackLevel: FeedbackLevel;
  feedbacks: Map<any, any>;
  feedbacksNeedingReview: Map<any, any>;
  feedbacksNotAnswered: number;
  isAnonymous: boolean;
  listViewMode: ListViewMode;
  numFeedbacksGivenReview: number;
  numFeedbacksNeedingReview: number;
  rubric: any;
  setFeedbackSortRefreshEnabled: (value: boolean) => void;
  settings: any;
  students: Map<any, any>;
  updateActivityFeedback: (activityId: string, activityIndex: number, platformStudentId: string, feedback: any) => void;
  updateActivityFeedbackSettings: (activityId: string, activityIndex: number, feedbackFlags: any) => void;
  trackEvent: TrackEventFunction;
}

class ActivityFeedbackPanel extends React.PureComponent<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  componentDidMount() {
    this.updateActivityFeedbackSettings();
  }

  componentDidUpdate(prevProps: IProps) {
    if (prevProps.activityIndex !== this.props.activityIndex) {
      this.updateActivityFeedbackSettings();
    }
  }

  render() {
    const { activity, activityIndex, feedbacks, feedbacksNeedingReview, isAnonymous, rubric, updateActivityFeedback,
            trackEvent } = this.props;
    const currentActivityId = activity?.get("id");

    return (
      <div>
        <ActivityLevelFeedbackStudentRows
          activityId={currentActivityId}
          activityIndex={activityIndex}
          feedbacks={feedbacks}
          feedbacksNeedingReview={feedbacksNeedingReview}
          isAnonymous={isAnonymous}
          rubric={rubric}
          setFeedbackSortRefreshEnabled={this.props.setFeedbackSortRefreshEnabled}
          updateActivityFeedback={updateActivityFeedback}
          trackEvent={trackEvent}
        />
      </div>
    );
  }

  private updateActivityFeedbackSettings = () => {
    const { activity, activityIndex, settings } = this.props;
    const activityId = activity.get("id");
    if (activityId) {
      if (!settings.get("activitySettings")?.get(activityId)?.get("textFeedbackEnabled")) {
        this.props.updateActivityFeedbackSettings(activityId, activityIndex, { textFeedbackEnabled: true });
      }
    }
  }
}

function mapStateToProps() {
  return (state: any, ownProps: any) => {
    const getFeedbacks: any = makeGetStudentFeedbacks();
    const getMaxScore: any = makeGetComputedMaxScore();
    const getAutoscores: any = makeGetAutoScores();
    const {
      feedbacks,
      feedbacksNeedingReview,
      numFeedbacksNeedingReview,
      feedbacksNotAnswered,
    } = getFeedbacks(state, ownProps);
    const numFeedbacksGivenReview = feedbacks.size - numFeedbacksNeedingReview - feedbacksNotAnswered.size;
    const computedMaxScore = getMaxScore(state, ownProps);
    const autoScores = getAutoscores(state, ownProps);
    const rubric = state.getIn(["feedback", "settings", "rubric"]);
    return {
      feedbacks, feedbacksNeedingReview, numFeedbacksNeedingReview, numFeedbacksGivenReview,
      feedbacksNotAnswered, computedMaxScore, autoScores,
      settings: state.getIn(["feedback", "settings"]),
      rubric: rubric && rubric.toJS(),
      activityIndex: ownProps.activity.get("activityIndex"),
    };
  };
}

const mapDispatchToProps = (dispatch: any, ownProps: any): Partial<IProps> => {
  return {
    setFeedbackSortRefreshEnabled: (value) => dispatch(setFeedbackSortRefreshEnabled(value)),
    updateActivityFeedback: (activityId, activityIndex, platformStudentId, feedback) => dispatch(updateActivityFeedback(activityId, activityIndex, platformStudentId, feedback)),
    updateActivityFeedbackSettings: (activityId, activityIndex, feedbackFlags) => dispatch(updateActivityFeedbackSettings(activityId, activityIndex, feedbackFlags)),
    trackEvent: (category: TrackEventCategory, action: string, options?: TrackEventFunctionOptions) => dispatch(trackEvent(category, action, options)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivityFeedbackPanel);
