import React from "react";
import { Map } from "immutable";
import { ActivityFeedbackTextarea } from "./activity-feedback-textarea";
import { getFormattedStudentName } from "../../../util/student-utils";
import { RubricTableContainer } from "./rubric-table";
import AwaitingFeedbackActivityBadgeIcon from "../../../../img/svg-icons/awaiting-feedback-activity-badge-icon.svg";
import GivenFeedbackActivityBadgeIcon from "../../../../img/svg-icons/given-feedback-activity-badge-icon.svg";
import { SORT_BY_FEEDBACK_PROGRESS } from "../../../actions/dashboard";
import { TrackEventFunction } from "../../../actions";
import { hasRubricFeedback } from "../../../util/activity-feedback-helper";

import css from "../../../../css/portal-dashboard/feedback/feedback-rows.less";

interface IProps {
  activityId: string;
  activityIndex: number;
  feedbacks: Map<any, any>;
  feedbacksNeedingReview: Map<any, any>;
  feedbackSortByMethod: string;
  isAnonymous: boolean;
  rubric: any;
  setFeedbackSortRefreshEnabled: (value: boolean) => void;
  students: Map<any, any>;
  updateActivityFeedback: (activityId: string, activityIndex: number, platformStudentId: string, feedback: any) => void;
  trackEvent: TrackEventFunction;
}

export class ActivityLevelFeedbackStudentRows extends React.PureComponent<IProps>{
  render() {
    const { activityId, activityIndex, feedbacks, feedbackSortByMethod, isAnonymous, rubric, setFeedbackSortRefreshEnabled,
      students, trackEvent, updateActivityFeedback } = this.props;
    const displayedFeedbacks = feedbackSortByMethod !== SORT_BY_FEEDBACK_PROGRESS
      ? feedbacks
      : students.map((student: any) => {
        const feedback = feedbacks.find((f) => f.get("platformStudentId") === student.get("id"));
        return feedback;
      });
    const feedbackRows = displayedFeedbacks.map((feedbackData: Map<any, any>) => {
      const student = feedbackData.get("student");
      const studentId = student.get("id");
      const formattedName = getFormattedStudentName(isAnonymous, student);
      const activityStarted = feedbackData.get("activityStarted");
      const feedback = feedbackData.get("feedback");
      const hasRubric = rubric;
      const { rubricFeedback } = feedbackData.toJS();
      const hasFeedbacks = feedback || hasRubricFeedback(rubric, rubricFeedback);
      const feedbackBadge = hasFeedbacks ? <GivenFeedbackActivityBadgeIcon /> : <AwaitingFeedbackActivityBadgeIcon />;

      return (
        <div key={activityId + studentId} className={css.feedbackRowsRow} data-cy="feedbackRow">
          <div className={css.studentWrapper}>
            <div className={css.feedbackBadge} data-cy="feedback-badge">
              {activityStarted && feedbackBadge}
            </div>
            <div className={css.studentName} data-cy="student-name">
              {formattedName}
            </div>
          </div>
          <div className={css.feedback} data-cy="feedback-container">
            {activityStarted && hasRubric &&
              <RubricTableContainer
                activityId={activityId}
                activityIndex={activityIndex}
                rubric={rubric}
                student={student}
                rubricFeedback={rubricFeedback}
                setFeedbackSortRefreshEnabled={setFeedbackSortRefreshEnabled}
                updateActivityFeedback={updateActivityFeedback}
              />
            }
            <ActivityFeedbackTextarea
              activityId={activityId}
              activityIndex={activityIndex}
              activityStarted={activityStarted}
              feedback={feedback}
              key={activityId + studentId + "-textarea"}
              studentId={studentId}
              setFeedbackSortRefreshEnabled={setFeedbackSortRefreshEnabled}
              updateActivityFeedback={updateActivityFeedback}
              trackEvent={trackEvent}
            />
          </div>
        </div>
      );
    });

    return (
      <div className={css.feedbackRows}>
        {feedbackRows}
      </div>
    );
  }
}
