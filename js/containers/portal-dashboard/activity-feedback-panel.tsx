import React from "react";
import { connect } from "react-redux";
import { updateActivityFeedback, updateActivityFeedbackSettings } from "../../actions/index";
import { makeGetStudentFeedbacks, makeGetAutoScores, makeGetComputedMaxScore } from "../../selectors/activity-feedback-selectors";
import { FeedbackStudentRows } from "../../components/portal-dashboard/feedback-student-rows";
import { FeedbackQuestionRows } from "../../components/portal-dashboard/feedback-question-rows";
import activity from "../report/activity";

interface IProps {
  activity: Map<any, any>;
  activities: Map<any, any>;
  updateActivityFeedback: (activityId: string, activityIndex: number, platformStudentId: string, feedback: any) => void;
  updateActivityFeedbackSettings: (activityId: string, activityIndex: number, feedbackFlags: any) => void;
  feedbacks: Map<any, any>;
  feedbacksNeedingReview: Map<any, any>;
  numFeedbacksNeedingReview: number;
  numFeedbacksGivenReview: number;
  feedbacksNotAnswered: number;
  computedMaxScore: number;
  autoScores: any;
  settings: any;
  rubric: any;
  activityIndex: number;
  answers: any;
  currentQuestion: any;
  isAnonymous: boolean;
  feedbackLevel: "Activity" | "Question";
  listViewMode: listViewMode;
  currentStudentId: string | null;
  students: Map<any, any>;
}

class ActivityFeedbackPanel extends React.PureComponent<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  render() {
    const { activity, activities, answers, currentQuestion, feedbacks, feedbacksNeedingReview, isAnonymous, feedbackLevel, listViewMode, currentStudentId, students } = this.props;
    return (
      <div>
        {listViewMode === "Student"
          ? <FeedbackStudentRows
              answers={answers}
              currentQuestion={currentQuestion}
              feedbacks={feedbacks}
              feedbacksNeedingReview={feedbacksNeedingReview}
              isAnonymous={isAnonymous}
              feedbackLevel={feedbackLevel}
            />
          : <FeedbackQuestionRows
              activities={activities}
              currentActivity={activity}
              answers={answers}
              currentQuestion={currentQuestion}
              feedbacks={feedbacks}
              feedbacksNeedingReview={feedbacksNeedingReview}
              isAnonymous={isAnonymous}
              feedbackLevel={feedbackLevel}
              currentStudentId={currentStudentId}
              students={students}
            />
        }
      </div>
    );
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
      activityIndex: ownProps.activity.get("activityIndex")
    };
  };
}

const mapDispatchToProps = (dispatch: any, ownProps: any): Partial<IProps> => {
  return {
    updateActivityFeedback: (activityId, activityIndex, platformStudentId, feedback) => dispatch(updateActivityFeedback(activityId, activityIndex, platformStudentId, feedback)),
    updateActivityFeedbackSettings: (activityId, activityIndex, feedbackFlags) => dispatch(updateActivityFeedbackSettings(activityId, activityIndex, feedbackFlags)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivityFeedbackPanel);
