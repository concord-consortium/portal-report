import React from "react";
import { Map } from "immutable";
import Answer from "../../../containers/portal-dashboard/answer";
import { getFormattedStudentName } from "../../../util/student-utils";
import AwaitingFeedbackQuestionBadgeIcon from "../../../../img/svg-icons/awaiting-feedback-question-badge-icon.svg";
import GivenFeedbackQuestionBadgeIcon from "../../../../img/svg-icons/given-feedback-question-badge-icon.svg";
// import UpdateFeedbackQuestionBadgeIcon from "../../../../img/svg-icons/update-feedback-question-badge-icon.svg";

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
}

export const QuestionLevelFeedbackStudentRows: React.FC<IProps> = (props) => {
  const { answers, currentQuestion, feedbacks, isAnonymous, students, updateQuestionFeedback } = props;

  const handleFeedbackChange = (answerId: string) => (event: React.FormEvent<HTMLTextAreaElement>) => {
    if (answerId) {
      const target = event.currentTarget as HTMLTextAreaElement;
      updateQuestionFeedback(answerId, {feedback: target.value});
    }
  };

  const feedbackRows = students.map ((student: Map<any, any>, index: number) => {
    const studentId = student.get("id");
    const currentQuestionId = currentQuestion.get("id");
    const formattedName = getFormattedStudentName(isAnonymous, student);
    const answer = answers.getIn([currentQuestionId, studentId]);
    const answerId = answer?.get("id");
    const feedbackData = feedbacks.getIn([answerId]);
    const feedback = feedbackData ? feedbackData.get("feedback") : "";

    const awaitingFeedbackIcon = <AwaitingFeedbackQuestionBadgeIcon />;
    const givenFeedbackIcon = <GivenFeedbackQuestionBadgeIcon />;
    // const updateFeedbackIcon = <UpdateFeedbackQuestionBadgeIcon />;

    // TODO: Work out case for when to use UpdateFeedbackBadgeIcon
    const feedbackBadge = feedback !== "" ? givenFeedbackIcon : awaitingFeedbackIcon;

    return (
      <div key={currentQuestionId + studentId} className={css.feedbackRows__row}>
        <div className={css.studentWrapper}>
          <div className={css.feedbackBadge}>
            {feedbackBadge}
          </div>
          <div className={css.studentName}>
            {formattedName}
          </div>
        </div>
        <div className={css.studentResponse}>
          <Answer question={currentQuestion} student={student} responsive={false} studentName={formattedName} />
        </div>
        <div className={css.feedback}>
          { answer &&
            <textarea defaultValue={feedback} onChange={handleFeedbackChange(answerId)}></textarea>
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
