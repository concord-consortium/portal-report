import React from "react";
import { Map } from "immutable";
import { ActivityFeedbackTextarea } from "./activity-feedback-textarea";
import { getFormattedStudentName } from "../../../util/student-utils";
import { RubricTableContainer } from "./rubric-table";
import AwaitingFeedbackActivityBadgeIcon from "../../../../img/svg-icons/awaiting-feedback-activity-badge-icon.svg";
import GivenFeedbackActivityBadgeIcon from "../../../../img/svg-icons/given-feedback-activity-badge-icon.svg";

import css from "../../../../css/portal-dashboard/feedback/feedback-rows.less";

interface IProps {
  activityId: string;
  activityIndex: number;
  feedbacks: Map<any, any>;
  feedbacksNeedingReview: Map<any, any>;
  isAnonymous: boolean;
  rubric: any;
  updateActivityFeedback: (activityId: string, activityIndex: number, platformStudentId: string, feedback: any) => void;
}

export const ActivityLevelFeedbackStudentRows: React.FC<IProps> = (props) => {
  const { activityId, activityIndex, feedbacks, isAnonymous, rubric, updateActivityFeedback } = props;


  const rubricChange = (rubricFeedback: any, studentId: string) => {
    changeFeedback({ rubricFeedback }, studentId);
  };

  const changeFeedback = (newData: any, studentId: string) => {
    const { activityId, activityIndex, updateActivityFeedback } = props;
    activityId && updateActivityFeedback(activityId, activityIndex, studentId, newData);
  };

  const feedbackRows = feedbacks.map((feedbackData: Map<any, any>) => {
    const student = feedbackData.get("student");
    const studentId = student.get("id");
    const formattedName = getFormattedStudentName(isAnonymous, student);
    const activityStarted = feedbackData.get("activityStarted");
    const hasBeenReviewed = feedbackData.get("hasBeenReviewed");
    const feedback = feedbackData.get("feedback");
    const feedbackBadge = hasBeenReviewed ? <GivenFeedbackActivityBadgeIcon /> : <AwaitingFeedbackActivityBadgeIcon />;

    return (
      <div key={activityId + studentId} className={css.feedbackRowsRow} data-cy="feedbackRow">
        <div className={css.studentWrapper}>
          <div className={css.feedbackBadge} data-cy="feedback-badge">
            { activityStarted && feedbackBadge }
          </div>
          <div className={css.studentName} data-cy="student-name">
            {formattedName}
          </div>
        </div>
        <div className={css.feedback} data-cy="feedback-container">
          <ActivityFeedbackTextarea
            activityId={activityId}
            activityIndex={activityIndex}
            activityStarted={activityStarted}
            feedback={feedback}
            key={activityId + studentId + "-textarea"}
            studentId={studentId}
            updateActivityFeedback={updateActivityFeedback}
          />
          {activityStarted &&
            <React.Fragment>
              {hasRubric &&
                <RubricTableContainer
                  rubric={rubric}
                  student={student}
                  rubricFeedback={rubricFeedback}
                  activityId={activityId}
                  activityIndex={activityIndex}
                  rubricChange={rubricChange}
                />
              }
              <ActivityFeedbackTextarea
                key={activityId + studentId + "-textarea"}
                activityId={activityId}
                activityIndex={activityIndex}
                studentId={studentId}
                feedback={feedback}
                updateActivityFeedback={updateActivityFeedback}
              />
            </React.Fragment>

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
