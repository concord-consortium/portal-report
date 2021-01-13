import React from "react";
import { getFormattedStudentName } from "../../util/student-utils";
import AwaitingFeedbackActivityBadgeIcon from "../../../img/svg-icons/awaiting-feedback-activity-badge-icon.svg";
import GivenFeedbackActivityBadgeIcon from "../../../img/svg-icons/given-feedback-activity-badge-icon.svg";
import UpdateFeedbackQuestionBadgeIcon from "../../../img/svg-icons/update-feedback-question-badge-icon.svg";

import css from "../../../css/portal-dashboard/feedback/feedback-rows.less";

interface IProps {
  feedbacks: Map<any, any>;
  feedbacksNeedingReview: Map<any, any>;
  isAnonymous: boolean;
  updateActivityFeedback: (activityId: string, activityIndex: number, platformStudentId: string, feedback: any) => void;
  activityId: string | null;
  activityIndex: number;
}

export const ActivityLevelFeedbackStudentRows: React.FC<IProps> = (props) => {
  const { feedbacks, isAnonymous, updateActivityFeedback, activityId, activityIndex } = props;

  const onChangeHandler = (studentId: string) => (event: React.FormEvent<HTMLInputElement>) => {
    if (activityId && studentId != null) {
      updateActivityFeedback(activityId, activityIndex, studentId, {feedback: event.target.value});
    }
  };

  const feedbackRows = feedbacks.map ((feedbackData: Map<any, any>, index: number) => {

    const student = feedbackData.get("student");
    const studentId = student.get("id");
    const formattedName = getFormattedStudentName(isAnonymous, student);
    const activityStarted = feedbackData.get("activityStarted");
    const hasBeenReviewed = feedbackData.get("hasBeenReviewed");
    const feedback = feedbackData.get("feedback");

    const awaitingFeedbackIcon = <AwaitingFeedbackActivityBadgeIcon />;
    const givenFeedbackIcon = <GivenFeedbackActivityBadgeIcon />;
    const updateFeedbackIcon = <UpdateFeedbackQuestionBadgeIcon />;

    // TODO: Work out case for when to use UpdateFeedbackBadgeIcon
    let feedbackBadge = awaitingFeedbackIcon;
    if (hasBeenReviewed) {
      feedbackBadge = givenFeedbackIcon;
    }

    return (
      <div key={activityId + index.toString()} className={css.feedbackRows__row}>
        <div className={css.studentWrapper}>
          <div className={css.feedbackBadge}>
            {feedbackBadge}
          </div>
          <div className={css.studentName}>
            {formattedName}
          </div>
        </div>
        <div className={css.feedback}>
          {activityStarted &&
            <textarea defaultValue={feedback} onChange={onChangeHandler(studentId)}></textarea>
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
