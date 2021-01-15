import React from "react";
import { Map } from "immutable";
import { connect } from "react-redux";
import { updateQuestionFeedback, updateQuestionFeedbackSettings } from "../../../actions/index";
import { QuestionLevelFeedbackStudentRows } from "../../../components/portal-dashboard/feedback/question-level-feedback-student-rows";
import { FeedbackQuestionRows } from "../../../components/portal-dashboard/feedback/feedback-question-rows";
import { FeedbackLevel, ListViewMode } from "../../../util/misc";

interface IProps {
  activity: Map<string, any>;
  activityIndex: number;
  answers: any;
  autoScores: any;
  computedMaxScore: number;
  currentQuestion: Map<any, any>;
  currentStudentId: string | null;
  feedbacks: Map<any, any>;
  feedbackLevel: FeedbackLevel;
  feedbacksNeedingReview: Map<any, any>;
  feedbacksNotAnswered: number;
  isAnonymous: boolean;
  listViewMode: ListViewMode;
  numFeedbacksGivenReview: number;
  numFeedbacksNeedingReview: number;
  questionFeedbacks: Map<any, any>;
  rubric: any;
  settings: any;
  students: Map<any, any>;
  updateQuestionFeedback: (answerId: string, feedback: any) => void;
  updateQuestionFeedbackSettings: (embeddableKey: string, feedbackFlags: any) => void;
}

class QuestionFeedbackPanel extends React.PureComponent<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  render() {
    const { activity, activityIndex, answers, currentQuestion, currentStudentId, feedbacksNeedingReview,
            isAnonymous, listViewMode, questionFeedbacks, students } = this.props;
    const currentActivityId = activity?.get("id");

    return (
      <div>
        {listViewMode === "Student"
          ? <QuestionLevelFeedbackStudentRows
              activityId={currentActivityId}
              activityIndex={activityIndex}
              answers={answers}
              currentQuestion={currentQuestion}
              feedbacks={questionFeedbacks}
              feedbacksNeedingReview={feedbacksNeedingReview}
              isAnonymous={isAnonymous}
              students={students}
              updateQuestionFeedback={this.props.updateQuestionFeedback}
            />
          : <FeedbackQuestionRows
              answers={answers}
              currentActivity={activity}
              currentStudentId={currentStudentId}
              feedbacks={questionFeedbacks}
              feedbacksNeedingReview={feedbacksNeedingReview}
              students={students}
              updateQuestionFeedback={this.props.updateQuestionFeedback}
            />
        }
      </div>
    );
  }
}

function mapStateToProps(state: any, ownProps: any): Partial<IProps> {
  return {
      questionFeedbacks: state.getIn(["feedback", "questionFeedbacks"]),
      settings: state.getIn(["feedback", "settings"])
  };
}

const mapDispatchToProps = (dispatch: any, ownProps: any): Partial<IProps> => {
  return {
    updateQuestionFeedback: (answerId, feedback) => dispatch(updateQuestionFeedback(answerId, feedback)),
    updateQuestionFeedbackSettings: (embeddableKey, feedbackFlags) => dispatch(updateQuestionFeedbackSettings(embeddableKey, feedbackFlags)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(QuestionFeedbackPanel);
