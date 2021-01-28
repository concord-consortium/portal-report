import React from "react";
import { Map } from "immutable";
import Answer from "../../../containers/portal-dashboard/answer";
import { QuestionFeedbackTextarea } from "./question-feedback-textarea";
import { feedbackValidForAnswer } from "../../../util/misc";
import { getFormattedStudentName } from "../../../util/student-utils";
import AwaitingFeedbackQuestionBadgeIcon from "../../../../img/svg-icons/awaiting-feedback-question-badge-icon.svg";
import GivenFeedbackQuestionBadgeIcon from "../../../../img/svg-icons/given-feedback-question-badge-icon.svg";
import UpdateFeedbackQuestionBadgeIcon from "../../../../img/svg-icons/update-feedback-question-badge-icon.svg";
import { TrackEventFunction } from "../../../actions";

import css from "../../../../css/portal-dashboard/feedback/feedback-rows.less";

interface IProps {
  activityId: string | null;
  activityIndex: number;
  answers: Map<any, any>;
  currentQuestion: Map<any, any>;
  feedbacks: Map<any, any>;
  feedbacksNeedingReview: Map<any, any>;
  isAnonymous: boolean;
  students: Map<any, any>;
  updateQuestionFeedback: (answerId: string, feedback: any) => void;
  trackEvent: TrackEventFunction;
}

export const QuestionLevelFeedbackStudentRows: React.FC<IProps> = (props) => {
  const { answers, currentQuestion, feedbacks, isAnonymous, students, activityId, updateQuestionFeedback, trackEvent } = props;

  const getFeedbackIcon = (feedback: string, feedbackData: Map<string, any>, answer: Map<string, any>) => {
    let feedbackBadge = <AwaitingFeedbackQuestionBadgeIcon />;
    if (feedback !== "") {
      feedbackBadge = feedbackValidForAnswer(feedbackData, answer)
                      ? <GivenFeedbackQuestionBadgeIcon />
                      : <UpdateFeedbackQuestionBadgeIcon />;
    }

    return feedbackBadge;
  };

  const feedbackRows = students.map ((student: Map<any, any>, index: number) => {
    const studentId = student.get("id");
    const currentQuestionId = currentQuestion.get("id");
    const formattedName = getFormattedStudentName(isAnonymous, student);
    const answer = answers.getIn([currentQuestionId, studentId]);
    const answerId = answer?.get("id");
    const feedbackData = feedbacks.getIn([answerId]);
    const feedback = feedbackData ? feedbackData.get("feedback") : "";
    const feedbackBadge = getFeedbackIcon(feedback, feedbackData, answer);

    return (
      <div key={currentQuestionId + studentId} className={css.feedbackRowsRow} data-cy="feedbackRow">
        <div className={css.studentWrapper}>
          <div className={css.feedbackBadge} data-cy="feedback-badge">
            { answer && feedbackBadge }
          </div>
          <div className={css.studentName} data-cy="student-name">
            {formattedName}
          </div>
        </div>
        <div className={css.studentResponse}>
          <Answer question={currentQuestion} student={student} responsive={false} studentName={formattedName} />
        </div>
        <div className={css.feedback} data-cy="feedback-container">
          { answer &&
            <QuestionFeedbackTextarea
              answer={answer}
              answerId={answerId}
              feedback={feedback}
              studentId={studentId}
              questionId={currentQuestionId}
              activityId={activityId}
              key={currentQuestionId + studentId + "-textarea"}
              updateQuestionFeedback={updateQuestionFeedback}
              trackEvent={trackEvent}
            />
          }
        </div>
      </div>
    );
  });

  return (
    <div className={css.feedbackRows}>
      {feedbackRows}
    </div>
  );
};
