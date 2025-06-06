import React from "react";
import { Map } from "immutable";
import { connect } from "react-redux";
import { trackEvent, TrackEventCategory, TrackEventFunction, TrackEventFunctionOptions, updateActivityFeedback, updateActivityFeedbackSettings } from "../../../actions/index";
import { makeGetStudentFeedbacks, makeGetAutoScores, makeGetComputedMaxScore } from "../../../selectors/activity-feedback-selectors";
import { setFeedbackSortRefreshEnabled } from "../../../actions/dashboard";
import {
  getDashboardSortBy,
  getSortedStudents,
  getStudentProgress,
  getCurrentActivity,
  getFirstActivity,
  getCompactReport,
} from "../../../selectors/dashboard-selectors";
import { ActivityLevelFeedbackStudentRows } from "../../../components/portal-dashboard/feedback/activity-level-feedback-student-rows";
import { FeedbackLevel, ListViewMode } from "../../../util/misc";
import { Rubric } from "../../../components/portal-dashboard/feedback/rubric-utils";
import { ScoringSettings } from "../../../util/scoring";
import { SortOption } from "../../../reducers/dashboard-reducer";

interface IProps {
  activity: Map<any, any>;
  activityIndex: number;
  autoScores: any;
  computedMaxScore: number;
  feedbackLevel: FeedbackLevel;
  feedbacks: Map<any, any>;
  feedbacksNeedingReview: Map<any, any>;
  feedbacksNotAnswered: number;
  sortByMethod: SortOption;
  hideLastRun: boolean;
  isAnonymous: boolean;
  isCompact: boolean;
  listViewMode: ListViewMode;
  numFeedbacksGivenReview: number;
  numFeedbacksNeedingReview: number;
  rubric: Rubric;
  rubricDocUrl: string;
  setFeedbackSortRefreshEnabled: (value: boolean) => void;
  settings: any;
  activityFeedbackStudents: Map<any, any>;
  scoringSettings: ScoringSettings;
  updateActivityFeedback: (activityId: string, activityIndex: number, platformStudentId: string, feedback: any) => void;
  updateQuestionFeedback: (answerId: string, feedback: any) => void;
  updateActivityFeedbackSettings: (activityId: string, activityIndex: number, feedbackFlags: any) => void;
  trackEvent: TrackEventFunction;
  isResearcher: boolean;
  students: any;
  sortBy: any;
  sortedStudents: any;
  studentProgress: any;
  currentActivity: any;
  firstActivity: any;
  feedback: any;
  compactReport: any;
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
    const { activity, activityIndex, feedbacks, feedbacksNeedingReview, sortByMethod, hideLastRun, isAnonymous, isCompact,
            rubric, updateActivityFeedback, trackEvent, activityFeedbackStudents, scoringSettings, isResearcher, rubricDocUrl } = this.props;
    const currentActivityId = activity?.get("id");

    return (
      <div>
        <ActivityLevelFeedbackStudentRows
          activity={activity}
          activityId={currentActivityId}
          activityIndex={activityIndex}
          feedbacks={feedbacks}
          feedbacksNeedingReview={feedbacksNeedingReview}
          sortByMethod={sortByMethod}
          hideLastRun={hideLastRun}
          isAnonymous={isAnonymous}
          isCompact={isCompact}
          rubric={rubric}
          rubricDocUrl={rubricDocUrl}
          setFeedbackSortRefreshEnabled={this.props.setFeedbackSortRefreshEnabled}
          students={activityFeedbackStudents}
          updateActivityFeedback={updateActivityFeedback}
          trackEvent={trackEvent}
          scoringSettings={scoringSettings}
          isResearcher={isResearcher}
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

const mapStateToProps = (state: any, ownProps: any) => {
  const sortBy = getDashboardSortBy(state);
  const sortedStudents = getSortedStudents(state);
  const studentProgress = getStudentProgress(state);
  const currentActivity = getCurrentActivity(state);
  const firstActivity = getFirstActivity(state);
  const feedback = state.getIn(["feedback"]);
  const compactReport = getCompactReport(state);

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
    students: sortedStudents,
    sortBy,
    sortedStudents,
    studentProgress,
    currentActivity,
    firstActivity,
    feedback,
    compactReport,
    activityFeedbackStudents: sortedStudents,
    feedbacks, feedbacksNeedingReview, numFeedbacksNeedingReview, numFeedbacksGivenReview,
    feedbacksNotAnswered, computedMaxScore, autoScores,
    settings: state.getIn(["feedback", "settings"]),
    rubric: rubric && rubric.toJS(),
    rubricDocUrl: state.getIn(["report", "rubricDocUrl"]),
    activityIndex: ownProps.activity.get("activityIndex"),
  };
};

const mapDispatchToProps = (dispatch: any, ownProps: any): Partial<IProps> => {
  return {
    setFeedbackSortRefreshEnabled: (value) => dispatch(setFeedbackSortRefreshEnabled(value)),
    updateActivityFeedback: (activityId, activityIndex, platformStudentId, feedback) => dispatch(updateActivityFeedback(activityId, activityIndex, platformStudentId, feedback)),
    updateActivityFeedbackSettings: (activityId, activityIndex, feedbackFlags) => dispatch(updateActivityFeedbackSettings(activityId, activityIndex, feedbackFlags)),
    trackEvent: (category: TrackEventCategory, action: string, options?: TrackEventFunctionOptions) => dispatch(trackEvent(category, action, options)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivityFeedbackPanel);
