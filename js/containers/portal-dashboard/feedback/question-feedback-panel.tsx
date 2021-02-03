import React from "react";
import { Map } from "immutable";
import { connect } from "react-redux";
import { trackEvent, TrackEventCategory, TrackEventFunction, TrackEventFunctionOptions, updateQuestionFeedback, updateQuestionFeedbackSettings } from "../../../actions/index";
import { setFeedbackSortRefreshEnabled } from "../../../actions/dashboard";
import { getQuestionFeedbackSortedStudents } from "../../../selectors/dashboard-selectors";
import { QuestionLevelFeedbackStudentRows } from "../../../components/portal-dashboard/feedback/question-level-feedback-student-rows";
import { FeedbackQuestionRows } from "../../../components/portal-dashboard/feedback/feedback-question-rows";
import { FeedbackLevel, ListViewMode } from "../../../util/misc";

interface IProps {
  activity: Map<string, any>;
  activityIndex: number;
  answers: Map<any, any>;
  autoScores: any;
  computedMaxScore: number;
  currentQuestion: Map<any, any>;
  currentStudentId: string | null;
  feedbacks: Map<any, any>;
  feedbackLevel: FeedbackLevel;
  feedbacksNeedingReview: Map<any, any>;
  isAnonymous: boolean;
  listViewMode: ListViewMode;
  questionFeedbacks: Map<any, any>;
  setFeedbackSortRefreshEnabled: (value: boolean) => void;
  settings: any;
  questionFeedbackStudents: Map<any, any>;
  updateQuestionFeedback: (answerId: string, feedback: any) => void;
  updateQuestionFeedbackSettings: (embeddableKey: string, feedbackFlags: any) => void;
  trackEvent: TrackEventFunction;
}

class QuestionFeedbackPanel extends React.PureComponent<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  componentDidMount() {
    this.updateQuestionFeedbackSettings();
  }

  componentDidUpdate(prevProps: IProps) {
    if (prevProps.activity?.get("id") !== this.props.activity?.get("id")) {
      this.updateQuestionFeedbackSettings();
    }
  }

  render() {
    const { activity, activityIndex, answers, currentQuestion, currentStudentId, feedbacksNeedingReview,
            isAnonymous, listViewMode, questionFeedbacks, questionFeedbackStudents, trackEvent } = this.props;
    const currentActivityId = activity?.get("id");

    return (
      <div>
        { listViewMode === "Student"
          ? <QuestionLevelFeedbackStudentRows
              activityId={currentActivityId}
              activityIndex={activityIndex}
              answers={answers}
              currentQuestion={currentQuestion}
              feedbacks={questionFeedbacks}
              feedbacksNeedingReview={feedbacksNeedingReview}
              isAnonymous={isAnonymous}
              setFeedbackSortRefreshEnabled={this.props.setFeedbackSortRefreshEnabled}
              students={questionFeedbackStudents}
              updateQuestionFeedback={this.props.updateQuestionFeedback}
              trackEvent={trackEvent}
            />
          : <FeedbackQuestionRows
              answers={answers}
              currentActivity={activity}
              currentStudentId={currentStudentId}
              feedbacks={questionFeedbacks}
              setFeedbackSortRefreshEnabled={this.props.setFeedbackSortRefreshEnabled}
              students={questionFeedbackStudents}
              updateQuestionFeedback={this.props.updateQuestionFeedback}
              trackEvent={trackEvent}
            />
        }
      </div>
    );
  }

  private updateQuestionFeedbackSettings = () => {
    const questions = this.props.activity.get("questions");
    questions.forEach((question: any) => {
      const questionId = question.get("id");
      if (!this.props.settings.get("questionSettings")?.get(questionId)?.get("feedbackEnabled")) {
        this.props.updateQuestionFeedbackSettings(questionId, { feedbackEnabled: true });
      }
    });
  }
}

function mapStateToProps(state: any, ownProps: any): Partial<IProps> {
  return {
    questionFeedbackStudents: getQuestionFeedbackSortedStudents(state),
    questionFeedbacks: state.getIn(["feedback", "questionFeedbacks"]),
    settings: state.getIn(["feedback", "settings"])
  };
}

const mapDispatchToProps = (dispatch: any, ownProps: any): Partial<IProps> => {
  return {
    setFeedbackSortRefreshEnabled: (value) => dispatch(setFeedbackSortRefreshEnabled(value)),
    updateQuestionFeedback: (answerId, feedback) => dispatch(updateQuestionFeedback(answerId, feedback)),
    updateQuestionFeedbackSettings: (embeddableKey, feedbackFlags) => dispatch(updateQuestionFeedbackSettings(embeddableKey, feedbackFlags)),
    trackEvent: (category: TrackEventCategory, action: string, options?: TrackEventFunctionOptions) => dispatch(trackEvent(category, action, options)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(QuestionFeedbackPanel);
