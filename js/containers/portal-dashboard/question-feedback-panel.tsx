import React from "react";
import { connect } from "react-redux";
import { updateQuestionFeedback, updateQuestionFeedbackSettings } from "../../actions/index";
import { QuestionLevelFeedbackStudentRows } from "../../components/portal-dashboard/question-level-feedback-student-rows";
import { FeedbackQuestionRows } from "../../components/portal-dashboard/feedback-question-rows";
import { FeedbackLevel } from "../../util/misc";

interface IProps {
  activity: Map<any, any>;
  activities: Map<any, any>;
  feedbacks: Map<any, any>;
  questionFeedbacks: Map<any, any>;
  currentQuestion: Map<any, any>;
  updateQuestionFeedback: (answerId: string, feedback: any) => void;
  updateQuestionFeedbackSettings: (embeddableKey: string, feedbackFlags: any) => void;
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
  isAnonymous: boolean;
  feedbackLevel: FeedbackLevel;
  listViewMode: listViewMode;
  currentStudentId: string | null;
  students: Map<any, any>;
}

class QuestionFeedbackPanel extends React.PureComponent<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  render() {
    const { activity, activities, answers, currentQuestion, questionFeedbacks, feedbacksNeedingReview, isAnonymous, listViewMode, currentStudentId, students, activityIndex } = this.props;
    const currentActivityId = activity?.get("id");

    return (
      <div>
        {listViewMode === "Student"
          ? <QuestionLevelFeedbackStudentRows
              students={students}
              answers={answers}
              currentQuestion={currentQuestion}
              feedbacks={questionFeedbacks}
              feedbacksNeedingReview={feedbacksNeedingReview}
              isAnonymous={isAnonymous}
              updateQuestionFeedback={this.props.updateQuestionFeedback}
              activityId={currentActivityId}
              activityIndex={activityIndex}
            />
          : <FeedbackQuestionRows
              currentActivity={activity}
              answers={answers}
              feedbacks={questionFeedbacks}
              feedbacksNeedingReview={feedbacksNeedingReview}
              currentStudentId={currentStudentId}
              students={students}
              updateQuestionFeedback={this.props.updateQuestionFeedback}
              activityId={currentActivityId}
              activityIndex={activityIndex}
            />
        }
      </div>
    );
  }

}

function mapStateToProps(state: any, ownProps: any): Partial<IProps> {
  return () => {
    return {
      questionFeedbacks: state.getIn(["feedback", "questionFeedbacks"]),
      settings: state.getIn(["feedback", "settings"])
    };
  };
}

const mapDispatchToProps = (dispatch: any, ownProps: any): Partial<IProps> => {
  return {
    updateQuestionFeedback: (answerId, feedback) => dispatch(updateQuestionFeedback(answerId, feedback)),
    updateQuestionFeedbackSettings: (embeddableKey, feedbackFlags) => dispatch(updateQuestionFeedbackSettings(embeddableKey, feedbackFlags)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(QuestionFeedbackPanel);
